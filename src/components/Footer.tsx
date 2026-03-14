import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { CATEGORIES, categorieLabel } from "@/lib/types";
import { Link } from "@/i18n/navigation";

const PAYMENT_METHODS = [
  { name: "iDEAL", color: "#CC0066" },
  { name: "Bancontact", color: "#005498" },
  { name: "Creditcard", color: "#1A1F71" },
  { name: "MasterCard", color: "#EB001B" },
  { name: "VISA", color: "#1A1F71" },
  { name: "Maestro", color: "#0099DF" },
  { name: "V PAY", color: "#1A1F71" },
  { name: "PayPal", color: "#003087" },
  { name: "Apple Pay", color: "#333333" },
  { name: "Google Pay", color: "#4285F4" },
  { name: "Klarna", color: "#FFB3C7" },
  { name: "Riverty", color: "#2B7A4B" },
  { name: "SOFORT", color: "#3B3B3B" },
  { name: "Giropay", color: "#003A7D" },
  { name: "EPS", color: "#C8202F" },
  { name: "Wero", color: "#003D2E" },
  { name: "BLIK", color: "#000000" },
  { name: "Przelewy24", color: "#D42127" },
  { name: "Trustly", color: "#0EBB52" },
  { name: "Swish", color: "#00A042" },
  { name: "MobilePay", color: "#5A78FF" },
  { name: "Vipps", color: "#FF5B24" },
  { name: "Bizum", color: "#05C3DD" },
  { name: "MB Way", color: "#E40520" },
  { name: "MyBank", color: "#1A3C6E" },
  { name: "Satispay", color: "#E53935" },
  { name: "Belfius", color: "#005CA9" },
  { name: "KBC/CBC", color: "#003D6A" },
  { name: "Pay By Bank", color: "#00897B" },
  { name: "SEPA", color: "#2D4B8E" },
  { name: "Overschrijving", color: "#546E7A" },
] as const;

const LEGAL_LINKS = [
  "Leveringsvoorwaarden / Terms of Delivery",
  "Privacy Statement / Datenschutzrichtlinie",
  "Garantie / Warranty",
  "Klachten / Complaints",
  "Retourneren / Returns",
  "Contact",
] as const;

export default async function Footer({ locale }: { locale: string }) {
  const t = await getTranslations("footer");
  const tNav = await getTranslations("nav");
  const tCat = await getTranslations("categories");

  const catEntries = Object.entries(CATEGORIES);
  const catLabel = (slug: string) => categorieLabel(slug, (k) => tCat.has(k) ? tCat(k) : "");

  return (
    <footer>
      <div className="bg-[#E8EDF2]">
        <div className="max-w-[1100px] mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-[3fr_2fr_4fr] gap-8">
          <div>
            <h3 className="text-sm font-bold text-slate-700 mb-3">{t("contact")}</h3>
            <ul className="space-y-1 text-xs text-slate-700">
              <li className="flex items-start gap-2">
                <svg className="w-3.5 h-3.5 mt-0.5 text-slate-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                <span>Ventoz Sails</span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-3.5 h-3.5 mt-0.5 text-slate-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                <span>Dorpsstraat 111</span>
              </li>
              <li className="flex items-start gap-2 ml-[22px]">
                <span>7948 BN Nijeveen (NL)</span>
              </li>
              <li className="mt-2 flex items-center gap-2">
                <svg className="w-3.5 h-3.5 text-slate-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                <span>Igor <a href="tel:+31610193845" className="text-blue-700 hover:underline">+31 6 10193845</a></span>
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-3.5 h-3.5 text-slate-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                <span>Bart <a href="tel:+31645055465" className="text-blue-700 hover:underline">+31 6 45055465</a></span>
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-3.5 h-3.5 text-slate-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                <a href="mailto:info@ventoz.com" className="text-blue-700 hover:underline">info@ventoz.com</a>
              </li>
              <li className="mt-2 text-slate-500 text-[11px]">KvK: 64140814</li>
              <li className="text-slate-500 text-[11px]">BTW: NL855539203B01</li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-bold text-slate-700 mb-3">{t("navigation")}</h3>
            <ul className="space-y-1 text-xs">
              <li>
                <Link href="/catalogus" className="text-blue-700 hover:underline">{tNav("products")}</Link>
              </li>
              {catEntries.map(([slug]) => (
                <li key={slug}>
                  <Link href={`/catalogus?categorie=${encodeURIComponent(slug)}`} className="text-slate-500 hover:text-navy transition-colors">
                    {catLabel(slug)}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-4 space-y-0.5">
              {LEGAL_LINKS.map((text) => (
                <p key={text} className="text-[11px] text-slate-400">{text}</p>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold text-slate-700 mb-3">{t("paymentMethods")}</h3>
            <div className="flex flex-wrap gap-1.5">
              {PAYMENT_METHODS.map(({ name, color }) => (
                <span
                  key={name}
                  className="inline-flex items-center px-3 py-1.5 bg-white rounded-md border border-slate-200 shadow-[0_1px_4px_rgba(0,0,0,0.04)] text-xs font-bold tracking-wide"
                  style={{ color }}
                >
                  {name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-navy">
        <div className="max-w-[1100px] mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image src="/emblem.png" alt="Ventoz" width={24} height={24} className="w-6 h-6 opacity-60" />
            <span className="text-slate-400 text-xs">&copy; {new Date().getFullYear()} Ventoz Sails. {t("copyright")}</span>
          </div>
          <span className="text-slate-500 text-[10px]">{t("tagline")}</span>
        </div>
      </div>
    </footer>
  );
}
