import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getPayNlStatus, getBuckarooStatus } from "@/lib/payment";

async function getPaymentConfig() {
  const { data } = await supabaseAdmin
    .from("app_settings")
    .select("value")
    .eq("key", "payment_config")
    .single();
  return data?.value as Record<string, unknown> | null;
}

function maskEmail(email: string): string {
  const [user, domain] = email.split("@");
  if (!domain) return "***";
  const maskedUser = user.length > 2 ? user[0] + "***" + user[user.length - 1] : "***";
  return `${maskedUser}@${domain}`;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: orderId } = await params;

    if (!orderId || !/^[0-9a-f-]{36}$/i.test(orderId)) {
      return NextResponse.json({ error: "Invalid order ID" }, { status: 400 });
    }

    const { data: order } = await supabaseAdmin
      .from("orders")
      .select("id, order_nummer, status, betaal_referentie, betaal_methode, totaal, user_email")
      .eq("id", orderId)
      .single();

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (["betaald", "verzonden", "afgeleverd"].includes(order.status)) {
      return NextResponse.json({
        status: "PAID",
        orderNumber: order.order_nummer,
        email: maskEmail(order.user_email),
      });
    }

    if (!order.betaal_referentie) {
      return NextResponse.json({ status: order.status, orderNumber: order.order_nummer });
    }

    const config = await getPaymentConfig();
    if (!config) {
      return NextResponse.json({ status: order.status, orderNumber: order.order_nummer });
    }

    let paymentStatus = "UNKNOWN";

    const isBuckaroo = order.betaal_methode && ["creditcard", "paypal"].includes(order.betaal_methode);

    try {
      if (isBuckaroo && config.buckaroo) {
        const bConfig = config.buckaroo as { website_key: string; secret_key: string; test_mode: boolean };
        paymentStatus = await getBuckarooStatus(bConfig, order.betaal_referentie);
      } else if (config.pay_nl) {
        const pConfig = config.pay_nl as { service_id: string; at_code: string; api_token: string; test_mode: boolean };
        paymentStatus = await getPayNlStatus(pConfig, order.betaal_referentie);
      }
    } catch {
      paymentStatus = "UNKNOWN";
    }

    if (paymentStatus === "PAID" || paymentStatus === "PENDING_PROCESSING") {
      await supabaseAdmin
        .from("orders")
        .update({ status: "betaald", betaald_op: new Date().toISOString() })
        .eq("id", order.id);
    } else if (paymentStatus === "FAILED" || paymentStatus === "CANCELLED") {
      await supabaseAdmin
        .from("orders")
        .update({ status: "geannuleerd" })
        .eq("id", order.id);
    }

    return NextResponse.json({
      status: paymentStatus,
      orderNumber: order.order_nummer,
      email: maskEmail(order.user_email),
    });
  } catch (err) {
    console.error("Payment status error:", err);
    return NextResponse.json({ error: "Failed to check status" }, { status: 500 });
  }
}
