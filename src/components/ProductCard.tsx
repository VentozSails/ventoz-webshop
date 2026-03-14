import Image from "next/image";
import type { Product } from "@/lib/types";
import {
  displayNaam,
  displayAfbeelding,
  prijsFormatted,
  productSlug,
  categorieLabel,
} from "@/lib/types";
import { Link } from "@/i18n/navigation";

export default function ProductCard({ product, locale = "nl" }: { product: Product; locale?: string }) {
  const naam = displayNaam(product, locale);
  const img = displayAfbeelding(product);
  const slug = productSlug(product);

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
    <Link href={`/product/${slug}`} className="group block">
      <div className="bg-white rounded-xl border border-border-default overflow-hidden hover:shadow-md transition-all duration-200">
        <div className="relative bg-white" style={{ paddingBottom: "90%" }}>
          {img ? (
            <Image
              src={img}
              alt={naam}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-contain p-2 group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="absolute inset-0 bg-card-placeholder flex items-center justify-center">
              <svg className="w-10 h-10 text-icon-placeholder" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
        </div>

        <div className="p-2.5">
          <div className="flex items-center gap-2 mb-1">
            {product.categorie && (
              <span className="text-[9px] font-semibold text-navy bg-navy/[0.06] px-1.5 py-0.5 rounded uppercase tracking-wider">
                {categorieLabel(product.categorie)}
              </span>
            )}
            <span className={`text-[8px] font-semibold px-1.5 py-0.5 rounded ${product.in_stock ? "bg-green-50 text-green-800" : "bg-orange-50 text-orange-800"}`}>
              {product.in_stock ? inStockLabel : soldOutLabel}
            </span>
          </div>

          <h3 className="text-xs font-semibold text-slate-800 leading-snug line-clamp-2 group-hover:text-navy transition-colors">
            {naam}
          </h3>

          <div className="mt-1.5 flex items-center justify-between">
            <span className="text-sm font-extrabold text-navy">
              {prijsFormatted(product, locale)}
            </span>
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-navy hover:bg-navy/10 transition-colors">
              <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
