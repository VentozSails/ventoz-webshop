import { supabase } from "./supabase";
import type { Product } from "./types";

export async function getFeaturedProducts(): Promise<Product[]> {
  const { data: featured } = await supabase
    .from("featured_products")
    .select("product_id, sort_order")
    .order("sort_order");

  if (!featured || featured.length === 0) return [];

  const ids = featured.map((f) => f.product_id);

  const { data: products } = await supabase
    .from("product_catalogus")
    .select("*")
    .in("id", ids)
    .eq("in_stock", true)
    .is("geblokkeerd", false);

  if (!products) return [];

  const idOrder = new Map(featured.map((f) => [f.product_id, f.sort_order]));
  return products.sort(
    (a, b) => (idOrder.get(a.id) ?? 99) - (idOrder.get(b.id) ?? 99)
  );
}

export async function getAllProducts(
  category?: string | null,
  search?: string | null
): Promise<Product[]> {
  let query = supabase
    .from("product_catalogus")
    .select("*")
    .is("geblokkeerd", false)
    .order("categorie")
    .order("naam");

  if (category) {
    query = query.eq("categorie", category);
  }

  if (search) {
    query = query.ilike("naam", `%${search}%`);
  }

  const { data } = await query;
  return data ?? [];
}

export async function getProductBySlug(
  slug: string
): Promise<Product | null> {
  const idMatch = slug.match(/-(\d+)$/);
  if (!idMatch) return null;

  const id = parseInt(idMatch[1], 10);
  try {
    const { data } = await supabase
      .from("product_catalogus")
      .select("*")
      .eq("id", id)
      .is("geblokkeerd", false)
      .single();

    if (!data) return null;

    return {
      ...data,
      extra_afbeeldingen: Array.isArray(data.extra_afbeeldingen)
        ? data.extra_afbeeldingen
        : [],
      staffelprijzen:
        data.staffelprijzen && typeof data.staffelprijzen === "object"
          ? data.staffelprijzen
          : null,
      specs_tabel:
        data.specs_tabel && typeof data.specs_tabel === "object"
          ? data.specs_tabel
          : null,
    } as Product;
  } catch {
    return null;
  }
}

export async function getCategories(): Promise<string[]> {
  const { data } = await supabase
    .from("product_catalogus")
    .select("categorie")
    .is("geblokkeerd", false)
    .eq("in_stock", true);

  if (!data) return [];
  const cats = new Set<string>();
  for (const row of data) {
    if (row.categorie) cats.add(row.categorie);
  }
  return Array.from(cats).sort();
}

export async function getAboutTexts(): Promise<Record<string, string>> {
  try {
    const { data, error } = await supabase
      .from("app_settings")
      .select("value")
      .eq("key", "about_text")
      .maybeSingle();

    if (error) {
      console.error("getAboutTexts error:", error.message);
      return {};
    }

    if (data?.value && typeof data.value === "object") {
      return data.value as Record<string, string>;
    }
  } catch (err) {
    console.error("getAboutTexts exception:", err);
  }
  return {};
}

export async function getWebshopHero(): Promise<{ title?: string; subtitle?: string }> {
  try {
    const { data } = await supabase
      .from("app_settings")
      .select("value")
      .eq("key", "webshop_hero")
      .maybeSingle();
    if (data?.value && typeof data.value === "object") {
      return data.value as { title?: string; subtitle?: string };
    }
  } catch {
    // Fallback
  }
  return {};
}

export async function getWebshopUsp(): Promise<Record<string, string>> {
  try {
    const { data } = await supabase
      .from("app_settings")
      .select("value")
      .eq("key", "webshop_usp")
      .maybeSingle();
    if (data?.value && typeof data.value === "object") {
      return data.value as Record<string, string>;
    }
  } catch {
    // Fallback
  }
  return {};
}

export interface ReviewPlatform {
  name: string;
  url: string;
  score: string;
  description: string;
  icon: string;
  embed_url: string;
}

export async function getReviewPlatforms(): Promise<ReviewPlatform[]> {
  try {
    const { data, error } = await supabase
      .from("app_settings")
      .select("value")
      .eq("key", "review_platforms")
      .maybeSingle();

    if (error) {
      console.error("getReviewPlatforms error:", error.message);
      return [];
    }

    if (data?.value && Array.isArray(data.value)) {
      return data.value as ReviewPlatform[];
    }
  } catch (err) {
    console.error("getReviewPlatforms exception:", err);
  }
  return [];
}

const LEGAL_KEY_MAP: Record<string, string> = {
  "terms-of-delivery": "legal_terms",
  privacy: "legal_privacy",
  warranty: "legal_warranty",
  complaints: "legal_complaints",
  returns: "legal_returns",
};

export async function getLegalContent(slug: string): Promise<Record<string, string>> {
  const dbKey = LEGAL_KEY_MAP[slug];
  if (!dbKey) return {};

  try {
    const { data, error } = await supabase
      .from("app_settings")
      .select("value")
      .eq("key", dbKey)
      .maybeSingle();

    if (error) {
      console.error("getLegalContent error:", error.message);
      return {};
    }

    if (data?.value && typeof data.value === "object") {
      return data.value as Record<string, string>;
    }
  } catch (err) {
    console.error("getLegalContent exception:", err);
  }
  return {};
}

export interface CategoryDescriptionRow {
  categorie: string;
  beschrijvingen: Record<string, string> | null;
  beschrijving_nl: string | null;
  beschrijving_en: string | null;
  beschrijving_de: string | null;
  beschrijving_fr: string | null;
}

export async function getCategoryDescriptions(): Promise<
  Record<string, Record<string, string>>
> {
  try {
    const { data, error } = await supabase
      .from("category_descriptions")
      .select(
        "categorie, beschrijvingen, beschrijving_nl, beschrijving_en, beschrijving_de, beschrijving_fr"
      );

    if (error) {
      console.error("getCategoryDescriptions error:", error.message);
      return {};
    }
    if (!data) return {};

    const result: Record<string, Record<string, string>> = {};
    for (const row of data as CategoryDescriptionRow[]) {
      const texts: Record<string, string> = {};

      if (row.beschrijvingen && typeof row.beschrijvingen === "object") {
        for (const [lang, text] of Object.entries(row.beschrijvingen)) {
          if (text) texts[lang] = text;
        }
      }

      if (!texts.nl && row.beschrijving_nl) texts.nl = row.beschrijving_nl;
      if (!texts.en && row.beschrijving_en) texts.en = row.beschrijving_en;
      if (!texts.de && row.beschrijving_de) texts.de = row.beschrijving_de;
      if (!texts.fr && row.beschrijving_fr) texts.fr = row.beschrijving_fr;

      if (Object.keys(texts).length > 0) {
        result[row.categorie] = texts;
      }
    }
    return result;
  } catch (err) {
    console.error("getCategoryDescriptions exception:", err);
    return {};
  }
}

export async function getAllProductSlugs(): Promise<string[]> {
  try {
    const { data } = await supabase
      .from("product_catalogus")
      .select("id, naam, naam_override")
      .is("geblokkeerd", false);

    if (!data) return [];
    return data.map((p) => {
      const name = p.naam_override || p.naam || `product`;
      return (
        name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "") + `-${p.id}`
      );
    });
  } catch {
    return [];
  }
}
