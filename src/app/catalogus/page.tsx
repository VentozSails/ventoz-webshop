import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getAllProducts, getCategories } from "@/lib/products";
import { categorieLabel } from "@/lib/types";
import ProductCard from "@/components/ProductCard";

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
    <>
      {/* Catalog header */}
      <div className="bg-gradient-to-r from-navy-dark to-navy py-8">
        <div className="max-w-[1200px] mx-auto px-6 flex items-center gap-4">
          <Image src="/emblem.png" alt="" width={52} height={52} className="w-13 h-13 opacity-80" />
          <div>
            <h1 className="font-[family-name:var(--font-display)] text-[28px] text-white">
              {category ? categorieLabel(category) : "Assortiment"}
            </h1>
            <p className="text-sm text-[#B0C4DE]">
              {category
                ? `Alle ${categorieLabel(category)} zeilen van Ventoz`
                : "Ontdek ons complete aanbod zeilen"}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-6 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <aside className="hidden lg:block w-[220px] shrink-0">
            {/* Search */}
            <form action="/catalogus" method="GET" className="mb-6">
              {category && <input type="hidden" name="categorie" value={category} />}
              <div className="relative">
                <input
                  type="text"
                  name="zoek"
                  defaultValue={search || ""}
                  placeholder="Zoek een zeil..."
                  className="w-full px-3 py-2 border border-border-default rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy/30 focus:border-navy pr-9"
                />
                <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </div>
            </form>

            {/* Categories */}
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Categorieën</h3>
            <ul className="space-y-0.5">
              <li>
                <Link
                  href="/catalogus"
                  className={`flex items-center justify-between px-3 py-2 text-[13px] rounded-lg transition-colors ${
                    !category
                      ? "bg-navy/[0.06] font-bold text-navy"
                      : "font-medium text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  Alle producten
                  <span className="text-[10px] bg-border-default text-slate-500 px-1.5 py-0.5 rounded-full">
                    {products.length}
                  </span>
                </Link>
              </li>
              {categories.map((cat) => (
                <li key={cat}>
                  <Link
                    href={`/catalogus?categorie=${encodeURIComponent(cat)}`}
                    className={`flex items-center justify-between px-3 py-2 text-[13px] rounded-lg transition-colors ${
                      category === cat
                        ? "bg-navy/[0.06] font-bold text-navy"
                        : "font-medium text-slate-500 hover:bg-slate-50"
                    }`}
                  >
                    {categorieLabel(cat)}
                  </Link>
                </li>
              ))}
            </ul>
          </aside>

          {/* Main grid */}
          <div className="flex-1 min-w-0">
            {/* Mobile category chips */}
            <div className="lg:hidden mb-4 overflow-x-auto flex gap-2 pb-2">
              <Link
                href="/catalogus"
                className={`shrink-0 px-3 py-1.5 text-xs font-semibold rounded-full border transition-colors ${
                  !category
                    ? "bg-navy text-white border-navy"
                    : "bg-white text-navy border-border-default hover:border-navy"
                }`}
              >
                Alle
              </Link>
              {categories.map((cat) => (
                <Link
                  key={cat}
                  href={`/catalogus?categorie=${encodeURIComponent(cat)}`}
                  className={`shrink-0 px-3 py-1.5 text-xs font-semibold rounded-full border transition-colors ${
                    category === cat
                      ? "bg-navy text-white border-navy"
                      : "bg-white text-navy border-border-default hover:border-navy"
                  }`}
                >
                  {categorieLabel(cat)}
                </Link>
              ))}
            </div>

            {/* Search indicator */}
            {search && (
              <div className="mb-4 text-sm text-slate-500">
                Resultaten voor &ldquo;<span className="font-semibold text-navy">{search}</span>&rdquo;
                <Link href={category ? `/catalogus?categorie=${encodeURIComponent(category)}` : "/catalogus"} className="ml-2 text-xs text-blue-600 hover:underline">
                  Wissen
                </Link>
              </div>
            )}

            {inStock.length === 0 && outOfStock.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 mx-auto mb-4 bg-card-placeholder rounded-2xl flex items-center justify-center">
                  <svg className="w-8 h-8 text-icon-placeholder" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <p className="text-slate-500 text-sm">Geen producten gevonden.</p>
                <Link href="/catalogus" className="mt-2 inline-block text-xs font-semibold text-navy hover:underline">
                  Bekijk alle producten &rarr;
                </Link>
              </div>
            ) : (
              <>
                {/* 4 cols (>900px), 3 cols (>600px), 2 cols (mobile) — matching Flutter */}
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
                  {inStock.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {outOfStock.length > 0 && (
                  <>
                    <h2 className="text-sm font-bold text-slate-400 mt-10 mb-3 uppercase tracking-wider">
                      Niet op voorraad
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 opacity-50">
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
    </>
  );
}
