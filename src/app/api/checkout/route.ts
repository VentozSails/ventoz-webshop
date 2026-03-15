import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin, getPaymentConfig } from "@/lib/supabase-admin";
import { createPayNlTransaction, createBuckarooTransaction } from "@/lib/payment";
import { getShippingRate, calculateVat, EU_COUNTRIES } from "@/lib/shipping";

function generateOrderNumber(): string {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, "");
  const seq = String(Math.floor(Math.random() * 9999) + 1).padStart(4, "0");
  return `VTZ-${date}-${seq}`;
}

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Input validation
    if (!body.naam?.trim()) return NextResponse.json({ error: "Name is required" }, { status: 400 });
    if (!body.email?.trim() || !validateEmail(body.email)) return NextResponse.json({ error: "Valid email required" }, { status: 400 });
    if (!body.straat?.trim()) return NextResponse.json({ error: "Street is required" }, { status: 400 });
    if (!body.huisnummer?.trim()) return NextResponse.json({ error: "House number is required" }, { status: 400 });
    if (!body.postcode?.trim()) return NextResponse.json({ error: "Postcode is required" }, { status: 400 });
    if (!body.woonplaats?.trim()) return NextResponse.json({ error: "City is required" }, { status: 400 });
    if (!body.payment_method) return NextResponse.json({ error: "Payment method is required" }, { status: 400 });
    if (!Array.isArray(body.items) || body.items.length === 0) return NextResponse.json({ error: "Cart is empty" }, { status: 400 });

    // Check for reseller discount from ventoz_users
    let kortingPercentage = 0;
    if (body.user_id) {
      const { data: vu } = await supabaseAdmin
        .from("ventoz_users")
        .select("korting_permanent, korting_tijdelijk, korting_geldig_tot")
        .eq("auth_user_id", body.user_id)
        .maybeSingle();
      if (vu) {
        const perm = Number(vu.korting_permanent) || 0;
        const temp = Number(vu.korting_tijdelijk) || 0;
        let effective = perm;
        if (temp > 0 && vu.korting_geldig_tot) {
          const expiry = new Date(vu.korting_geldig_tot);
          if (expiry > new Date()) effective = Math.max(perm, temp);
        }
        if (effective > 0) kortingPercentage = effective;
      }
    }

    // Server-side price calculation from database
    const productIds = body.items.map((i: { product_id: number }) => i.product_id);
    const { data: products } = await supabaseAdmin
      .from("product_catalogus")
      .select("id, prijs, prijs_override, staffelprijzen")
      .in("id", productIds);

    if (!products || products.length !== productIds.length) {
      return NextResponse.json({ error: "Some products not found" }, { status: 400 });
    }

    const priceMap = new Map(products.map((p) => [p.id, p.prijs_override ?? p.prijs]));

    let serverSubtotal = 0;
    const validatedItems = body.items.map((item: { product_id: number; product_naam: string; product_afbeelding: string | null; aantal: number }) => {
      const dbPrice = priceMap.get(item.product_id);
      if (dbPrice == null || dbPrice <= 0) throw new Error(`Invalid price for product ${item.product_id}`);
      const discountedPrice = kortingPercentage > 0
        ? dbPrice * (1 - kortingPercentage / 100)
        : dbPrice;
      const lineTotal = discountedPrice * item.aantal;
      serverSubtotal += lineTotal;
      return {
        ...item,
        stukprijs: dbPrice,
        korting_percentage: kortingPercentage,
        regel_totaal: lineTotal,
      };
    });

    const country = (body.land_code || "NL").toUpperCase();
    const shipping = getShippingRate(country);
    const hasReverseCharge = !!body.btw_nummer && EU_COUNTRIES.has(country) && country !== "NL";
    const vatInfo = calculateVat(serverSubtotal, country, hasReverseCharge);
    const serverTotal = serverSubtotal + vatInfo.vatAmount + shipping.cost;

    const orderNumber = generateOrderNumber();
    const adres = `${body.straat} ${body.huisnummer}`.trim();
    const factuurAdres = body.same_address ? adres : `${body.factuur_straat || ""} ${body.factuur_huisnummer || ""}`.trim();
    const factuurPostcode = body.same_address ? body.postcode : (body.factuur_postcode || body.postcode);
    const factuurWoonplaats = body.same_address ? body.woonplaats : (body.factuur_woonplaats || body.woonplaats);

    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .insert({
        order_nummer: orderNumber,
        user_email: body.email.trim(),
        status: "concept",
        subtotaal: serverSubtotal,
        btw_bedrag: vatInfo.vatAmount,
        btw_percentage: vatInfo.vatRate,
        btw_verlegd: vatInfo.reverseCharged,
        verzendkosten: shipping.cost,
        totaal: serverTotal,
        valuta: "EUR",
        betaal_methode: body.payment_method,
        naam: body.naam.trim(),
        adres,
        postcode: body.postcode.trim(),
        woonplaats: body.woonplaats.trim(),
        land_code: country,
        factuur_adres: factuurAdres,
        factuur_postcode: factuurPostcode,
        factuur_woonplaats: factuurWoonplaats,
        bedrijfsnaam: body.bedrijfsnaam?.trim() || null,
        btw_nummer: body.btw_nummer?.trim() || null,
        opmerkingen: body.opmerkingen?.trim() || null,
      })
      .select("id, order_nummer")
      .single();

    if (orderError || !order) {
      console.error("Order creation failed:", JSON.stringify(orderError, null, 2));
      const detail = orderError?.message || "Unknown database error";
      return NextResponse.json(
        { error: `Failed to create order: ${detail}` },
        { status: 500 }
      );
    }

    const lines = validatedItems.map((item: { product_id: number; product_naam: string; product_afbeelding: string | null; aantal: number; stukprijs: number; korting_percentage: number; regel_totaal: number }) => ({
      order_id: order.id,
      product_id: String(item.product_id),
      product_naam: item.product_naam,
      product_afbeelding: item.product_afbeelding,
      aantal: item.aantal,
      stukprijs: item.stukprijs,
      korting_percentage: item.korting_percentage,
      regel_totaal: item.regel_totaal,
    }));

    await supabaseAdmin.from("order_regels").insert(lines);

    let config;
    try {
      config = await getPaymentConfig();
    } catch (cfgErr) {
      console.error("Payment config fetch failed:", cfgErr);
      config = null;
    }
    if (!config) {
      return NextResponse.json({ error: "Payment not configured — please contact support" }, { status: 500 });
    }

    const returnUrl = `${process.env.NEXT_PUBLIC_SITE_URL || "https://ventoz.com"}/${body.locale || "en"}/checkout/payment?orderId=${order.id}`;

    const amountCents = Math.round(serverTotal * 100);
    let paymentResult;

    if (body.payment_gateway === "buckaroo") {
      const buckarooConfig = config.buckaroo as { website_key: string; secret_key: string; test_mode: boolean };
      paymentResult = await createBuckarooTransaction(buckarooConfig, {
        orderNumber,
        amount: serverTotal,
        returnUrl,
        methodId: body.payment_method,
      });
    } else {
      const payNlConfig = config.pay_nl as { service_id: string; at_code: string; api_token: string; test_mode: boolean };
      paymentResult = await createPayNlTransaction(payNlConfig, {
        orderNumber,
        amountCents,
        returnUrl,
        methodId: body.payment_method,
        customerName: body.naam.trim(),
        customerEmail: body.email.trim(),
        address: {
          street: adres,
          postcode: body.postcode.trim(),
          city: body.woonplaats.trim(),
          countryCode: country,
        },
        items: validatedItems.map((item: { product_id: number; product_naam: string; stukprijs: number; aantal: number }) => ({
          id: String(item.product_id),
          description: item.product_naam,
          priceCents: Math.round(item.stukprijs * 100),
          quantity: item.aantal,
          vatPercentage: vatInfo.vatRate,
        })),
      });
    }

    await supabaseAdmin
      .from("orders")
      .update({
        betaal_referentie: paymentResult.transactionId,
        betaal_gateway: paymentResult.gateway,
        status: "betaling_gestart",
      })
      .eq("id", order.id);

    return NextResponse.json({
      orderId: order.id,
      orderNumber,
      paymentUrl: paymentResult.paymentUrl,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Checkout error:", message);
    return NextResponse.json(
      { error: `Checkout failed: ${message}` },
      { status: 500 }
    );
  }
}
