import Image from "next/image";
import type { Product } from "@/lib/types";
import {
  displayNaam,
  displayBeschrijving,
  displayAfbeelding,
  displayPrijs,
  productSlug,
  categorieLabel,
} from "@/lib/types";
import { Link } from "@/i18n/navigation";
import PriceDisplay from "./PriceDisplay";

export default function ProductListItem({
  product,
  locale = "nl",
}: {
  product: Product;
  locale?: string;
}) {
  const naam = displayNaam(product, locale);
  const img = displayAfbeelding(product);
  const slug = productSlug(product);
  const prijs = displayPrijs(product);
  const beschrijving = displayBeschrijving(product, locale);

  const stockLabels: Record<string, [string, string]> = {
    nl: ["Op voorraad", "Uitverkocht"],
    en: ["In stock", "Sold out"],
    de: ["Auf Lager", "Ausverkauft"],
    fr: ["En stock", "Épuisé"],
    es: ["En stock", "Agotado"],
    it: ["Disponibile", "Esaurito"],
  };
  const [inStockLabel, soldOutLabel] = stockLabels[locale] || stockLabels.en!;

  return (
    <Link
      href={`/product/${slug}`}
      className="group flex items-start gap-4 bg-white rounded-xl border border-border-default p-3 hover:shadow-md transition-all duration-200"
    >
      <div className="relative w-24 h-24 shrink-0 bg-white rounded-lg overflow-hidden">
        {img ? (
          <Image
            src={img}
            alt={naam}
            fill
            sizes="96px"
            className="object-contain p-1 group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="absolute inset-0 bg-card-placeholder flex items-center justify-center">
            <svg
              className="w-8 h-8 text-icon-placeholder"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0 py-0.5">
        <div className="flex items-center gap-2 mb-1">
          {product.categorie && (
            <span className="text-[9px] font-semibold text-navy bg-navy/[0.06] px-1.5 py-0.5 rounded uppercase tracking-wider">
              {categorieLabel(product.categorie)}
            </span>
          )}
          <span
            className={`text-[8px] font-semibold px-1.5 py-0.5 rounded ${
              product.in_stock
                ? "bg-green-50 text-green-800"
                : "bg-orange-50 text-orange-800"
            }`}
          >
            {product.in_stock ? inStockLabel : soldOutLabel}
          </span>
        </div>

        <h3 className="text-sm font-semibold text-slate-800 leading-snug group-hover:text-navy transition-colors">
          {naam}
        </h3>

        {beschrijving && (
          <p className="mt-1 text-xs text-slate-500 line-clamp-2 leading-relaxed">
            {beschrijving}
          </p>
        )}

        {(product.luff || product.sail_area || product.materiaal) && (
          <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5 text-[10px] text-slate-400">
            {product.luff && <span>Luff: {product.luff}</span>}
            {product.sail_area && <span>Area: {product.sail_area}</span>}
            {product.materiaal && <span>{product.materiaal}</span>}
          </div>
        )}
      </div>

      <div className="shrink-0 text-right pt-1">
        <PriceDisplay prijs={prijs} locale={locale} size="sm" />
      </div>
    </Link>
  );
}
