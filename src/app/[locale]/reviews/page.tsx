import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { getReviewPlatforms } from "@/lib/products";
import { Link } from "@/i18n/navigation";
import ReviewEmbed from "@/components/ReviewEmbed";

export const dynamic = "force-dynamic";

const PLATFORM_ICONS: Record<string, string> = {
  ebay: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z",
  star: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
  shopping:
    "M18 6h-2c0-2.21-1.79-4-4-4S8 3.79 8 6H6c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-6-2c1.1 0 2 .9 2 2h-4c0-1.1.9-2 2-2zm6 16H6V8h2v2c0 .55.45 1 1 1s1-.45 1-1V8h4v2c0 .55.45 1 1 1s1-.45 1-1V8h2v12z",
  thumb:
    "M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z",
  verified:
    "M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z",
  favorite:
    "M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z",
  shield:
    "M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "about" });
  return {
    title: `${t("reviewsTitle")} | Ventoz Sails`,
    description: t("reviewsSub"),
  };
}

export default async function ReviewsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("about");
  const tNav = await getTranslations("nav");

  const platforms = await getReviewPlatforms();

  return (
    <>
      {/* Breadcrumb */}
      <div className="bg-card-placeholder border-b border-border-default">
        <div className="max-w-[1100px] mx-auto px-6 py-2.5">
          <nav className="text-[13px] text-slate-500 flex items-center gap-1.5">
            <Link href="/" className="hover:text-navy transition-colors">
              {tNav("home")}
            </Link>
            <span className="text-slate-300">/</span>
            <span className="text-navy font-medium">{t("reviewsTitle")}</span>
          </nav>
        </div>
      </div>

      {/* Hero header — navy gradient with emblem and stars (matches app) */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-navy via-navy/95 to-navy/85" />
        <div className="absolute inset-0 opacity-10">
          <Image src="/hero-bg.png" alt="" fill className="object-cover" />
        </div>

        <div className="relative max-w-[800px] mx-auto px-6 py-14 lg:py-20 text-center">
          {/* Emblem / logo */}
          <div className="flex justify-center mb-5">
            <div
              className="relative inline-block"
              style={{
                filter:
                  "drop-shadow(0 0 20px rgba(255,255,255,0.5)) drop-shadow(0 0 40px rgba(255,255,255,0.25))",
              }}
            >
              <Image
                src="/logo-hero.png"
                alt="Ventoz Sails"
                width={56}
                height={56}
                className="h-14 w-auto"
                priority
              />
            </div>
          </div>

          {/* 5 gold stars */}
          <div className="flex items-center justify-center gap-1 mb-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <svg
                key={i}
                className="w-6 h-6 text-gold"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            ))}
          </div>

          {/* Title */}
          <h1 className="font-[family-name:var(--font-display)] text-3xl lg:text-4xl text-white mb-3">
            {t("reviewsTitle")}
          </h1>

          {/* Subtitle */}
          <p className="text-[15px] text-white/70 leading-relaxed max-w-[500px] mx-auto">
            {t("reviewsSub")}
          </p>
        </div>
      </section>

      {/* Platform cards */}
      <section className="bg-white py-12 lg:py-16">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-16">
          {platforms.length === 0 ? (
            <div className="text-center py-20">
              <svg
                className="w-16 h-16 mx-auto text-slate-300 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                />
              </svg>
              <p className="text-sm text-slate-500">
                Geen beoordelingen beschikbaar
              </p>
            </div>
          ) : (
            <div
              className={`grid gap-8 ${
                platforms.length === 1
                  ? "max-w-[600px] mx-auto"
                  : "grid-cols-1 lg:grid-cols-2"
              }`}
            >
              {platforms.map((platform) => {
                const iconPath =
                  PLATFORM_ICONS[platform.icon] || PLATFORM_ICONS.star;
                const embedSrc = platform.embed_url || platform.url;

                return (
                  <div
                    key={platform.name}
                    className="rounded-2xl border border-border-default overflow-hidden bg-white shadow-sm hover:shadow-lg transition-shadow"
                  >
                    {/* Platform header */}
                    <div className="flex items-center gap-4 px-6 py-5 border-b border-border-default bg-card-placeholder">
                      <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center shrink-0">
                        <svg
                          className="w-6 h-6 text-gold"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d={iconPath} />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-navy truncate">
                          {platform.name}
                        </h3>
                        {platform.description && (
                          <p className="text-xs text-slate-500 truncate mt-0.5">
                            {platform.description}
                          </p>
                        )}
                      </div>
                      {platform.score && (
                        <span className="flex items-center gap-1.5 text-sm font-bold text-green-600 bg-green-50 border border-green-200 px-3.5 py-1.5 rounded-full shrink-0">
                          <svg
                            className="w-4 h-4"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                          >
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                          </svg>
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

                    {/* Footer — full-width button like in app */}
                    <div className="px-6 py-4 border-t border-border-default">
                      <a
                        href={platform.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 w-full bg-navy text-white font-semibold text-sm py-3.5 rounded-lg hover:bg-navy/90 transition-colors"
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
                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                          />
                        </svg>
                        {t("viewReviews")}
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
