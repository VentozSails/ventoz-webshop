"use client";

import { useState } from "react";
import { useCart } from "@/lib/cart";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";

interface Props {
  productId: number;
  naam: string;
  image: string | null;
  prijs: number;
  categorie: string | null;
  inStock: boolean;
}

export default function AddToCartButton({ productId, naam, image, prijs, categorie, inStock }: Props) {
  const { addItem } = useCart();
  const t = useTranslations("cart");
  const router = useRouter();
  const [added, setAdded] = useState(false);
  const [qty, setQty] = useState(1);

  if (!inStock || prijs <= 0) return null;

  const handleAdd = () => {
    addItem({ productId, naam, image, prijs, categorie }, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <div className="flex items-center border border-slate-200 rounded-lg">
          <button
            type="button"
            onClick={() => setQty(Math.max(1, qty - 1))}
            className="px-3 py-2 text-slate-400 hover:text-navy transition-colors"
          >
            -
          </button>
          <span className="px-2 text-sm font-semibold text-navy min-w-[28px] text-center">{qty}</span>
          <button
            type="button"
            onClick={() => setQty(qty + 1)}
            className="px-3 py-2 text-slate-400 hover:text-navy transition-colors"
          >
            +
          </button>
        </div>

        <button
          type="button"
          onClick={handleAdd}
          className="flex-1 flex items-center justify-center gap-2 bg-gold text-navy font-bold text-sm px-7 py-3.5 rounded-lg hover:brightness-110 transition-all shadow-[0_4px_16px_rgba(200,168,92,0.4)] cursor-pointer"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
          </svg>
          {added ? t("addedToCart") : t("addToCart")}
        </button>
      </div>

      {added && (
        <button
          type="button"
          onClick={() => router.push("/cart")}
          className="text-sm text-navy font-semibold underline underline-offset-2 hover:no-underline cursor-pointer"
        >
          {t("viewCart")}
        </button>
      )}
    </div>
  );
}
