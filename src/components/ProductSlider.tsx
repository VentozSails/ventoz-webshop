"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";

interface SliderProduct {
  slug: string;
  naam: string;
  categorie: string | null;
  categorieLabel: string;
  prijs: string;
  image: string | null;
}

export default function ProductSlider({ products }: { products: SliderProduct[] }) {
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % products.length);
  }, [products.length]);

  const prev = useCallback(() => {
    setCurrent((c) => (c - 1 + products.length) % products.length);
  }, [products.length]);

  useEffect(() => {
    if (products.length <= 1) return;
    const id = setInterval(next, 7000);
    return () => clearInterval(id);
  }, [next, products.length]);

  if (products.length === 0) return null;

  const product = products[current];

  return (
    <Link
      href={`/product/${product.slug}`}
      className="block rounded-2xl overflow-hidden bg-white/[0.82] shadow-[0_10px_32px_rgba(0,0,0,0.3),0_0_40px_rgba(200,168,92,0.15)]"
      style={{ minHeight: 360 }}
    >
      {/* Image area */}
      <div className="relative" style={{ height: 240 }}>
        <div className="absolute inset-0 bg-white/60" />
        {product.image ? (
          <Image
            key={product.slug}
            src={product.image}
            alt={product.naam}
            fill
            sizes="(max-width: 1024px) 100vw, 40vw"
            className="object-contain p-4 transition-opacity duration-500"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <svg className="w-12 h-12 text-[#B0C4DE]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-white/15" style={{ pointerEvents: "none" }} />

        {/* Category badge */}
        {product.categorie && (
          <span className="absolute top-3 left-3 bg-navy/85 text-white text-[10px] font-semibold px-2 py-1 rounded-md">
            {product.categorieLabel}
          </span>
        )}

        {/* Navigation arrows */}
        {products.length > 1 && (
          <>
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); prev(); }}
              className="absolute left-1 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-navy/55 flex items-center justify-center text-white hover:bg-navy/70 transition-colors cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); next(); }}
              className="absolute right-1 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-navy/55 flex items-center justify-center text-white hover:bg-navy/70 transition-colors cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}
      </div>

      {/* Product info */}
      <div className="px-4 pt-3 pb-2">
        <h3 className="text-sm font-bold text-navy leading-snug line-clamp-2">
          {product.naam}
        </h3>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-lg font-extrabold text-navy">{product.prijs}</span>
          <span className="bg-gold text-navy text-[11px] font-bold px-2.5 py-1.5 rounded-md">
            Bekijk product
          </span>
        </div>

        {/* Dot indicators */}
        {products.length > 1 && (
          <div className="flex items-center justify-center gap-1.5 mt-2 pb-1">
            {products.map((_, i) => (
              <span
                key={i}
                className={`block h-1.5 rounded-full transition-all duration-300 ${
                  i === current ? "w-5 bg-gold" : "w-1.5 bg-[#D0D5DD]"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
