"use client";

import { useState, useRef, useEffect } from "react";

const PRIMARY_LANGS = ["nl", "en", "de", "fr", "es", "it"] as const;
const OTHER_LANGS = [
  "bg", "cs", "da", "el", "et", "fi", "ga", "hr", "hu",
  "lt", "lv", "mt", "pl", "pt", "ro", "sk", "sl", "sv",
] as const;

const LANG_LABELS: Record<string, string> = {
  nl: "NL", en: "EN", de: "DE", fr: "FR", es: "ES", it: "IT",
  bg: "BG", cs: "CS", da: "DA", el: "EL", et: "ET", fi: "FI",
  ga: "GA", hr: "HR", hu: "HU", lt: "LT", lv: "LV", mt: "MT",
  pl: "PL", pt: "PT", ro: "RO", sk: "SK", sl: "SL", sv: "SV",
};

const LANG_NAMES: Record<string, string> = {
  nl: "Nederlands", en: "English", de: "Deutsch", fr: "Français",
  es: "Español", it: "Italiano", bg: "Български", cs: "Čeština",
  da: "Dansk", el: "Ελληνικά", et: "Eesti", fi: "Suomi",
  ga: "Gaeilge", hr: "Hrvatski", hu: "Magyar", lt: "Lietuvių",
  lv: "Latviešu", mt: "Malti", pl: "Polski", pt: "Português",
  ro: "Română", sk: "Slovenčina", sl: "Slovenščina", sv: "Svenska",
};

export default function LanguageSwitcher() {
  const [open, setOpen] = useState(false);
  const [lang, setLang] = useState("nl");
  const ref = useRef<HTMLDivElement>(null);

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
    setLang(code);
    setOpen(false);

    if (code === "nl") {
      // Remove Google Translate, restore original
      const frame = document.querySelector<HTMLIFrameElement>(".goog-te-banner-frame");
      if (frame) frame.style.display = "none";
      document.cookie = "googtrans=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      document.cookie = "googtrans=; path=/; domain=.ventoz.com; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      window.location.reload();
      return;
    }

    // Use Google Translate
    document.cookie = `googtrans=/nl/${code}; path=/`;
    document.cookie = `googtrans=/nl/${code}; path=/; domain=.ventoz.com`;

    // Inject Google Translate if not already loaded
    const win = window as unknown as Record<string, unknown>;
    if (!document.getElementById("google-translate-script")) {
      const div = document.createElement("div");
      div.id = "google_translate_element";
      div.style.display = "none";
      document.body.appendChild(div);

      win.googleTranslateElementInit = () => {
        const g = win.google as { translate: { TranslateElement: new (opts: unknown, id: string) => unknown } };
        new g.translate.TranslateElement(
          { pageLanguage: "nl", autoDisplay: false },
          "google_translate_element"
        );
      };

      const script = document.createElement("script");
      script.id = "google-translate-script";
      script.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      document.body.appendChild(script);
    } else {
      window.location.reload();
    }
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 px-2 py-1 border border-slate-200 rounded-md text-xs font-semibold text-navy hover:bg-slate-50 transition-colors cursor-pointer"
      >
        {LANG_LABELS[lang] || "NL"}
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-52 max-h-80 overflow-y-auto bg-white rounded-lg shadow-lg border border-slate-200 z-50">
          {/* Primary languages */}
          {PRIMARY_LANGS.map((code) => (
            <button
              key={code}
              type="button"
              onClick={() => handleSelect(code)}
              className={`w-full text-left px-3 py-2 text-[13px] hover:bg-slate-50 transition-colors cursor-pointer ${
                lang === code ? "font-bold text-navy" : "text-slate-700"
              }`}
            >
              {LANG_LABELS[code]} — {LANG_NAMES[code]}
            </button>
          ))}

          <div className="border-t border-slate-100 my-1" />

          {/* Other EU languages */}
          {OTHER_LANGS.map((code) => (
            <button
              key={code}
              type="button"
              onClick={() => handleSelect(code)}
              className={`w-full text-left px-3 py-2 text-xs hover:bg-slate-50 transition-colors cursor-pointer ${
                lang === code ? "font-bold text-navy" : "text-slate-500"
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
