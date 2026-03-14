import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { getAboutTexts, getReviewPlatforms } from "@/lib/products";
import { Link } from "@/i18n/navigation";
import ReviewEmbed from "@/components/ReviewEmbed";

export const dynamic = "force-dynamic";

const ABOUT_FALLBACK: Record<string, string> = {
  nl: 'Ventoz Sails is een modern Europees zeilmerk, uit Nederland. Wij brengen kwalitatief hoogwaardige "one design" zeilen tegen een eerlijke prijs op de gehele Europese markt.',
  en: "Ventoz Sails is a modern European sail brand from the Netherlands. We offer high-quality one design sails at a fair price across the entire European market.",
  de: "Ventoz Sails ist eine moderne europäische Segelmarke aus den Niederlanden. Wir bieten hochwertige One-Design-Segel zu einem fairen Preis auf dem gesamten europäischen Markt an.",
  fr: "Ventoz Sails est une marque européenne moderne de voiles, basée aux Pays-Bas. Nous proposons des voiles one design de haute qualité à un prix équitable sur l'ensemble du marché européen.",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "about" });
  return {
    title: `${t("title")} | Ventoz Sails`,
    description:
      ABOUT_FALLBACK[locale] || ABOUT_FALLBACK["en"] || ABOUT_FALLBACK["nl"],
  };
}

const PLATFORM_ICONS: Record<string, string> = {
  ebay: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z",
  star: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
  shield:
    "M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z",
};

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("about");
  const tNav = await getTranslations("nav");

  const [aboutTexts, platforms] = await Promise.all([
    getAboutTexts(),
    getReviewPlatforms(),
  ]);

  const fallback =
    ABOUT_FALLBACK[locale] || ABOUT_FALLBACK["en"] || ABOUT_FALLBACK["nl"];
  const aboutText =
    aboutTexts[locale] || aboutTexts["en"] || aboutTexts["nl"] || fallback;

  return (
    <>
      {/* Breadcrumb */}
      <div className="bg-card-placeholder border-b border-border-default">
        <div className="max-w-[1100px] mx-auto px-6 py-2.5">
          <nav className="text-[13px] text-slate-500 flex items-center gap-1.5">
            <Link
              href="/"
              className="hover:text-navy transition-colors"
            >
              {tNav("home")}
            </Link>
            <span className="text-slate-300">/</span>
            <span className="text-navy font-medium">{t("title")}</span>
          </nav>
        </div>
      </div>

      {/* Hero with logo + about text */}
      <section className="relative overflow-hidden bg-navy">
        <div className="absolute inset-0 opacity-20">
          <Image
            src="/hero-bg.png"
            alt=""
            fill
            className="object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-navy/80 via-navy/90 to-navy" />

        <div className="relative max-w-[700px] mx-auto px-6 py-16 lg:py-24">
          {/* Logo with glow — centered */}
          <div className="flex justify-center mb-10">
            <div
              className="relative inline-block px-4 py-2"
              style={{
                filter:
                  "drop-shadow(0 0 28px rgba(255,255,255,0.6)) drop-shadow(0 0 50px rgba(255,255,255,0.35)) drop-shadow(0 0 80px rgba(255,255,255,0.15))",
              }}
            >
              <Image
                src="/logo-hero.png"
                alt="Ventoz Sails"
                width={280}
                height={62}
                className="h-[56px] w-auto"
                priority
              />
            </div>
          </div>

          {/* About text — left-aligned, constrained to logo width */}
          <div className="max-w-[520px] mx-auto">
            <p className="text-[15px] text-white/90 leading-8 whitespace-pre-line">
              {aboutText}
            </p>
          </div>

          {/* CTA */}
          <div className="flex justify-center mt-10">
            <Link
              href="/catalogus"
              className="inline-flex items-center gap-2 bg-gold text-navy font-bold text-sm px-8 py-4 rounded-lg hover:brightness-110 transition-all shadow-[0_6px_20px_rgba(200,168,92,0.5)]"
            >
              <svg
                className="w-[18px] h-[18px]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 3l14 9-14 9V3z"
                />
              </svg>
              {t("ctaCatalog")}
            </Link>
          </div>
        </div>
      </section>

      {/* Reviews section */}
      {platforms.length > 0 && (
        <section className="bg-white py-16">
          <div className="max-w-[1100px] mx-auto px-6">
            {/* Section header */}
            <div className="text-center mb-12">
              <div className="flex items-center justify-center gap-1 mb-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <svg
                    key={i}
                    className="w-5 h-5 text-gold"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                ))}
              </div>
              <h2 className="font-[family-name:var(--font-display)] text-2xl text-navy mb-2">
                {t("reviewsTitle")}
              </h2>
              <p className="text-sm text-slate-500">{t("reviewsSub")}</p>
            </div>

            {/* Platform cards */}
            <div
              className={`grid gap-8 ${platforms.length === 1 ? "max-w-[600px] mx-auto" : "grid-cols-1 lg:grid-cols-2"}`}
            >
              {platforms.map((platform) => {
                const iconPath =
                  PLATFORM_ICONS[platform.icon] || PLATFORM_ICONS.star;
                const embedSrc = platform.embed_url || platform.url;

                return (
                  <div
                    key={platform.name}
                    className="rounded-2xl border border-border-default overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow"
                  >
                    {/* Platform header */}
                    <div className="flex items-center gap-3 px-5 py-4 border-b border-border-default bg-card-placeholder">
                      <div className="w-10 h-10 rounded-xl bg-navy/[0.06] flex items-center justify-center shrink-0">
                        <svg
                          className="w-5 h-5 text-navy"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d={iconPath} />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-bold text-navy truncate">
                          {platform.name}
                        </h3>
                        {platform.description && (
                          <p className="text-[11px] text-slate-500 truncate">
                            {platform.description}
                          </p>
                        )}
                      </div>
                      {platform.score && (
                        <span className="text-xs font-bold text-white bg-green-600 px-3 py-1 rounded-full shrink-0">
                          {platform.score}
                        </span>
                      )}
                    </div>

                    {/* Embedded preview */}
                    <ReviewEmbed
                      src={embedSrc}
                      name={platform.name}
                      url={platform.url}
                    />

                    {/* Footer link */}
                    <div className="px-5 py-3 border-t border-border-default bg-card-placeholder">
                      <a
                        href={platform.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm font-semibold text-navy hover:text-navy/70 transition-colors"
                      >
                        {t("viewReviews")}
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                          />
                        </svg>
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Contact section */}
      <section className="bg-card-placeholder border-t border-border-default py-12">
        <div className="max-w-[600px] mx-auto px-6 text-center">
          <h2 className="font-[family-name:var(--font-display)] text-xl text-navy mb-2">
            {t("contact")}
          </h2>
          <p className="text-sm text-slate-500 mb-6">{t("contactSub")}</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="mailto:info@ventoz.com"
              className="inline-flex items-center gap-2 bg-navy text-white font-semibold text-sm px-6 py-3 rounded-lg hover:bg-navy/90 transition-colors"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              info@ventoz.com
            </a>
            <a
              href="tel:+31652760885"
              className="inline-flex items-center gap-2 bg-white text-navy font-semibold text-sm px-6 py-3 rounded-lg border border-navy/20 hover:bg-navy/[0.03] transition-colors"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              </svg>
              +31 6 52 76 08 85
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
