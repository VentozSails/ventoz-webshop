import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { notFound } from "next/navigation";
import { getLegalContent } from "@/lib/products";

const LEGAL_PAGES: Record<string, { titleKey: string; metaTitle: string }> = {
  "terms-of-delivery": { titleKey: "termsOfDelivery", metaTitle: "Terms of Delivery" },
  privacy: { titleKey: "privacy", metaTitle: "Privacy Statement" },
  warranty: { titleKey: "warranty", metaTitle: "Warranty" },
  complaints: { titleKey: "complaints", metaTitle: "Complaints" },
  returns: { titleKey: "returns", metaTitle: "Returns" },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}): Promise<Metadata> {
  const { slug, locale } = await params;
  const page = LEGAL_PAGES[slug];
  if (!page) return {};

  const t = await getTranslations({ locale, namespace: "legal" });
  return {
    title: `${t(page.titleKey)} | Ventoz Sails`,
    description: `${page.metaTitle} - Ventoz Sails`,
  };
}

export default async function LegalPage({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}) {
  const { slug, locale } = await params;
  const page = LEGAL_PAGES[slug];
  if (!page) notFound();

  const t = await getTranslations("legal");
  const content = await getLegalContent(slug);
  const text = content[locale] || content["en"] || content["nl"] || "";

  return (
    <div className="max-w-[700px] mx-auto px-6 py-12">
      <Link
        href="/"
        className="text-xs text-slate-400 hover:text-navy mb-6 inline-flex items-center gap-1"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        {t("backHome")}
      </Link>

      <h1 className="font-[family-name:var(--font-display)] text-2xl text-navy mb-6">
        {t(page.titleKey)}
      </h1>

      {text ? (
        <div className="prose prose-slate prose-sm max-w-none">
          {text.split(/\n\s*\n/).map((paragraph, i) => {
            const trimmed = paragraph.trim();
            if (!trimmed) return null;

            const isHeading = /^(Artikel\s+\d+|Art\.\s*\d+)/i.test(trimmed) ||
              /^[A-Z][A-Za-z\s]+:?\s*$/.test(trimmed.split("\n")[0]);

            if (isHeading) {
              const lines = trimmed.split("\n");
              const heading = lines[0];
              const rest = lines.slice(1).join("\n").trim();
              return (
                <div key={i} className="mt-6 first:mt-0">
                  <h2 className="text-base font-bold text-navy mb-2">{heading}</h2>
                  {rest && <p className="text-slate-600 leading-relaxed whitespace-pre-line">{rest}</p>}
                </div>
              );
            }

            return (
              <p key={i} className="text-slate-600 leading-relaxed whitespace-pre-line mb-3">
                {trimmed}
              </p>
            );
          })}
        </div>
      ) : (
        <div className="prose prose-slate prose-sm max-w-none">
          <p className="text-slate-500">{t("placeholder")}</p>
        </div>
      )}

      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <p className="text-xs text-blue-700">
          {t("contactNote")}{" "}
          <a href="mailto:info@ventoz.com" className="font-semibold hover:underline">
            info@ventoz.com
          </a>
        </p>
      </div>
    </div>
  );
}
