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
  naam_en: string | null;
  beschrijving_en: string | null;
}

export function displayNaam(p: Product): string {
  return p.naam_override || p.naam;
}

export function displayBeschrijving(p: Product): string | null {
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
  if (main) all.push(main);
  for (const url of p.extra_afbeeldingen || []) {
    if (url !== main) all.push(url);
  }
  return all;
}

export function productSlug(p: Product): string {
  return displayNaam(p)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    + `-${p.id}`;
}

export function prijsFormatted(p: Product): string {
  const price = displayPrijs(p);
  if (price == null) return "Prijs op aanvraag";
  return `€ ${price.toFixed(2).replace(".", ",")}`;
}

export const CATEGORIES: Record<string, string> = {
  optimist: "Optimist",
  "ventoz-laserzeil": "Laser / ILCA",
  "ventoz-topaz": "Topaz",
  "ventoz-splash": "Splash",
  beachsailing: "Strandzeil",
  "ventoz-centaur": "Centaur",
  "rs-feva": "RS Feva",
  valk: "Polyvalk",
  randmeer: "Randmeer",
  "hobie-cat": "Hobie Cat",
  "ventoz-420-470-sails": "420 / 470",
  efsix: "EFSix",
  sunfish: "Sunfish",
  stormfok: "Stormfok",
  "open-bic": "Open Bic",
  "nacra-17": "Nacra 17",
  "yamaha-seahopper": "Yamaha Seahopper",
  mirror: "Mirror",
  "fox-22": "Fox 22",
  diversen: "Diversen",
};

export function categorieLabel(slug: string | null): string {
  if (!slug) return "Overig";
  return CATEGORIES[slug] || slug;
}
