import "server-only";
import { createClient } from "@supabase/supabase-js";
import { createDecipheriv } from "crypto";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

let _cachedVaultKey: string | null = null;

async function getVaultKey(): Promise<string | null> {
  if (_cachedVaultKey) return _cachedVaultKey;
  try {
    const { data } = await supabaseAdmin
      .from("vault_keys")
      .select("encryption_key")
      .eq("id", 1)
      .maybeSingle();
    _cachedVaultKey = data?.encryption_key ?? null;
    return _cachedVaultKey;
  } catch {
    return null;
  }
}

function decryptValue(encrypted: string, keyBase64: string): string {
  const payload = encrypted.slice(4); // strip "ENC:"
  const parts = payload.split(":");
  if (parts.length !== 2) return encrypted;

  const iv = Buffer.from(parts[0], "base64");
  const data = Buffer.from(parts[1], "base64");
  const key = Buffer.from(keyBase64, "base64");

  const decipher = createDecipheriv("aes-256-cbc", key, iv);
  decipher.setAutoPadding(true);
  return Buffer.concat([decipher.update(data), decipher.final()]).toString("utf8");
}

export async function decryptFields(
  config: Record<string, unknown>,
  secretFields: string[]
): Promise<Record<string, unknown>> {
  const hasEncrypted = secretFields.some(
    (f) => typeof config[f] === "string" && (config[f] as string).startsWith("ENC:")
  );
  if (!hasEncrypted) return config;

  const vaultKey = await getVaultKey();
  if (!vaultKey) {
    console.error("Cannot decrypt: vault key not found");
    return config;
  }

  const result = { ...config };
  for (const field of secretFields) {
    const val = result[field];
    if (typeof val === "string" && val.startsWith("ENC:")) {
      try {
        result[field] = decryptValue(val, vaultKey);
      } catch (e) {
        console.error(`Decryption failed for field ${field}:`, e);
      }
    }
  }
  return result;
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
