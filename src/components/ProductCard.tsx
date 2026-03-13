import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/types";
import {
  displayNaam,
  displayAfbeelding,
  prijsFormatted,
  productSlug,
  categorieLabel,
} from "@/lib/types";

export default function ProductCard({ product }: { product: Product }) {
  const naam = displayNaam(product);
  const img = displayAfbeelding(product);
  const slug = productSlug(product);

  return (
    <Link href={`/product/${slug}`} className="group block">
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
        <div className="relative aspect-square bg-slate-50 flex items-center justify-center overflow-hidden">
          {img ? (
            <Image
              src={img}
              alt={naam}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="flex flex-col items-center gap-2 text-slate-300">
              <svg
                className="w-12 h-12"
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
          {!product.in_stock && (
            <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
              Uitverkocht
            </div>
          )}
        </div>
        <div className="p-4">
          {product.categorie && (
            <span className="text-xs font-medium text-sky-600 uppercase tracking-wider">
              {categorieLabel(product.categorie)}
            </span>
          )}
          <h3 className="mt-1 font-semibold text-slate-900 text-sm leading-snug line-clamp-2 group-hover:text-sky-600 transition-colors">
            {naam}
          </h3>
          <p className="mt-2 text-lg font-bold text-slate-900">
            {prijsFormatted(product)}
          </p>
        </div>
      </div>
    </Link>
  );
}
