"use client";

import { useState, useRef, useEffect } from "react";
import { useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import { routing, PRIMARY_LOCALES } from "@/i18n/routing";
import type { Locale } from "@/i18n/routing";

const LANG_LABELS: Record<string, string> = {
  nl: "NL", en: "EN", de: "DE", fr: "FR", es: "ES", it: "IT",
  bg: "BG", cs: "CS", da: "DA", el: "EL", et: "ET", fi: "FI",
  ga: "GA", hr: "HR", hu: "HU", lt: "LT", lv: "LV", mt: "MT",
  pl: "PL", pt: "PT", ro: "RO", sk: "SK", sl: "SL", sv: "SV",
  zh: "ZH", ar: "AR", tr: "TR",
};

const LANG_NAMES: Record<string, string> = {
  nl: "Nederlands", en: "English", de: "Deutsch", fr: "Français",
  es: "Español", it: "Italiano", bg: "Български", cs: "Čeština",
  da: "Dansk", el: "Ελληνικά", et: "Eesti", fi: "Suomi",
  ga: "Gaeilge", hr: "Hrvatski", hu: "Magyar", lt: "Lietuvių",
  lv: "Latviešu", mt: "Malti", pl: "Polski", pt: "Português",
  ro: "Română", sk: "Slovenčina", sl: "Slovenščina", sv: "Svenska",
  zh: "中文", ar: "العربية", tr: "Türkçe",
};

const otherLocales = routing.locales
  .filter((l) => !(PRIMARY_LOCALES as readonly string[]).includes(l))
  .sort((a, b) => (LANG_NAMES[a] || a).localeCompare(LANG_NAMES[b] || b));

export default function LanguageSwitcher() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleSelect = (code: string) => {
    setOpen(false);
    if (code !== locale) {
      router.replace(pathname, { locale: code as Locale });
    }
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 px-2 py-1 border border-slate-200 rounded-md text-xs font-semibold text-navy hover:bg-slate-50 transition-colors cursor-pointer"
      >
        {LANG_LABELS[locale] || locale.toUpperCase()}
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-52 max-h-80 overflow-y-auto bg-white rounded-lg shadow-lg border border-slate-200 z-50">
          {PRIMARY_LOCALES.map((code) => (
            <button
              key={code}
              type="button"
              onClick={() => handleSelect(code)}
              className={`w-full text-left px-3 py-2 text-[13px] hover:bg-slate-50 transition-colors cursor-pointer ${
                locale === code ? "font-bold text-navy" : "text-slate-700"
              }`}
            >
              {LANG_LABELS[code]} — {LANG_NAMES[code]}
            </button>
          ))}

          <div className="border-t border-slate-100 my-1" />

          {otherLocales.map((code) => (
            <button
              key={code}
              type="button"
              onClick={() => handleSelect(code)}
              className={`w-full text-left px-3 py-2 text-xs hover:bg-slate-50 transition-colors cursor-pointer ${
                locale === code ? "font-bold text-navy" : "text-slate-500"
              }`}
            >
              {LANG_LABELS[code]} — {LANG_NAMES[code]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
