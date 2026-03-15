import { NextRequest, NextResponse } from "next/server";
import { getPaymentConfig, supabaseAdmin } from "@/lib/supabase-admin";
import crypto from "crypto";

export const dynamic = "force-dynamic";

interface MethodPref {
  method_id: string;
  display_name: string;
  preferred_gateway: string;
  countries: string[];
  enabled: boolean;
  sort_order: number;
}

interface AvailableMethod {
  id: string;
  name: string;
  gateway: string;
  paymentOptionId?: number;
}

let _providerCache: {
  payNlMethods: Set<string>;
  buckarooMethods: Set<string>;
  payNlOptionIds: Record<string, number>;
  ts: number;
} | null = null;

const CACHE_TTL_MS = 5 * 60 * 1000;

async function getPayNlAvailable(
  config: Record<string, unknown>
): Promise<{ methods: Set<string>; optionIds: Record<string, number> }> {
  const payNl = config.pay_nl as {
    service_id?: string;
    at_code?: string;
    api_token?: string;
  } | null;
  if (!payNl?.service_id || !payNl?.at_code || !payNl?.api_token) {
    return { methods: new Set(), optionIds: {} };
  }

  const auth = Buffer.from(`${payNl.at_code}:${payNl.api_token}`).toString("base64");
  try {
    const res = await fetch(
      `https://rest.pay.nl/v2/services/${payNl.service_id}`,
      {
        headers: { Authorization: `Basic ${auth}`, Accept: "application/json" },
        signal: AbortSignal.timeout(10_000),
      }
    );
    if (!res.ok) return { methods: new Set(), optionIds: {} };

    const data = await res.json();
    const options = data?.checkoutOptions;
    if (!Array.isArray(options)) return { methods: new Set(), optionIds: {} };

    const methods = new Set<string>();
    const optionIds: Record<string, number> = {};

    for (const opt of options) {
      const tag = (opt.tag as string || "").toLowerCase();
      if (tag) {
        methods.add(tag);
        optionIds[tag] = opt.id as number;
      }
      const subs = opt.paymentMethods;
      if (Array.isArray(subs)) {
        for (const pm of subs) {
          const name = ((pm.name as string) || "").toLowerCase().replace(/[^a-z0-9]/g, "");
          if (name) methods.add(name);
        }
      }
    }
    return { methods, optionIds };
  } catch {
    return { methods: new Set(), optionIds: {} };
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
  const encodedUri = encodeURIComponent(`${parsed.host}${parsed.pathname}`).toLowerCase();
  const contentHash = body ? crypto.createHash("md5").update(body).digest("base64") : "";
  const rawString = `${websiteKey}${method}${encodedUri}${timestamp}${nonce}${contentHash}`;
  const hmacHash = crypto
    .createHmac("sha256", Buffer.from(secretKey, "base64"))
    .update(rawString)
    .digest("base64");
  return `hmac ${websiteKey}:${hmacHash}:${nonce}:${timestamp}`;
}

const BUCKAROO_SERVICES = [
  "ideal", "creditcard", "paypal", "bancontactmrcash", "sofort",
  "transfer", "giropay", "eps", "applepay",
];

const BUCKAROO_ID_MAP: Record<string, string> = {
  bancontactmrcash: "bancontact",
};

async function getBuckarooAvailable(
  config: Record<string, unknown>
): Promise<Set<string>> {
  const buc = config.buckaroo as {
    website_key?: string;
    secret_key?: string;
    test_mode?: boolean;
  } | null;
  if (!buc?.website_key || !buc?.secret_key) return new Set();

  const testMode = buc.test_mode !== false;
  const available = new Set<string>();

  const checks = BUCKAROO_SERVICES.map(async (svc) => {
    const baseUrl = testMode ? "https://testcheckout.buckaroo.nl" : "https://checkout.buckaroo.nl";
    const url = `${baseUrl}/json/Transaction/Specification/${svc}`;
    try {
      const authHeader = buckarooHmac(buc.website_key!, buc.secret_key!, "GET", url, "");
      const res = await fetch(url, {
        headers: { Authorization: authHeader, Accept: "application/json" },
        signal: AbortSignal.timeout(8_000),
      });
      if (res.ok) {
        available.add(BUCKAROO_ID_MAP[svc] || svc);
      }
    } catch { /* not available */ }
  });

  await Promise.all(checks);
  return available;
}

async function getProviderAvailability(config: Record<string, unknown>) {
  if (_providerCache && Date.now() - _providerCache.ts < CACHE_TTL_MS) {
    return _providerCache;
  }

  const [payNl, buckaroo] = await Promise.all([
    getPayNlAvailable(config),
    getBuckarooAvailable(config),
  ]);

  _providerCache = {
    payNlMethods: payNl.methods,
    buckarooMethods: buckaroo,
    payNlOptionIds: payNl.optionIds,
    ts: Date.now(),
  };

  return _providerCache;
}

export async function GET(request: NextRequest) {
  const country = (request.nextUrl.searchParams.get("country") || "NL").toUpperCase();

  try {
    const [config, prefsResult] = await Promise.all([
      getPaymentConfig(),
      supabaseAdmin
        .from("payment_method_preferences")
        .select("*")
        .eq("enabled", true)
        .order("sort_order"),
    ]);

    if (!config) {
      return NextResponse.json({ methods: [], error: "Payment not configured" });
    }

    const prefs: MethodPref[] = (prefsResult.data || []) as MethodPref[];
    const providers = await getProviderAvailability(config);

    const methods: AvailableMethod[] = [];

    for (const pref of prefs) {
      if (pref.countries.length > 0 && !pref.countries.includes(country)) {
        continue;
      }

      const gw = pref.preferred_gateway;
      const methodKey = pref.method_id.toLowerCase();

      let available = false;
      let paymentOptionId: number | undefined;

      if (gw === "pay_nl") {
        available = providers.payNlMethods.has(methodKey) ||
          providers.payNlMethods.has(methodKey.replace(/[^a-z0-9]/g, ""));
        paymentOptionId = providers.payNlOptionIds[methodKey];
      } else if (gw === "buckaroo") {
        available = providers.buckarooMethods.has(methodKey);
      }

      if (!available) continue;

      methods.push({
        id: pref.method_id,
        name: pref.display_name,
        gateway: gw,
        ...(paymentOptionId ? { paymentOptionId } : {}),
      });
    }

    return NextResponse.json({ methods });
  } catch (e) {
    console.error("payment-methods error:", e);
    return NextResponse.json({ methods: [], error: "Failed to fetch methods" });
  }
}
