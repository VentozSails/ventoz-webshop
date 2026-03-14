import { defineRouting } from "next-intl/routing";

export const locales = [
  "nl", "en", "de", "fr", "es", "it",
  "bg", "cs", "da", "el", "et", "fi", "ga", "hr", "hu",
  "lt", "lv", "mt", "pl", "pt", "ro", "sk", "sl", "sv",
  "zh", "ar", "tr",
] as const;

export const PRIMARY_LOCALES = ["nl", "en", "de", "fr", "es", "it"] as const;

export const routing = defineRouting({
  locales: [...locales],
  defaultLocale: "en",
  localePrefix: "as-needed",
});

export type Locale = (typeof locales)[number];
