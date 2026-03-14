import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { getAllProducts, getCategories, getCategoryDescriptions } from "@/lib/products";
import { categorieLabel } from "@/lib/types";
import ProductCard from "@/components/ProductCard";
import { Link } from "@/i18n/navigation";

export const revalidate = 300;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return {
    title: t("catalogTitle"),
    description: t("catalogDescription"),
  };
}

export default async function CatalogusPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ categorie?: string; zoek?: string }>;
}) {
  const { locale } = await params;
  const sp = await searchParams;
  const category = sp.categorie || null;
  const search = sp.zoek || null;

  const t = await getTranslations("catalog");
  const tCat = await getTranslations("categories");
  const tProduct = await getTranslations("product");

  const [products, categories, categoryDescriptions] = await Promise.all([
    getAllProducts(category, search),
    getCategories(),
    getCategoryDescriptions(),
  ]);

  const inStock = products.filter((p) => p.in_stock);
  const outOfStock = products.filter((p) => !p.in_stock);

  const catLabel = (slug: string | null) => categorieLabel(slug, (k) => tCat.has(k) ? tCat(k) : "");

  return (
    <>
      <div className="bg-gradient-to-r from-navy-dark to-navy py-8">
        <div className="max-w-[1200px] mx-auto px-6 flex items-center gap-4">
          <Image src="/emblem.png" alt="" width={52} height={52} className="w-13 h-13 opacity-80" />
          <div>
            <h1 className="font-[family-name:var(--font-display)] text-[28px] text-white">
              {category ? catLabel(category) : t("allProducts")}
            </h1>
            <p className="text-sm text-[#B0C4DE]">
              {category
                ? t("allSails", { category: catLabel(category) })
                : t("subtitle")}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-6 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <aside className="hidden lg:block w-[220px] shrink-0">
            <form action={`/${locale === "nl" ? "" : locale + "/"}catalogus`} method="GET" className="mb-6">
              {category && <input type="hidden" name="categorie" value={category} />}
              <div className="relative">
                <input
                  type="text"
                  name="zoek"
                  defaultValue={search || ""}
                  placeholder={t("searchPlaceholder")}
                  className="w-full px-3 py-2 border border-border-default rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy/30 focus:border-navy pr-9"
                />
                <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </div>
            </form>

            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{t("categories")}</h3>
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
                  {t("allProducts")}
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
                    {catLabel(cat)}
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
                {t("all")}
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
                  {catLabel(cat)}
                </Link>
              ))}
            </div>

            {search && (
              <div className="mb-4 text-sm text-slate-500">
                {t("resultsFor")} &ldquo;<span className="font-semibold text-navy">{search}</span>&rdquo;
                <Link href={category ? `/catalogus?categorie=${encodeURIComponent(category)}` : "/catalogus"} className="ml-2 text-xs text-blue-600 hover:underline">
                  {t("clear")}
                </Link>
              </div>
            )}

            {/* Category description */}
            {category && (() => {
              const texts = categoryDescriptions[category];
              if (!texts) return null;
              const text = texts[locale] || texts.en || texts.nl;
              if (!text) return null;

              return (
                <div className="mb-6 rounded-xl bg-[#F0F4F8] border border-[#E2E8F0] px-5 py-4">
                  <h2 className="font-[family-name:var(--font-display)] text-[22px] text-navy mb-2.5">
                    {catLabel(category)}
                  </h2>
                  {text.split("\n\n").map((block, bi) => {
                    const trimmed = block.trim();
                    if (!trimmed) return null;
                    const lines = trimmed.split("\n");
                    if (lines.length === 2 && lines[0].trim().length < 80) {
                      return (
                        <div key={bi} className={bi > 0 ? "mt-3" : ""}>
                          <p className="text-sm font-bold text-navy leading-snug">{lines[0].trim()}</p>
                          <p className="text-sm text-slate-600 leading-relaxed mt-0.5">{lines[1].trim()}</p>
                        </div>
                      );
                    }
                    return (
                      <p key={bi} className={`text-sm text-slate-600 leading-[1.7] ${bi > 0 ? "mt-3" : ""}`}>
                        {trimmed}
                      </p>
                    );
                  })}
                </div>
              );
            })()}

            {inStock.length === 0 && outOfStock.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 mx-auto mb-4 bg-card-placeholder rounded-2xl flex items-center justify-center">
                  <svg className="w-8 h-8 text-icon-placeholder" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <p className="text-slate-500 text-sm">{t("noProducts")}</p>
                <Link href="/catalogus" className="mt-2 inline-block text-xs font-semibold text-navy hover:underline">
                  {t("viewAll")} &rarr;
                </Link>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
                  {inStock.map((product) => (
                    <ProductCard key={product.id} product={product} locale={locale} />
                  ))}
                </div>

                {outOfStock.length > 0 && (
                  <>
                    <h2 className="text-sm font-bold text-slate-400 mt-10 mb-3 uppercase tracking-wider">
                      {t("outOfStock")}
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 opacity-50">
                      {outOfStock.map((product) => (
                        <ProductCard key={product.id} product={product} locale={locale} />
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
