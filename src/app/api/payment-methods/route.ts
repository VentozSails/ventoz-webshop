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

const PAYNL_NAME_NORMALIZE: Record<string, string> = {
  "overboeking (sct)": "banktransfer",
  "eps uberweisung": "eps",
  "bancontact online": "bancontact",
  "visa mastercard": "creditcard",
  "mobilepay": "mobilepay",
  "wero payment": "wero",
  "vipps payment": "vipps",
  "pay by bank": "paybybank",
  "mb way": "mbway",
};

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
      `https://rest.pay.nl/v2/services/${payNl.service_id}/paymentmethods`,
      {
        headers: { Authorization: `Basic ${auth}`, Accept: "application/json" },
        signal: AbortSignal.timeout(10_000),
      }
    );
    if (!res.ok) return { methods: new Set(), optionIds: {} };

    const data = await res.json();
    const list = data?.paymentMethods;
    if (!Array.isArray(list)) return { methods: new Set(), optionIds: {} };

    const methods = new Set<string>();
    const optionIds: Record<string, number> = {};

    for (const pm of list) {
      if (!pm.active) continue;
      const id = pm.id as number;
      const rawName = ((pm.name as string) || "").toLowerCase();
      const normalized = PAYNL_NAME_NORMALIZE[rawName] || rawName.replace(/[^a-z0-9]/g, "");
      methods.add(normalized);
      optionIds[normalized] = id;
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
    .createHmac("sha256", secretKey)
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
  transfer: "banktransfer",
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

      const methodKey = pref.method_id.toLowerCase();
      const methodKeyClean = methodKey.replace(/[^a-z0-9]/g, "");

      const payNlHas = providers.payNlMethods.has(methodKey) ||
        providers.payNlMethods.has(methodKeyClean);
      const buckarooHas = providers.buckarooMethods.has(methodKey) ||
        providers.buckarooMethods.has(methodKeyClean);

      let chosenGw = pref.preferred_gateway;
      if (chosenGw === "pay_nl" && !payNlHas && buckarooHas) chosenGw = "buckaroo";
      if (chosenGw === "buckaroo" && !buckarooHas && payNlHas) chosenGw = "pay_nl";

      const available = chosenGw === "pay_nl" ? payNlHas : buckarooHas;
      if (!available) continue;

      const paymentOptionId = chosenGw === "pay_nl"
        ? (providers.payNlOptionIds[methodKey] || providers.payNlOptionIds[methodKeyClean])
        : undefined;

      methods.push({
        id: pref.method_id,
        name: pref.display_name,
        gateway: chosenGw,
        ...(paymentOptionId ? { paymentOptionId } : {}),
      });
    }

    return NextResponse.json({ methods });
  } catch (e) {
    console.error("payment-methods error:", e);
    return NextResponse.json({ methods: [], error: "Failed to fetch methods" });
  }
}
