import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import ContactForm from "@/components/ContactForm";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "contact" });
  return {
    title: `${t("title")} | Ventoz Sails`,
    description: t("subtitle"),
  };
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("contact");
  const tNav = await getTranslations("nav");

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
            <span className="text-navy font-medium">{t("title")}</span>
          </nav>
        </div>
      </div>

      {/* Hero */}
      <section className="bg-gradient-to-br from-navy via-navy/95 to-navy/85 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.06]">
          <div className="absolute inset-0" style={{
            backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
          }} />
        </div>
        <div className="relative max-w-[800px] mx-auto px-6 py-14 lg:py-20 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 backdrop-blur mb-5">
            <svg className="w-8 h-8 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="font-[family-name:var(--font-display)] text-3xl lg:text-4xl text-white mb-3">
            {t("title")}
          </h1>
          <p className="text-[15px] text-white/70 leading-relaxed max-w-[500px] mx-auto">
            {t("subtitle")}
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="bg-white py-12 lg:py-16">
        <div className="max-w-[1100px] mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-12 lg:gap-16">

            {/* Contact form */}
            <div>
              <h2 className="text-lg font-bold text-navy mb-1">{t("formTitle")}</h2>
              <p className="text-sm text-slate-500 mb-6">{t("formSubtitle")}</p>
              <ContactForm />
            </div>

            {/* Info sidebar */}
            <div className="space-y-6">
              {/* Direct contact */}
              <div className="bg-[#F8FAFB] rounded-2xl border border-[#E2E8F0] p-6">
                <h3 className="text-sm font-bold text-navy mb-4 flex items-center gap-2">
                  <svg className="w-4 h-4 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  {t("directContact")}
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-navy/[0.06] flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-navy">I</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-navy">Igor</p>
                      <a href="tel:+31610193845" className="text-sm text-slate-500 hover:text-navy transition-colors">
                        +31 (0)6 10 19 38 45
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-navy/[0.06] flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-navy">B</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-navy">Bart</p>
                      <a href="tel:+31645055465" className="text-sm text-slate-500 hover:text-navy transition-colors">
                        +31 (0)6 45 05 54 65
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Email */}
              <div className="bg-[#F8FAFB] rounded-2xl border border-[#E2E8F0] p-6">
                <h3 className="text-sm font-bold text-navy mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  E-mail
                </h3>
                <a href="mailto:info@ventoz.com" className="text-sm text-navy font-medium hover:underline">
                  info@ventoz.com
                </a>
              </div>

              {/* Address */}
              <div className="bg-[#F8FAFB] rounded-2xl border border-[#E2E8F0] p-6">
                <h3 className="text-sm font-bold text-navy mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {t("address")}
                </h3>
                <div className="text-sm text-slate-600 leading-relaxed">
                  <p className="font-medium text-navy">Ventoz Sails</p>
                  <p>Dorpsstraat 111</p>
                  <p>7948 BN Nijeveen</p>
                  <p>{t("netherlands")}</p>
                </div>
                <p className="text-xs text-slate-400 mt-3 italic">
                  {t("visitNote")}
                </p>
              </div>

              {/* Business hours */}
              <div className="bg-[#F8FAFB] rounded-2xl border border-[#E2E8F0] p-6">
                <h3 className="text-sm font-bold text-navy mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {t("hours")}
                </h3>
                <div className="text-sm text-slate-600 space-y-1">
                  <div className="flex justify-between">
                    <span>{t("monFri")}</span>
                    <span className="font-medium text-navy">09:00 – 17:00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t("sat")}</span>
                    <span className="font-medium text-navy">{t("byAppointment")}</span>
                  </div>
                </div>
                <p className="text-xs text-slate-400 mt-2">
                  {t("shippingNote")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
