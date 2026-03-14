import "server-only";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function decryptFields(
  config: Record<string, unknown>,
  secretFields: string[]
): Promise<Record<string, unknown>> {
  const hasEncrypted = secretFields.some(
    (f) => typeof config[f] === "string" && (config[f] as string).startsWith("ENC:")
  );
  if (!hasEncrypted) return config;

  try {
    const { data } = await supabaseAdmin.rpc("decrypt_settings_secrets", {
      p_settings: config,
      p_secret_fields: secretFields,
    });
    if (data && typeof data === "object") return data as Record<string, unknown>;
  } catch {
    console.error("Failed to decrypt payment credentials via RPC");
  }
  return config;
}

export async function getPaymentConfig(): Promise<Record<string, unknown> | null> {
  const { data } = await supabaseAdmin
    .from("app_settings")
    .select("value")
    .eq("key", "payment_config")
    .single();

  const raw = data?.value as Record<string, unknown> | null;
  if (!raw) return null;

  if (raw.pay_nl && typeof raw.pay_nl === "object") {
    raw.pay_nl = await decryptFields(
      raw.pay_nl as Record<string, unknown>,
      ["service_secret", "api_token"]
    );
  }
  if (raw.buckaroo && typeof raw.buckaroo === "object") {
    raw.buckaroo = await decryptFields(
      raw.buckaroo as Record<string, unknown>,
      ["secret_key"]
    );
  }

  return raw;
}

export async function sendOrderEmail(orderId: string): Promise<void> {
  try {
    const { error } = await supabaseAdmin.functions.invoke("send-order-email", {
      body: { order_id: orderId },
    });
    if (error) console.error("sendOrderEmail error:", error.message);
  } catch (err) {
    console.error("sendOrderEmail exception:", err);
  }
}
