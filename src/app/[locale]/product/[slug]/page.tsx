import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { getProductBySlug, getAllProductSlugs } from "@/lib/products";
import {
  displayNaam,
  displayBeschrijving,
  displayPrijs,
  displayAfbeelding,
  alleAfbeeldingen,
  prijsFormatted,
  categorieLabel,
} from "@/lib/types";
import ImageGallery from "@/components/ImageGallery";
import { Link } from "@/i18n/navigation";

export const revalidate = 300;

export async function generateStaticParams() {
  const slugs = await getAllProductSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}): Promise<Metadata> {
  const { slug, locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  const product = await getProductBySlug(slug);
  if (!product) return { title: t("productNotFound") };

  const naam = displayNaam(product, locale);
  const beschrijving = displayBeschrijving(product, locale);
  const img = displayAfbeelding(product);

  return {
    title: product.seo_title || naam,
    description:
      product.seo_description ||
      beschrijving?.slice(0, 160) ||
      `${naam} — Ventoz Sails`,
    keywords: product.seo_keywords || undefined,
    openGraph: {
      title: naam,
      description: beschrijving?.slice(0, 200) || `${naam} — Ventoz Sails`,
      images: img ? [{ url: img, width: 800, height: 800, alt: naam }] : [],
      type: "website",
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}) {
  const { slug, locale } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const t = await getTranslations("product");
  const tCat = await getTranslations("categories");
  const tNav = await getTranslations("nav");

  const naam = displayNaam(product, locale);
  const beschrijving = displayBeschrijving(product, locale);
  const prijs = displayPrijs(product);
  const images = alleAfbeeldingen(product);
  const mainImage = displayAfbeelding(product);
  const catLabel = (s: string | null) => categorieLabel(s, (k) => tCat.has(k) ? tCat(k) : "");

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: naam,
    description: beschrijving,
    image: mainImage,
    brand: { "@type": "Brand", name: "Ventoz Sails" },
    ...(prijs && {
      offers: {
        "@type": "Offer",
        price: prijs,
        priceCurrency: "EUR",
        availability: product.in_stock
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      },
    }),
    ...(product.ean_code && { gtin13: product.ean_code }),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="bg-navy">
        <div className="max-w-[1200px] mx-auto px-6 py-2">
          <Link href="/catalogus" className="text-white/70 text-xs hover:text-white transition-colors flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {tNav("backToProducts")}
          </Link>
        </div>
      </div>

      <div className="bg-card-placeholder border-b border-border-default">
        <div className="max-w-[1200px] mx-auto px-6 py-2.5">
          <nav className="text-[13px] text-slate-500 flex items-center gap-1.5 flex-wrap">
            <Link href="/" className="hover:text-navy transition-colors">{tNav("home")}</Link>
            <span className="text-slate-300">/</span>
            <Link href="/catalogus" className="hover:text-navy transition-colors">{tNav("products")}</Link>
            {product.categorie && (
              <>
                <span className="text-slate-300">/</span>
                <Link href={`/catalogus?categorie=${encodeURIComponent(product.categorie)}`} className="hover:text-navy transition-colors">
                  {catLabel(product.categorie)}
                </Link>
              </>
            )}
            <span className="text-slate-300">/</span>
            <span className="text-navy font-medium">{naam}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <ImageGallery images={images} alt={naam} />

          <div>
            {product.categorie && (
              <Link
                href={`/catalogus?categorie=${encodeURIComponent(product.categorie)}`}
                className="inline-block text-[10px] font-semibold text-navy bg-navy/[0.06] px-2 py-1 rounded uppercase tracking-wider hover:bg-navy/10 transition-colors"
              >
                {catLabel(product.categorie)}
              </Link>
            )}

            <h1 className="mt-3 font-[family-name:var(--font-display)] text-[26px] text-navy leading-tight">
              {naam}
            </h1>

            {product.artikelnummer && (
              <p className="mt-1 text-xs text-slate-400">
                Art.nr: {product.artikelnummer}
              </p>
            )}

            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-[28px] font-bold text-navy">
                {prijsFormatted(product, locale)}
              </span>
              {prijs && <span className="text-xs text-slate-400">{t("exclVat")}</span>}
            </div>

            {product.staffelprijzen && Object.keys(product.staffelprijzen).length > 0 && (
              <div className="mt-4 bg-green-50 border border-green-200 rounded-xl p-4">
                <h3 className="text-[10px] font-bold text-green-800 uppercase tracking-wider mb-2">
                  {t("volumePricing")}
                </h3>
                <div className="space-y-1">
                  {Object.entries(product.staffelprijzen)
                    .sort(([a], [b]) => parseInt(a) - parseInt(b))
                    .map(([qty, price]) => (
                      <div key={qty} className="flex justify-between text-sm">
                        <span className="text-green-700">{t("fromQty", { qty })}</span>
                        <span className="font-semibold text-green-900">
                          &euro; {price.toFixed(2).replace(".", ",")}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            )}

            <div className={`mt-4 inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg ${product.in_stock ? "bg-green-50 text-green-800" : "bg-orange-50 text-orange-800"}`}>
              <span className={`w-2 h-2 rounded-full ${product.in_stock ? "bg-green-500" : "bg-orange-500"}`} />
              {product.in_stock ? t("inStock") : t("outOfStock")}
            </div>

            <div className="mt-6">
              <a
                href={`mailto:info@ventoz.com?subject=${encodeURIComponent(`${t("orderInfo")} ${naam}`)}`}
                className="inline-flex items-center gap-2 bg-gold text-navy font-bold text-sm px-7 py-3.5 rounded-lg hover:brightness-110 transition-all shadow-[0_4px_16px_rgba(200,168,92,0.4)]"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {t("orderInfo")}
              </a>
              <p className="mt-2 text-[11px] text-slate-400">
                {t("emailAdvice", { email: "info@ventoz.com" })}
              </p>
            </div>

            {(product.materiaal || product.luff || product.foot || product.sail_area || product.gewicht || product.inclusief) && (
              <div className="mt-8">
                <h2 className="text-sm font-bold text-navy mb-3">{t("specs")}</h2>
                <dl className="divide-y divide-border-default">
                  {[
                    { label: t("material"), value: product.materiaal },
                    { label: t("luff"), value: product.luff },
                    { label: t("foot"), value: product.foot },
                    { label: t("sailArea"), value: product.sail_area },
                    { label: t("weight"), value: product.gewicht ? `${product.gewicht} kg` : null },
                    { label: t("includes"), value: product.inclusief },
                  ]
                    .filter((s) => s.value)
                    .map((spec) => (
                      <div key={spec.label} className="flex justify-between py-2.5 text-[13px]">
                        <dt className="text-slate-500">{spec.label}</dt>
                        <dd className="font-medium text-slate-800 text-right max-w-[60%]">{spec.value}</dd>
                      </div>
                    ))}
                </dl>
              </div>
            )}

            {product.specs_tabel && Object.keys(product.specs_tabel).length > 0 && (
              <div className="mt-6">
                <h2 className="text-sm font-bold text-navy mb-3">{t("details")}</h2>
                <div className="overflow-x-auto bg-white rounded-lg border border-border-default">
                  <table className="w-full text-[13px]">
                    <thead>
                      <tr className="bg-card-placeholder">
                        {Object.keys(product.specs_tabel).map((key) => (
                          <th key={key} className="px-3 py-2 text-left text-navy-dark font-bold text-[13px]">{key}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        {Object.values(product.specs_tabel).map((val, i) => (
                          <td key={i} className="px-3 py-2 text-slate-600">{String(val ?? "")}</td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {beschrijving && (
              <div className="mt-8">
                <h2 className="font-[family-name:var(--font-display)] text-xl text-navy mb-4">
                  {t("productInfo")}
                </h2>
                <div className="text-sm text-slate-600 leading-7 whitespace-pre-line break-words">
                  {beschrijving}
                </div>
              </div>
            )}

            {product.ean_code && (
              <p className="mt-6 text-xs text-slate-400">
                EAN: {product.ean_code}
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
