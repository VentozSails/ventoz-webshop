import { NextRequest, NextResponse } from "next/server";
import { getPaymentConfig } from "@/lib/supabase-admin";
import crypto from "crypto";

export const dynamic = "force-dynamic";

interface AvailableMethod {
  id: string;
  name: string;
  gateway: string;
  paymentOptionId?: number;
}

let _cache: { methods: AvailableMethod[]; ts: number } | null = null;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 min

async function fetchPayNlMethods(
  config: Record<string, unknown>
): Promise<AvailableMethod[]> {
  const payNl = config.pay_nl as {
    service_id?: string;
    at_code?: string;
    api_token?: string;
  } | null;
  if (!payNl?.service_id || !payNl?.at_code || !payNl?.api_token) return [];

  const auth = Buffer.from(`${payNl.at_code}:${payNl.api_token}`).toString(
    "base64"
  );

  try {
    const res = await fetch(
      `https://rest.pay.nl/v2/services/${payNl.service_id}`,
      {
        headers: { Authorization: `Basic ${auth}`, Accept: "application/json" },
        signal: AbortSignal.timeout(10_000),
      }
    );
    if (!res.ok) return [];

    const data = await res.json();
    const options = data?.checkoutOptions;
    if (!Array.isArray(options)) return [];

    const methods: AvailableMethod[] = [];
    for (const opt of options) {
      const subMethods = opt.paymentMethods;
      if (!Array.isArray(subMethods)) continue;
      for (const pm of subMethods) {
        const id = pm.id as number;
        const name = (pm.name as string) || opt.name || `Method ${id}`;
        const slug = slugify(name, id);
        methods.push({
          id: slug,
          name,
          gateway: "pay_nl",
          paymentOptionId: id,
        });
      }
    }
    return methods;
  } catch (e) {
    console.error("fetchPayNlMethods error:", e);
    return [];
  }
}

function buckarooHmac(
  websiteKey: string,
  secretKey: string,
  method: string,
  url: string,
  body: string
): string {
  const nonce = crypto.randomBytes(16).toString("hex");
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const parsed = new URL(url);
  const encodedUri = encodeURIComponent(
    `${parsed.host}${parsed.pathname}`
  ).toLowerCase();
  const contentHash = body
    ? crypto.createHash("md5").update(body).digest("base64")
    : "";
  const rawString = `${websiteKey}${method}${encodedUri}${timestamp}${nonce}${contentHash}`;
  const hmacHash = crypto
    .createHmac("sha256", Buffer.from(secretKey, "base64"))
    .update(rawString)
    .digest("base64");
  return `hmac ${websiteKey}:${hmacHash}:${nonce}:${timestamp}`;
}

const BUCKAROO_KNOWN_SERVICES = [
  { service: "ideal", name: "iDEAL" },
  { service: "creditcard", name: "Credit Card" },
  { service: "paypal", name: "PayPal" },
  { service: "bancontactmrcash", name: "Bancontact" },
  { service: "sofort", name: "Sofort" },
  { service: "transfer", name: "Bank Transfer" },
  { service: "giropay", name: "Giropay" },
  { service: "eps", name: "EPS" },
  { service: "applepay", name: "Apple Pay" },
];

async function fetchBuckarooMethods(
  config: Record<string, unknown>
): Promise<AvailableMethod[]> {
  const buc = config.buckaroo as {
    website_key?: string;
    secret_key?: string;
    test_mode?: boolean;
  } | null;
  if (!buc?.website_key || !buc?.secret_key) return [];

  const testMode = buc.test_mode !== false;
  const methods: AvailableMethod[] = [];

  for (const svc of BUCKAROO_KNOWN_SERVICES) {
    const baseUrl = testMode
      ? "https://testcheckout.buckaroo.nl"
      : "https://checkout.buckaroo.nl";
    const url = `${baseUrl}/json/Transaction/Specification/${svc.service}`;

    try {
      const authHeader = buckarooHmac(
        buc.website_key,
        buc.secret_key,
        "GET",
        url,
        ""
      );
      const res = await fetch(url, {
        headers: {
          Authorization: authHeader,
          Accept: "application/json",
        },
        signal: AbortSignal.timeout(8_000),
      });
      if (res.ok) {
        methods.push({
          id: svc.service === "bancontactmrcash" ? "bancontact" : svc.service,
          name: svc.name,
          gateway: "buckaroo",
        });
      }
    } catch {
      // service not available
    }
  }

  return methods;
}

function slugify(name: string, id: number): string {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return slug || `method-${id}`;
}

function deduplicateMethods(
  payNl: AvailableMethod[],
  buckaroo: AvailableMethod[]
): AvailableMethod[] {
  const seen = new Map<string, AvailableMethod>();

  for (const m of payNl) {
    const key = normalizeMethodKey(m.id);
    if (!seen.has(key)) seen.set(key, m);
  }

  for (const m of buckaroo) {
    const key = normalizeMethodKey(m.id);
    if (!seen.has(key)) {
      seen.set(key, m);
    }
  }

  return Array.from(seen.values());
}

function normalizeMethodKey(id: string): string {
  const aliases: Record<string, string> = {
    "bancontactmrcash": "bancontact",
    "bancontact-mrcash": "bancontact",
    "visa-mastercard": "creditcard",
    "credit-card": "creditcard",
    transfer: "banktransfer",
  };
  return aliases[id] || id;
}

export async function GET(request: NextRequest) {
  const country = (
    request.nextUrl.searchParams.get("country") || "NL"
  ).toUpperCase();

  if (_cache && Date.now() - _cache.ts < CACHE_TTL_MS) {
    return NextResponse.json({ methods: _cache.methods, cached: true });
  }

  try {
    const config = await getPaymentConfig();
    if (!config) {
      return NextResponse.json({ methods: [], error: "No payment config" });
    }

    const [payNlMethods, buckarooMethods] = await Promise.all([
      fetchPayNlMethods(config),
      fetchBuckarooMethods(config),
    ]);

    const all = deduplicateMethods(payNlMethods, buckarooMethods);

    _cache = { methods: all, ts: Date.now() };

    return NextResponse.json({ methods: all });
  } catch (e) {
    console.error("payment-methods error:", e);
    return NextResponse.json({ methods: [], error: "Failed to fetch methods" });
  }
}
