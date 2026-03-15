export interface Product {
  id: number;
  naam: string;
  artikelnummer: string | null;
  categorie: string | null;
  prijs: number | null;
  staffelprijzen: Record<string, number> | null;
  beschrijving: string | null;
  afbeelding_url: string | null;
  webshop_url: string | null;
  luff: string | null;
  foot: string | null;
  sail_area: string | null;
  specs_tabel: Record<string, string> | null;
  materiaal: string | null;
  inclusief: string | null;
  in_stock: boolean;
  extra_afbeeldingen: string[];
  gewicht: number | null;
  ean_code: string | null;
  seo_title: string | null;
  seo_description: string | null;
  seo_keywords: string | null;
  canonical_url: string | null;
  og_image: string | null;
  naam_override: string | null;
  beschrijving_override: string | null;
  prijs_override: number | null;
  afbeelding_url_override: string | null;
  translated_specs: Record<string, Record<string, string>> | null;
  [key: `naam_${string}`]: string | null;
  [key: `beschrijving_${string}`]: string | null;
}

export function displayNaam(p: Product, locale = "en"): string {
  if (locale !== "nl") {
    const translated = p[`naam_${locale}`];
    if (typeof translated === "string" && translated) return translated;
    if (locale !== "en") {
      const en = p["naam_en"];
      if (typeof en === "string" && en) return en;
    }
  }
  return p.naam_override || p.naam;
}

export function displayBeschrijving(p: Product, locale = "en"): string | null {
  if (locale !== "nl") {
    const translated = p[`beschrijving_${locale}`];
    if (typeof translated === "string" && translated) return translated;
    if (locale !== "en") {
      const en = p["beschrijving_en"];
      if (typeof en === "string" && en) return en;
    }
  }
  return p.beschrijving_override || p.beschrijving;
}

export function displayPrijs(p: Product): number | null {
  return p.prijs_override ?? p.prijs;
}

export function displayAfbeelding(p: Product): string | null {
  return p.afbeelding_url_override || p.afbeelding_url;
}

export function alleAfbeeldingen(p: Product): string[] {
  const main = displayAfbeelding(p);
  const all: string[] = [];
  if (main && typeof main === "string") all.push(main);
  if (Array.isArray(p.extra_afbeeldingen)) {
    for (const url of p.extra_afbeeldingen) {
      if (typeof url === "string" && url && url !== main) all.push(url);
    }
  }
  return all;
}

export function specForLang(p: Product, field: string, locale = "en"): string | null {
  if (locale !== "nl" && p.translated_specs) {
    const langSpecs = p.translated_specs[locale];
    if (langSpecs && langSpecs[field]) return langSpecs[field];
    if (locale !== "en") {
      const enSpecs = p.translated_specs["en"];
      if (enSpecs && enSpecs[field]) return enSpecs[field];
    }
  }
  if (field === "materiaal") return p.materiaal || null;
  if (field === "inclusief") return p.inclusief || null;
  return null;
}

export function productSlug(p: Product): string {
  return displayNaam(p)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    + `-${p.id}`;
}

export function prijsFormatted(p: Product, locale = "en"): string {
  const price = displayPrijs(p);
  if (price == null) {
    const labels: Record<string, string> = {
      nl: "Prijs op aanvraag", en: "Price on request", de: "Preis auf Anfrage",
      fr: "Prix sur demande", es: "Precio a consultar", it: "Prezzo su richiesta",
      zh: "价格请询", ar: "السعر عند الطلب", tr: "Fiyat talep üzerine",
    };
    return labels[locale] || labels.en!;
  }
  if (locale === "en") return `€ ${price.toFixed(2)}`;
  return `€ ${price.toFixed(2).replace(".", ",")}`;
}

export function categorieLabel(slug: string | null, t?: (key: string) => string): string {
  if (!slug) return t ? t("other") : "Other";
  if (t) return t(slug) || slug;
  return CATEGORIES[slug] || slug;
}

export const CATEGORIES: Record<string, string> = {
  optimist: "Optimist",
  "ventoz-laserzeil": "Laser / ILCA",
  "ventoz-topaz": "Topaz",
  "ventoz-splash": "Splash",
  beachsailing: "Beach Sail",
  "ventoz-centaur": "Centaur",
  "rs-feva": "RS Feva",
  valk: "Polyvalk",
  randmeer: "Randmeer",
  "hobie-cat": "Hobie Cat",
  "ventoz-420-470-sails": "420 / 470",
  efsix: "EFSix",
  sunfish: "Sunfish",
  stormfok: "Storm Jib",
  "open-bic": "Open Bic",
  "nacra-17": "Nacra 17",
  "yamaha-seahopper": "Yamaha Seahopper",
  mirror: "Mirror",
  "fox-22": "Fox 22",
  diversen: "Miscellaneous",
};
