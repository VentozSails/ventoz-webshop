import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
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

export const revalidate = 300;

export async function generateStaticParams() {
  const slugs = await getAllProductSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product niet gevonden" };

  const naam = displayNaam(product);
  const beschrijving = displayBeschrijving(product);
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
      description:
        beschrijving?.slice(0, 200) || `${naam} — Ventoz Sails`,
      images: img ? [{ url: img, width: 800, height: 800, alt: naam }] : [],
      type: "website",
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const naam = displayNaam(product);
  const beschrijving = displayBeschrijving(product);
  const prijs = displayPrijs(product);
  const images = alleAfbeeldingen(product);
  const mainImage = displayAfbeelding(product);

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="text-sm text-slate-500 mb-6">
          <Link href="/" className="hover:text-sky-600">
            Home
          </Link>
          <span className="mx-2">/</span>
          <Link href="/catalogus" className="hover:text-sky-600">
            Assortiment
          </Link>
          {product.categorie && (
            <>
              <span className="mx-2">/</span>
              <Link
                href={`/catalogus?categorie=${encodeURIComponent(product.categorie)}`}
                className="hover:text-sky-600"
              >
                {categorieLabel(product.categorie)}
              </Link>
            </>
          )}
          <span className="mx-2">/</span>
          <span className="text-slate-900">{naam}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Images */}
          <div>
            <div className="relative aspect-square bg-slate-50 rounded-xl overflow-hidden border border-slate-200">
              {mainImage ? (
                <Image
                  src={mainImage}
                  alt={naam}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-contain p-6"
                  priority
                />
              ) : (
                <div className="flex items-center justify-center h-full text-slate-300">
                  <svg
                    className="w-24 h-24"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="mt-4 grid grid-cols-5 gap-2">
                {images.map((img, i) => (
                  <div
                    key={i}
                    className="relative aspect-square bg-slate-50 rounded-lg overflow-hidden border border-slate-200"
                  >
                    <Image
                      src={img}
                      alt={`${naam} afbeelding ${i + 1}`}
                      fill
                      sizes="100px"
                      className="object-contain p-2"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            {product.categorie && (
              <Link
                href={`/catalogus?categorie=${encodeURIComponent(product.categorie)}`}
                className="text-xs font-semibold text-sky-600 uppercase tracking-wider hover:text-sky-700"
              >
                {categorieLabel(product.categorie)}
              </Link>
            )}
            <h1 className="mt-2 text-3xl font-extrabold text-slate-900 leading-tight">
              {naam}
            </h1>

            {product.artikelnummer && (
              <p className="mt-1 text-sm text-slate-400">
                Art.nr: {product.artikelnummer}
              </p>
            )}

            <div className="mt-4 flex items-baseline gap-3">
              <span className="text-3xl font-extrabold text-slate-900">
                {prijsFormatted(product)}
              </span>
              {prijs && (
                <span className="text-sm text-slate-400">excl. BTW</span>
              )}
            </div>

            {/* Volume discount */}
            {product.staffelprijzen &&
              Object.keys(product.staffelprijzen).length > 0 && (
                <div className="mt-4 bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                  <h3 className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-2">
                    Staffelprijzen
                  </h3>
                  <div className="space-y-1">
                    {Object.entries(product.staffelprijzen)
                      .sort(([a], [b]) => parseInt(a) - parseInt(b))
                      .map(([qty, price]) => (
                        <div
                          key={qty}
                          className="flex justify-between text-sm"
                        >
                          <span className="text-emerald-700">
                            Vanaf {qty} stuks
                          </span>
                          <span className="font-semibold text-emerald-800">
                            &euro;{" "}
                            {price.toFixed(2).replace(".", ",")}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              )}

            {!product.in_stock && (
              <div className="mt-4 inline-flex items-center gap-2 bg-red-50 text-red-700 text-sm font-semibold px-3 py-2 rounded-lg border border-red-200">
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                Momenteel niet op voorraad
              </div>
            )}

            {/* Contact */}
            <div className="mt-6 bg-sky-50 border border-sky-200 rounded-lg p-4">
              <p className="text-sm text-sky-800">
                <strong>Interesse?</strong> Neem contact met ons op via{" "}
                <a
                  href="mailto:info@ventoz.com"
                  className="underline font-semibold"
                >
                  info@ventoz.com
                </a>{" "}
                voor een bestelling of advies.
              </p>
            </div>

            {/* Specs */}
            {(product.materiaal ||
              product.inclusief ||
              product.luff ||
              product.foot ||
              product.sail_area ||
              product.gewicht) && (
              <div className="mt-8">
                <h2 className="text-lg font-bold text-slate-900 mb-3">
                  Specificaties
                </h2>
                <dl className="divide-y divide-slate-100">
                  {[
                    { label: "Materiaal", value: product.materiaal },
                    { label: "Voorlijk (luff)", value: product.luff },
                    { label: "Onderlijk (foot)", value: product.foot },
                    { label: "Zeiloppervlak", value: product.sail_area },
                    {
                      label: "Gewicht",
                      value: product.gewicht
                        ? `${product.gewicht} kg`
                        : null,
                    },
                    { label: "Inclusief", value: product.inclusief },
                  ]
                    .filter((s) => s.value)
                    .map((spec) => (
                      <div
                        key={spec.label}
                        className="flex justify-between py-2 text-sm"
                      >
                        <dt className="text-slate-500">{spec.label}</dt>
                        <dd className="font-medium text-slate-900 text-right max-w-[60%]">
                          {spec.value}
                        </dd>
                      </div>
                    ))}
                </dl>
              </div>
            )}

            {/* Specs table */}
            {product.specs_tabel &&
              Object.keys(product.specs_tabel).length > 0 && (
                <div className="mt-6">
                  <h2 className="text-lg font-bold text-slate-900 mb-3">
                    Details
                  </h2>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <tbody className="divide-y divide-slate-100">
                        {Object.entries(product.specs_tabel).map(
                          ([key, value]) => (
                            <tr key={key}>
                              <td className="py-2 pr-4 text-slate-500 whitespace-nowrap">
                                {key}
                              </td>
                              <td className="py-2 font-medium text-slate-900">
                                {value}
                              </td>
                            </tr>
                          )
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
          </div>
        </div>

        {/* Description */}
        {beschrijving && (
          <section className="mt-12 max-w-3xl">
            <h2 className="text-xl font-bold text-slate-900 mb-4">
              Beschrijving
            </h2>
            <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed whitespace-pre-line">
              {beschrijving}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
