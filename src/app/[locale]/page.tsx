import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { getFeaturedProducts, getAboutTexts, getWebshopHero, getWebshopUsp } from "@/lib/products";
import {
  displayNaam,
  displayAfbeelding,
  prijsFormatted,
  productSlug,
  categorieLabel,
} from "@/lib/types";
import ProductSlider from "@/components/ProductSlider";
import { Link } from "@/i18n/navigation";

export const revalidate = 300;

const ABOUT_FALLBACK: Record<string, string> = {
  nl: "Ventoz Sails is een modern Europees zeilmerk, uit Nederland. Wij brengen kwalitatief hoogwaardige \"one design\" zeilen tegen een eerlijke prijs op de gehele Europese markt.",
  en: "Ventoz Sails is a modern European sail brand from the Netherlands. We offer high-quality one design sails at a fair price across the entire European market.",
  de: "Ventoz Sails ist eine moderne europäische Segelmarke aus den Niederlanden. Wir bieten hochwertige One-Design-Segel zu einem fairen Preis auf dem gesamten europäischen Markt an.",
  fr: "Ventoz Sails est une marque européenne moderne de voiles, basée aux Pays-Bas. Nous proposons des voiles one design de haute qualité à un prix équitable sur l'ensemble du marché européen.",
};

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("usp");
  const tNav = await getTranslations("nav");
  const tHero = await getTranslations("hero");
  const tProduct = await getTranslations("product");

  const [featured, aboutTexts, heroData, uspData] = await Promise.all([
    getFeaturedProducts(),
    getAboutTexts(),
    getWebshopHero(),
    getWebshopUsp(),
  ]);

  const fallback = ABOUT_FALLBACK[locale] || ABOUT_FALLBACK["en"] || ABOUT_FALLBACK["nl"];
  const aboutText = aboutTexts[locale] || aboutTexts["en"] || aboutTexts["nl"] || fallback;

  const sliderProducts = featured.map((p) => ({
    slug: productSlug(p),
    naam: displayNaam(p, locale),
    categorie: p.categorie,
    categorieLabel: categorieLabel(p.categorie),
    prijs: prijsFormatted(p, locale),
    image: displayAfbeelding(p),
  }));

  return (
    <>
      {/* Hero — fills viewport below header */}
      <section className="relative overflow-hidden min-h-[calc(100svh-108px)]">
        <div className="absolute inset-0">
          <Image
            src="/hero-bg.png"
            alt=""
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#37474F]/65 via-[#37474F]/45 to-[#37474F]/25" />
        </div>

        <div className="relative max-w-[1100px] mx-auto px-6 lg:px-16 py-10 lg:py-14 min-h-[calc(100svh-108px)] flex items-center">
          <div className="grid grid-cols-1 lg:grid-cols-[5fr_4fr] gap-10 items-stretch w-full">
            <div className="relative bg-white/[0.12] backdrop-blur-sm border border-white/[0.15] rounded-2xl px-7 pt-8 pb-14 flex flex-col">
              {/* Logo — centered with radial glow */}
              <div className="flex justify-center mb-8">
                <div className="relative inline-flex items-center justify-center px-6 py-3">
                  <div
                    className="absolute inset-0 rounded-2xl"
                    style={{
                      background: "radial-gradient(ellipse at center, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.25) 35%, rgba(255,255,255,0.08) 60%, transparent 80%)",
                    }}
                  />
                  <Image
                    src="/logo-hero.png"
                    alt="Ventoz Sails"
                    width={240}
                    height={52}
                    className="h-[52px] w-auto relative"
                    style={{
                      filter: "drop-shadow(0 0 12px rgba(255,255,255,0.7)) drop-shadow(0 0 30px rgba(255,255,255,0.4))",
                    }}
                    priority
                  />
                </div>
              </div>

              {/* About text — left-aligned within logo width */}
              {heroData.title && (
                <h1 className="text-lg font-bold text-white text-center mb-2">{heroData.title}</h1>
              )}
              {heroData.subtitle && (
                <p className="text-xs text-white/70 text-center mb-3">{heroData.subtitle}</p>
              )}
              <p className="text-[15px] text-white/90 leading-[1.85] whitespace-pre-line max-w-[340px] mx-auto text-left flex-1">
                {aboutText}
              </p>

              {/* CTA button */}
              <div className="absolute left-0 right-0 -bottom-6 flex justify-center">
                <Link
                  href="/catalogus"
                  className="inline-flex items-center gap-2 bg-gold text-navy font-bold text-sm px-7 py-4 rounded-lg hover:brightness-110 transition-all shadow-[0_6px_20px_rgba(200,168,92,0.5)]"
                >
                  <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3l14 9-14 9V3z" />
                  </svg>
                  {tHero("cta")}
                </Link>
              </div>
            </div>

            {sliderProducts.length > 0 && (
              <div className="hidden lg:flex flex-col">
                <ProductSlider products={sliderProducts} viewProductLabel={tProduct("viewProduct")} />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* USP bar */}
      <section className="bg-white border-t border-border-default">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-16 py-7">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-y-6 gap-x-4">
            {[
              {
                icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4",
                title: uspData.freeShipping || t("freeShipping"),
                sub: uspData.freeShippingSub || t("freeShippingSub"),
              },
              {
                icon: "M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064",
                title: uspData.euShipping || t("euShipping"),
                sub: uspData.euShippingSub || t("euShippingSub"),
              },
              {
                icon: "M20 7l-8-4-8 4m16 0v10l-8 4M4 7v10l8 4m0-10V7",
                title: uspData.inStock || t("inStock"),
                sub: uspData.inStockSub || t("inStockSub"),
              },
              {
                icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
                title: uspData.quality || t("quality"),
                sub: uspData.qualitySub || t("qualitySub"),
              },
              {
                title: "★★★★★",
                sub: t("reviews"),
                stars: true,
                href: "/reviews" as const,
              },
            ].map((usp, i) => {
              const content = (
                <div className={`flex flex-col items-center text-center gap-2 ${"href" in usp ? "cursor-pointer group" : ""}`}>
                  {"stars" in usp && usp.stars ? (
                    <div className="flex items-center gap-0.5 h-11 group-hover:scale-110 transition-transform">
                      {Array.from({ length: 5 }).map((_, j) => (
                        <svg key={j} className="w-[18px] h-[18px] text-gold" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                      ))}
                    </div>
                  ) : (
                    <div className="w-11 h-11 rounded-xl bg-gold/10 flex items-center justify-center">
                      <svg className="w-[22px] h-[22px] text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={usp.icon} />
                      </svg>
                    </div>
                  )}
                  {"stars" in usp && usp.stars ? null : (
                    <h3 className="text-[13px] font-bold text-navy">{usp.title}</h3>
                  )}
                  <p className="text-[11px] text-slate-500">{usp.sub}</p>
                </div>
              );

              if ("href" in usp && usp.href) {
                return <Link key={i} href={usp.href}>{content}</Link>;
              }
              return <div key={i}>{content}</div>;
            })}
          </div>
        </div>
      </section>
    </>
  );
}
