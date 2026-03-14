import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import crypto from "crypto";

async function getPaymentConfig() {
  const { data } = await supabaseAdmin
    .from("app_settings")
    .select("value")
    .eq("key", "payment_config")
    .single();
  return data?.value as Record<string, unknown> | null;
}

function verifyPayNlSignature(body: string, signature: string | null, token: string): boolean {
  if (!signature) return false;
  const expected = crypto.createHmac("sha256", token).update(body).digest("hex");
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    let body: Record<string, unknown>;
    try {
      body = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const config = await getPaymentConfig();

    const payNlSignature = request.headers.get("pay-signature");
    if (payNlSignature && config?.pay_nl) {
      const pConfig = config.pay_nl as { api_token: string };
      if (!verifyPayNlSignature(rawBody, payNlSignature, pConfig.api_token)) {
        console.warn("Webhook: invalid Pay.nl signature");
        return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
      }
    }

    const transactionId =
      (body.id as string) ||
      (body.orderId as string) ||
      (body.Key as string) ||
      ((body.Transaction as Record<string, unknown>)?.Key as string);

    if (!transactionId) {
      return NextResponse.json({ error: "Missing transaction ID" }, { status: 400 });
    }

    const { data: order } = await supabaseAdmin
      .from("orders")
      .select("id, status")
      .eq("betaal_referentie", String(transactionId))
      .single();

    if (!order) {
      console.warn("Webhook: order not found for transaction", transactionId);
      return NextResponse.json({ ok: true });
    }

    if (["betaald", "verzonden", "afgeleverd"].includes(order.status)) {
      return NextResponse.json({ ok: true });
    }

    let newStatus: string | null = null;

    const statusAction = (body.status as Record<string, unknown>)?.action as string | undefined;
    if (statusAction) {
      if (statusAction === "PAID" || statusAction === "PENDING_PROCESSING") newStatus = "betaald";
      else if (statusAction === "FAILED" || statusAction === "CANCELLED") newStatus = "geannuleerd";
    }

    const statusCode = ((body.Status as Record<string, unknown>)?.Code as Record<string, unknown>)?.Code as number | undefined;
    if (statusCode) {
      if (statusCode === 190) newStatus = "betaald";
      else if ([490, 491, 492, 890, 891].includes(statusCode)) newStatus = "geannuleerd";
    }

    if (newStatus) {
      const updates: Record<string, unknown> = { status: newStatus };
      if (newStatus === "betaald") updates.betaald_op = new Date().toISOString();
      await supabaseAdmin.from("orders").update(updates).eq("id", order.id);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Webhook error:", err);
    return NextResponse.json({ ok: true });
  }
}
