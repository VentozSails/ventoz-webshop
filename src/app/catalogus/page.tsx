import type { Metadata } from "next";
import { getAllProducts, getCategories } from "@/lib/products";
import { categorieLabel } from "@/lib/types";
import ProductCard from "@/components/ProductCard";
import Link from "next/link";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Assortiment",
  description:
    "Bekijk het volledige assortiment zeilen van Ventoz Sails. Van Optimist tot Laser, van Topaz tot Hobie Cat.",
};

export default async function CatalogusPage({
  searchParams,
}: {
  searchParams: Promise<{ categorie?: string; zoek?: string }>;
}) {
  const params = await searchParams;
  const category = params.categorie || null;
  const search = params.zoek || null;

  const [products, categories] = await Promise.all([
    getAllProducts(category, search),
    getCategories(),
  ]);

  const inStock = products.filter((p) => p.in_stock);
  const outOfStock = products.filter((p) => !p.in_stock);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-slate-500 mb-6">
        <Link href="/" className="hover:text-sky-600">
          Home
        </Link>
        <span className="mx-2">/</span>
        <span className="text-slate-900 font-medium">
          {category ? categorieLabel(category) : "Assortiment"}
        </span>
      </nav>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <aside className="lg:w-56 shrink-0">
          <h2 className="font-bold text-sm uppercase tracking-wider text-slate-500 mb-3">
            Categorieën
          </h2>
          <ul className="space-y-1">
            <li>
              <Link
                href="/catalogus"
                className={`block px-3 py-2 text-sm rounded-lg transition-colors ${
                  !category
                    ? "bg-sky-50 text-sky-700 font-semibold"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                Alle producten
              </Link>
            </li>
            {categories.map((cat) => (
              <li key={cat}>
                <Link
                  href={`/catalogus?categorie=${encodeURIComponent(cat)}`}
                  className={`block px-3 py-2 text-sm rounded-lg transition-colors ${
                    category === cat
                      ? "bg-sky-50 text-sky-700 font-semibold"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {categorieLabel(cat)}
                </Link>
              </li>
            ))}
          </ul>

          {/* Search */}
          <div className="mt-6">
            <h2 className="font-bold text-sm uppercase tracking-wider text-slate-500 mb-3">
              Zoeken
            </h2>
            <form action="/catalogus" method="GET">
              {category && (
                <input type="hidden" name="categorie" value={category} />
              )}
              <input
                type="text"
                name="zoek"
                defaultValue={search || ""}
                placeholder="Zoek een zeil..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              />
            </form>
          </div>
        </aside>

        {/* Grid */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-slate-900">
              {category ? categorieLabel(category) : "Alle producten"}
              {search && (
                <span className="text-slate-400 font-normal">
                  {" "}
                  &mdash; &ldquo;{search}&rdquo;
                </span>
              )}
            </h1>
            <span className="text-sm text-slate-500">
              {inStock.length} product{inStock.length !== 1 && "en"}
            </span>
          </div>

          {inStock.length === 0 && outOfStock.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <p className="text-lg">Geen producten gevonden.</p>
              <Link
                href="/catalogus"
                className="mt-4 inline-block text-sky-600 hover:text-sky-700 text-sm font-medium"
              >
                Bekijk alle producten &rarr;
              </Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {inStock.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {outOfStock.length > 0 && (
                <>
                  <h2 className="text-lg font-semibold text-slate-400 mt-12 mb-4">
                    Momenteel niet op voorraad
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 opacity-60">
                    {outOfStock.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
