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
    const { data } = await supabase
      .from("app_settings")
      .select("value")
      .eq("key", "about_text")
      .single();

    if (data?.value && typeof data.value === "object") {
      return data.value as Record<string, string>;
    }
  } catch {
    // Fallback to empty
  }
  return {};
}

export async function getWebshopHero(): Promise<{ title?: string; subtitle?: string }> {
  try {
    const { data } = await supabase
      .from("app_settings")
      .select("value")
      .eq("key", "webshop_hero")
      .single();
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
      .single();
    if (data?.value && typeof data.value === "object") {
      return data.value as Record<string, string>;
    }
  } catch {
    // Fallback
  }
  return {};
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
