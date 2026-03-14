import { NextRequest, NextResponse } from "next/server";

interface PaymentMethod {
  id: string;
  name: string;
  gateway: string;
}

const METHODS_BY_COUNTRY: Record<string, PaymentMethod[]> = {
  NL: [
    { id: "ideal", name: "iDEAL", gateway: "pay_nl" },
    { id: "bancontact", name: "Bancontact", gateway: "pay_nl" },
    { id: "creditcard", name: "Credit Card (Visa/Mastercard)", gateway: "buckaroo" },
    { id: "paypal", name: "PayPal", gateway: "buckaroo" },
    { id: "banktransfer", name: "Bank Transfer", gateway: "pay_nl" },
  ],
  BE: [
    { id: "bancontact", name: "Bancontact", gateway: "pay_nl" },
    { id: "ideal", name: "iDEAL", gateway: "pay_nl" },
    { id: "creditcard", name: "Credit Card (Visa/Mastercard)", gateway: "buckaroo" },
    { id: "paypal", name: "PayPal", gateway: "buckaroo" },
  ],
  DE: [
    { id: "sofort", name: "Sofort / Klarna", gateway: "pay_nl" },
    { id: "creditcard", name: "Credit Card (Visa/Mastercard)", gateway: "buckaroo" },
    { id: "paypal", name: "PayPal", gateway: "buckaroo" },
    { id: "banktransfer", name: "Bank Transfer", gateway: "pay_nl" },
  ],
  _default: [
    { id: "creditcard", name: "Credit Card (Visa/Mastercard)", gateway: "buckaroo" },
    { id: "paypal", name: "PayPal", gateway: "buckaroo" },
    { id: "banktransfer", name: "Bank Transfer", gateway: "pay_nl" },
  ],
};

export async function GET(request: NextRequest) {
  const country = request.nextUrl.searchParams.get("country") || "NL";
  const methods = METHODS_BY_COUNTRY[country.toUpperCase()] || METHODS_BY_COUNTRY._default;
  return NextResponse.json({ methods });
}
