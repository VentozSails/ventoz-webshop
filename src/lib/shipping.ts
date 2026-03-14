export interface ShippingRate {
  cost: number;
  deliveryDays: string;
}

const DEFAULT_RATES: Record<string, ShippingRate> = {
  NL: { cost: 0,     deliveryDays: "1-2" },
  BE: { cost: 11.00, deliveryDays: "2-3" },
  DE: { cost: 12.50, deliveryDays: "3-5" },
  AT: { cost: 17.75, deliveryDays: "3-6" },
  FR: { cost: 17.75, deliveryDays: "3-6" },
  LU: { cost: 12.50, deliveryDays: "2-4" },
  DK: { cost: 17.75, deliveryDays: "4-6" },
  ES: { cost: 21.00, deliveryDays: "5-8" },
  IT: { cost: 21.00, deliveryDays: "5-8" },
  PT: { cost: 21.00, deliveryDays: "5-8" },
  SE: { cost: 22.00, deliveryDays: "5-8" },
  FI: { cost: 25.00, deliveryDays: "6-10" },
  PL: { cost: 17.75, deliveryDays: "4-7" },
  CZ: { cost: 17.75, deliveryDays: "4-7" },
  HU: { cost: 19.00, deliveryDays: "5-8" },
  HR: { cost: 19.00, deliveryDays: "5-8" },
  SI: { cost: 17.75, deliveryDays: "4-7" },
  SK: { cost: 17.75, deliveryDays: "4-7" },
  RO: { cost: 22.00, deliveryDays: "6-10" },
  BG: { cost: 22.00, deliveryDays: "6-10" },
  EE: { cost: 22.00, deliveryDays: "5-9" },
  LT: { cost: 22.00, deliveryDays: "5-9" },
  LV: { cost: 22.00, deliveryDays: "5-9" },
  GR: { cost: 25.00, deliveryDays: "6-10" },
  IE: { cost: 22.00, deliveryDays: "5-8" },
  MT: { cost: 28.00, deliveryDays: "7-12" },
  CY: { cost: 28.00, deliveryDays: "7-12" },
  GB: { cost: 25.00, deliveryDays: "8-12" },
  CH: { cost: 25.00, deliveryDays: "5-8" },
  NO: { cost: 25.00, deliveryDays: "5-8" },
  TR: { cost: 32.00, deliveryDays: "8-14" },
  US: { cost: 45.00, deliveryDays: "10-16" },
  CA: { cost: 45.00, deliveryDays: "10-16" },
};

const FALLBACK: ShippingRate = { cost: 32.00, deliveryDays: "5-10" };

export function getShippingRate(countryCode: string): ShippingRate {
  return DEFAULT_RATES[countryCode.toUpperCase()] || FALLBACK;
}

export const EU_COUNTRIES = new Set([
  "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR",
  "DE", "GR", "HU", "IE", "IT", "LV", "LT", "LU", "MT", "NL",
  "PL", "PT", "RO", "SK", "SI", "ES", "SE",
]);

export const EU_VAT_RATES: Record<string, number> = {
  AT: 20, BE: 21, BG: 20, HR: 25, CY: 19, CZ: 21, DK: 25,
  EE: 22, FI: 25.5, FR: 20, DE: 19, GR: 24, HU: 27, IE: 23,
  IT: 22, LV: 21, LT: 21, LU: 17, MT: 18, NL: 21, PL: 23,
  PT: 23, RO: 19, SK: 20, SI: 22, ES: 21, SE: 25,
};

export function calculateVat(
  subtotalExcl: number,
  countryCode: string,
  reverseCharge: boolean
): { vatRate: number; vatAmount: number; reverseCharged: boolean } {
  const cc = countryCode.toUpperCase();

  if (reverseCharge && EU_COUNTRIES.has(cc) && cc !== "NL") {
    return { vatRate: 0, vatAmount: 0, reverseCharged: true };
  }

  if (!EU_COUNTRIES.has(cc)) {
    return { vatRate: 0, vatAmount: 0, reverseCharged: false };
  }

  const rate = EU_VAT_RATES[cc] ?? 21;
  const vatAmount = Math.round(subtotalExcl * rate) / 100;
  return { vatRate: rate, vatAmount, reverseCharged: false };
}

export function priceExclVat(priceInclNlVat: number): number {
  return Math.round((priceInclNlVat / 1.21) * 100) / 100;
}

export const COUNTRY_NAMES: Record<string, string> = {
  NL: "Netherlands", BE: "Belgium", DE: "Germany", FR: "France",
  AT: "Austria", ES: "Spain", IT: "Italy", PT: "Portugal",
  GB: "United Kingdom", CH: "Switzerland", DK: "Denmark", SE: "Sweden",
  NO: "Norway", FI: "Finland", PL: "Poland", CZ: "Czech Republic",
  SK: "Slovakia", HU: "Hungary", RO: "Romania", BG: "Bulgaria",
  HR: "Croatia", SI: "Slovenia", EE: "Estonia", LT: "Lithuania",
  LV: "Latvia", GR: "Greece", IE: "Ireland", MT: "Malta",
  CY: "Cyprus", LU: "Luxembourg", TR: "Turkey",
  US: "United States", CA: "Canada", CN: "China",
  SA: "Saudi Arabia", AE: "United Arab Emirates",
};
