import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { getProductBySlug } from "@/lib/products";
import {
  type Product,
  displayNaam,
  displayBeschrijving,
  displayPrijs,
  displayAfbeelding,
  alleAfbeeldingen,
  prijsFormatted,
  categorieLabel,
} from "@/lib/types";
import ImageGallery from "@/components/ImageGallery";
import AddToCartButton from "@/components/AddToCartButton";
import PriceDisplay from "@/components/PriceDisplay";
import { Link } from "@/i18n/navigation";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}): Promise<Metadata> {
  try {
    const { slug, locale } = await params;
    const t = await getTranslations({ locale, namespace: "meta" });

    let product: Product | null = null;
    try {
      product = await getProductBySlug(slug);
    } catch {
      return { title: "Product | Ventoz Sails" };
    }
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
  } catch {
    return { title: "Product | Ventoz Sails" };
  }
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}) {
  const { slug, locale } = await params;

  let product: Product | null = null;
  try {
    product = await getProductBySlug(slug);
  } catch {
    notFound();
  }
  if (!product) notFound();

  const t = await getTranslations("product");
  const tCat = await getTranslations("categories");
  const tNav = await getTranslations("nav");

  const naam = displayNaam(product, locale);
  const beschrijving = displayBeschrijving(product, locale);
  const prijs = displayPrijs(product);
  const images = alleAfbeeldingen(product);
  const mainImage = displayAfbeelding(product);
  const catLabel = (s: string | null) => {
    try {
      return categorieLabel(s, (k) => tCat.has(k) ? tCat(k) : "");
    } catch {
      return s || "";
    }
  };

  const staffelEntries = (() => {
    try {
      if (!product.staffelprijzen || typeof product.staffelprijzen !== "object") return [];
      return Object.entries(product.staffelprijzen)
        .map(([qty, price]) => [qty, Number(price)] as [string, number])
        .filter(([, p]) => !isNaN(p))
        .sort(([a], [b]) => parseInt(a) - parseInt(b));
    } catch {
      return [];
    }
  })();

  // specs_tabel data is already shown via the individual spec fields above

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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
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

            <div className="mt-4">
              <PriceDisplay prijs={prijs} locale={locale} size="lg" />
            </div>

            {staffelEntries.length > 0 && (
              <div className="mt-4 bg-green-50 border border-green-200 rounded-xl p-4">
                <h3 className="text-[10px] font-bold text-green-800 uppercase tracking-wider mb-2">
                  {t("volumePricing")}
                </h3>
                <div className="space-y-1">
                  {staffelEntries.map(([qty, price]) => (
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
              <AddToCartButton
                productId={product.id}
                naam={naam}
                image={displayAfbeelding(product)}
                prijs={prijs ?? 0}
                categorie={product.categorie}
                inStock={product.in_stock}
              />

              <p className="mt-4 text-[11px] text-slate-400">
                {t("emailAdvice", { email: "info@ventoz.com" })}
              </p>
            </div>

            {(product.materiaal || product.luff || product.foot || product.sail_area || product.gewicht || product.inclusief) && (
              <div className="mt-8">
                <h2 className="font-[family-name:var(--font-display)] text-lg text-navy mb-4">{t("specs")}</h2>
                <div className="bg-white rounded-xl border border-border-default overflow-hidden">
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
                        <div key={spec.label} className="flex justify-between items-center px-5 py-3">
                          <dt className="text-[13px] text-slate-500">{spec.label}</dt>
                          <dd className="text-[13px] font-semibold text-navy text-right max-w-[60%]">{spec.value}</dd>
                        </div>
                      ))}
                  </dl>
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
