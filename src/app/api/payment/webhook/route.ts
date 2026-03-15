import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin, getPaymentConfig, sendOrderEmail } from "@/lib/supabase-admin";
import crypto from "crypto";

function verifyPayNlSignature(body: string, signature: string | null, token: string): boolean {
  if (!signature) return false;
  const expected = crypto.createHmac("sha256", token).update(body).digest("hex");
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}

function verifyBuckarooSignature(
  rawBody: string,
  authHeader: string | null,
  secretKey: string
): boolean {
  if (!authHeader) return false;
  const match = authHeader.match(/^hmac\s+(\S+):(\S+):(\S+):(\S+)$/i);
  if (!match) return false;

  const [, websiteKey, receivedHash, nonce, timestamp] = match;

  const contentHash = rawBody
    ? crypto.createHash("md5").update(rawBody).digest("base64")
    : "";

  const rawSignature = `${websiteKey}POST${contentHash}${timestamp}${nonce}`;
  const expectedHash = crypto
    .createHmac("sha256", secretKey)
    .update(rawSignature)
    .digest("base64");

  try {
    return crypto.timingSafeEqual(
      Buffer.from(receivedHash, "base64"),
      Buffer.from(expectedHash, "base64")
    );
  } catch {
    return false;
  }
}

function parseBuckarooStatus(body: Record<string, unknown>): string | null {
  const statusObj = body.Status as Record<string, unknown> | undefined;
  const codeObj = statusObj?.Code as Record<string, unknown> | undefined;
  const code = codeObj?.Code as number | undefined;

  if (!code) return null;
  if (code === 190) return "betaald";
  if ([490, 491, 492, 890, 891].includes(code)) return "geannuleerd";
  return null;
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
    const buckarooAuth = request.headers.get("authorization");

    const isBuckaroo = !!(buckarooAuth?.toLowerCase().startsWith("hmac ") || body.Transaction || body.Key);

    if (!isBuckaroo && payNlSignature && config?.pay_nl) {
      const pConfig = config.pay_nl as { api_token: string };
      if (!verifyPayNlSignature(rawBody, payNlSignature, pConfig.api_token)) {
        console.warn("Webhook: invalid Pay.nl signature");
        return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
      }
    }

    if (isBuckaroo && buckarooAuth && config?.buckaroo) {
      const bConfig = config.buckaroo as { secret_key: string };
      if (!verifyBuckarooSignature(rawBody, buckarooAuth, bConfig.secret_key)) {
        console.warn("Webhook: invalid Buckaroo HMAC signature");
        return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
      }
    }

    let transactionId: string | undefined;
    let newStatus: string | null = null;

    if (isBuckaroo) {
      transactionId =
        (body.Key as string) ||
        ((body.Transaction as Record<string, unknown>)?.Key as string);
      newStatus = parseBuckarooStatus(body);
    } else {
      transactionId = (body.id as string) || (body.orderId as string);
      const statusAction = (body.status as Record<string, unknown>)?.action as string | undefined;
      if (statusAction === "PAID" || statusAction === "PENDING_PROCESSING") newStatus = "betaald";
      else if (statusAction === "FAILED" || statusAction === "CANCELLED") newStatus = "geannuleerd";
    }

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

    if (newStatus) {
      const updates: Record<string, unknown> = { status: newStatus };
      if (newStatus === "betaald") updates.betaald_op = new Date().toISOString();
      await supabaseAdmin.from("orders").update(updates).eq("id", order.id);

      if (newStatus === "betaald") {
        sendOrderEmail(order.id).catch(() => {});
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Webhook error:", err);
    return NextResponse.json({ ok: true });
  }
}
