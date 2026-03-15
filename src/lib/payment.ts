import crypto from "crypto";

interface PayNlConfig {
  service_id: string;
  at_code: string;
  api_token: string;
  test_mode: boolean;
}

interface BuckarooConfig {
  website_key: string;
  secret_key: string;
  test_mode: boolean;
}

export interface PaymentResult {
  transactionId: string;
  paymentUrl: string;
  gateway: string;
}

const PAYNL_METHOD_MAP: Record<string, number> = {
  ideal: 10,
  bancontact: 436,
  sofort: 559,
  banktransfer: 136,
};

const BUCKAROO_SERVICE_MAP: Record<string, string> = {
  creditcard: "creditcard",
  paypal: "paypal",
  ideal: "ideal",
  bancontact: "bancontactmrcash",
};

export async function createPayNlTransaction(
  config: PayNlConfig,
  order: {
    orderNumber: string;
    amountCents: number;
    returnUrl: string;
    methodId: string;
    customerName: string;
    customerEmail: string;
    address: { street: string; postcode: string; city: string; countryCode: string };
    items: Array<{ id: string; description: string; priceCents: number; quantity: number; vatPercentage: number }>;
  }
): Promise<PaymentResult> {
  const auth = Buffer.from(`${config.at_code}:${config.api_token}`).toString("base64");

  const paymentOptionId = PAYNL_METHOD_MAP[order.methodId];

  const body: Record<string, unknown> = {
    serviceId: config.service_id,
    amount: { value: order.amountCents, currency: "EUR" },
    returnUrl: order.returnUrl,
    reference: order.orderNumber,
    description: `Ventoz order ${order.orderNumber}`,
    optimize: { flow: "fastCheckout", shippingAddress: false, billingAddress: false },
    order: {
      countryCode: order.address.countryCode,
      deliveryAddress: {
        streetName: order.address.street,
        zipCode: order.address.postcode,
        city: order.address.city,
        countryCode: order.address.countryCode,
      },
      products: order.items.map((item) => ({
        id: item.id,
        description: item.description,
        price: { value: item.priceCents },
        quantity: item.quantity,
        vatPercentage: item.vatPercentage,
      })),
    },
    ...(config.test_mode ? { integration: { test: true } } : {}),
  };

  if (paymentOptionId) {
    body.paymentMethod = { id: paymentOptionId };
  }

  const res = await fetch("https://connect.pay.nl/v1/orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${auth}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Pay.nl API error: ${res.status} ${text}`);
  }

  const data = await res.json();
  return {
    transactionId: data.id,
    paymentUrl: data.links?.redirect || data.links?.checkout || "",
    gateway: "pay_nl",
  };
}

export async function getPayNlStatus(
  config: PayNlConfig,
  transactionId: string
): Promise<string> {
  const auth = Buffer.from(`${config.at_code}:${config.api_token}`).toString("base64");

  const res = await fetch(`https://connect.pay.nl/v1/orders/${transactionId}/status`, {
    headers: { Authorization: `Basic ${auth}` },
  });

  if (!res.ok) throw new Error(`Pay.nl status error: ${res.status}`);
  const data = await res.json();
  return data.status?.action || "UNKNOWN";
}

function buckarooHmac(
  config: BuckarooConfig,
  method: string,
  url: string,
  body: string
): string {
  const nonce = crypto.randomBytes(16).toString("hex");
  const timestamp = Math.floor(Date.now() / 1000).toString();

  const parsed = new URL(url);
  const encodedUri = encodeURIComponent(`${parsed.host}${parsed.pathname}`).toLowerCase();

  const contentHash = body
    ? crypto.createHash("md5").update(body).digest("base64")
    : "";

  const rawString = `${config.website_key}${method}${encodedUri}${timestamp}${nonce}${contentHash}`;
  const hmacHash = crypto
    .createHmac("sha256", Buffer.from(config.secret_key, "base64"))
    .update(rawString)
    .digest("base64");

  return `hmac ${config.website_key}:${hmacHash}:${nonce}:${timestamp}`;
}

export async function createBuckarooTransaction(
  config: BuckarooConfig,
  order: {
    orderNumber: string;
    amount: number;
    returnUrl: string;
    methodId: string;
  }
): Promise<PaymentResult> {
  const baseUrl = config.test_mode
    ? "https://testcheckout.buckaroo.nl/json/Transaction"
    : "https://checkout.buckaroo.nl/json/Transaction";

  const serviceName = BUCKAROO_SERVICE_MAP[order.methodId] || order.methodId;

  const body = JSON.stringify({
    Currency: "EUR",
    AmountDebit: order.amount,
    Invoice: order.orderNumber,
    Description: `Ventoz order ${order.orderNumber}`,
    ReturnURL: order.returnUrl,
    ReturnURLCancel: `${order.returnUrl}?status=cancel`,
    ReturnURLError: `${order.returnUrl}?status=error`,
    ReturnURLReject: `${order.returnUrl}?status=reject`,
    Services: {
      ServiceList: [{ Name: serviceName, Action: "Pay" }],
    },
  });

  const authHeader = buckarooHmac(config, "POST", baseUrl, body);

  const res = await fetch(baseUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: authHeader,
    },
    body,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Buckaroo API error: ${res.status} ${text}`);
  }

  const data = await res.json();
  return {
    transactionId: data.Key || "",
    paymentUrl: data.RequiredAction?.RedirectURL || "",
    gateway: "buckaroo",
  };
}

export async function getBuckarooStatus(
  config: BuckarooConfig,
  transactionKey: string
): Promise<string> {
  const url = config.test_mode
    ? `https://testcheckout.buckaroo.nl/json/Transaction/Status/${transactionKey}`
    : `https://checkout.buckaroo.nl/json/Transaction/Status/${transactionKey}`;

  const authHeader = buckarooHmac(config, "GET", url, "");

  const res = await fetch(url, {
    headers: { Authorization: authHeader },
  });

  if (!res.ok) throw new Error(`Buckaroo status error: ${res.status}`);
  const data = await res.json();
  const code = data.Status?.Code?.Code;

  if (code === 190) return "PAID";
  if ([490, 491, 492].includes(code)) return "FAILED";
  if ([790, 791, 792].includes(code)) return "PENDING";
  if ([890, 891].includes(code)) return "CANCELLED";
  return "UNKNOWN";
}
