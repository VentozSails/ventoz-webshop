"use client";

import { useVat } from "@/lib/vat";
import { useAuth } from "@/lib/auth";

function fmt(price: number, locale: string): string {
  if (locale === "en") return `€ ${price.toFixed(2)}`;
  return `€ ${price.toFixed(2).replace(".", ",")}`;
}

interface PriceDisplayProps {
  prijs: number | null;
  locale?: string;
  size?: "sm" | "md" | "lg";
  showVatLabel?: boolean;
}

export default function PriceDisplay({
  prijs,
  locale = "nl",
  size = "md",
  showVatLabel = true,
}: PriceDisplayProps) {
  const { applyDiscountAndVat, vatLabel } = useVat();
  const { profile } = useAuth();
  const discount = profile?.korting ?? 0;

  if (prijs == null) {
    const labels: Record<string, string> = {
      nl: "Prijs op aanvraag", en: "Price on request", de: "Preis auf Anfrage",
      fr: "Prix sur demande", es: "Precio a consultar",
    };
    return <span className="text-sm text-slate-500 italic">{labels[locale] || labels.en}</span>;
  }

  const { original, discounted, hasDiscount } = applyDiscountAndVat(prijs, discount);

  const sizeClasses = {
    sm: { price: "text-sm font-extrabold", original: "text-xs", label: "text-[10px]" },
    md: { price: "text-lg font-bold", original: "text-sm", label: "text-xs" },
    lg: { price: "text-[28px] font-bold", original: "text-base", label: "text-xs" },
  };
  const s = sizeClasses[size];

  return (
    <span className="inline-flex flex-col">
      <span className="flex items-baseline gap-2">
        {hasDiscount && (
          <span className={`${s.original} text-slate-400 line-through`}>
            {fmt(original, locale)}
          </span>
        )}
        <span className={`${s.price} text-navy`}>
          {fmt(discounted, locale)}
        </span>
      </span>
      {showVatLabel && (
        <span className={`${s.label} text-slate-400 mt-0.5`}>{vatLabel}</span>
      )}
    </span>
  );
}
