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
  const { data } = await supabase
    .from("product_catalogus")
    .select("*")
    .eq("id", id)
    .is("geblokkeerd", false)
    .single();

  return data;
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

export async function getAllProductSlugs(): Promise<string[]> {
  const { data } = await supabase
    .from("product_catalogus")
    .select("id, naam, naam_override")
    .is("geblokkeerd", false);

  if (!data) return [];
  return data.map((p) => {
    const name = p.naam_override || p.naam;
    return (
      name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "") + `-${p.id}`
    );
  });
}
