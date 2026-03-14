import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { routing } from "./i18n/routing";
import type { Locale } from "./i18n/routing";

const COUNTRY_TO_LOCALE: Record<string, Locale> = {
  NL: "nl", BE: "nl", SR: "nl",
  DE: "de", AT: "de", CH: "de", LI: "de", LU: "de",
  FR: "fr", MC: "fr",
  ES: "es",
  IT: "it", SM: "it", VA: "it",
  PT: "pt", BR: "pt",
  PL: "pl",
  CZ: "cs",
  SK: "sk",
  HU: "hu",
  RO: "ro", MD: "ro",
  BG: "bg",
  HR: "hr",
  SI: "sl",
  GR: "el", CY: "el",
  DK: "da", GL: "da",
  SE: "sv",
  FI: "fi",
  EE: "et",
  LV: "lv",
  LT: "lt",
  IE: "ga",
  MT: "mt",
  TR: "tr",
  SA: "ar", AE: "ar", EG: "ar", QA: "ar", KW: "ar", BH: "ar", OM: "ar", JO: "ar", LB: "ar", IQ: "ar",
  CN: "zh", TW: "zh", HK: "zh", MO: "zh", SG: "zh",
};

const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // If the URL already has an explicit locale prefix, let next-intl handle it
  const hasExplicitLocale = routing.locales.some(
    (loc) => pathname === `/${loc}` || pathname.startsWith(`/${loc}/`)
  );

  // Only apply geo-detection for first visits without an explicit locale in the URL
  // and without a pre-existing locale cookie
  const localeCookie = request.cookies.get("NEXT_LOCALE")?.value;

  if (!hasExplicitLocale && !localeCookie) {
    const country = request.headers.get("x-vercel-ip-country") || "";
    const detectedLocale = COUNTRY_TO_LOCALE[country.toUpperCase()];

    if (detectedLocale) {
      // Override Accept-Language so next-intl picks this locale
      request.headers.set("Accept-Language", detectedLocale);
    }
  }

  const response = intlMiddleware(request);

  // Forward the country header downstream for debugging/analytics
  const country = request.headers.get("x-vercel-ip-country");
  if (country) {
    response.headers.set("x-detected-country", country);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!api|_next|_vercel|.*\\..*).*)",
  ],
};
