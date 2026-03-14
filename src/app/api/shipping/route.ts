import { NextRequest, NextResponse } from "next/server";
import { getShippingRate, COUNTRY_NAMES } from "@/lib/shipping";

export async function GET(request: NextRequest) {
  const country = request.nextUrl.searchParams.get("country") || "NL";
  const rate = getShippingRate(country);
  return NextResponse.json({
    ...rate,
    countryCode: country.toUpperCase(),
    countryName: COUNTRY_NAMES[country.toUpperCase()] || country,
  });
}
