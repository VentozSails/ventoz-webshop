"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { useCart } from "@/lib/cart";
import { useVat } from "@/lib/vat";
import { useAuth } from "@/lib/auth";
import { Link } from "@/i18n/navigation";

export default function CartPage() {
  const t = useTranslations("cart");
  const tProduct = useTranslations("product");
  const { items, removeItem, updateQty, subtotal } = useCart();
  const { applyDiscountAndVat, vatLabel } = useVat();
  const { profile } = useAuth();
  const discount = profile?.korting ?? 0;

  if (items.length === 0) {
    return (
      <div className="max-w-[800px] mx-auto px-6 py-16 text-center">
        <svg className="w-16 h-16 mx-auto text-slate-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
        </svg>
        <h1 className="text-xl font-bold text-navy mb-2">{t("empty")}</h1>
        <Link
          href="/catalogus"
          className="inline-flex items-center gap-2 text-sm text-navy font-semibold hover:underline mt-4"
        >
          {t("continueShopping")}
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-[900px] mx-auto px-6 py-8">
      <h1 className="font-[family-name:var(--font-display)] text-2xl text-navy mb-6">{t("title")}</h1>

      <div className="space-y-4">
        {items.map((item) => (
          <div
            key={item.productId}
            className="flex items-center gap-4 bg-white border border-border-default rounded-xl p-4"
          >
            {item.image && (
              <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-card-placeholder shrink-0">
                <Image
                  src={item.image}
                  alt={item.naam}
                  fill
                  className="object-contain p-1"
                  sizes="80px"
                />
              </div>
            )}

            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-navy truncate">{item.naam}</h3>
              <p className="text-sm text-slate-500 mt-0.5">
                {(() => {
                  const { original, discounted, hasDiscount } = applyDiscountAndVat(item.prijs, discount);
                  return (
                    <>
                      {hasDiscount && (
                        <span className="line-through text-slate-400 mr-1.5">
                          &euro; {original.toFixed(2).replace(".", ",")}
                        </span>
                      )}
                      <span className={hasDiscount ? "font-semibold text-navy" : ""}>
                        &euro; {discounted.toFixed(2).replace(".", ",")}
                      </span>
                      <span className="text-slate-400 ml-1 text-xs">{vatLabel}</span>
                    </>
                  );
                })()}
              </p>
            </div>

            <div className="flex items-center border border-slate-200 rounded-lg">
              <button
                type="button"
                onClick={() => updateQty(item.productId, item.qty - 1)}
                disabled={item.qty <= 1}
                className="px-2 py-1 text-slate-400 hover:text-navy disabled:opacity-30 transition-colors"
              >
                -
              </button>
              <span className="px-2 text-sm font-semibold text-navy min-w-[24px] text-center">
                {item.qty}
              </span>
              <button
                type="button"
                onClick={() => updateQty(item.productId, item.qty + 1)}
                className="px-2 py-1 text-slate-400 hover:text-navy transition-colors"
              >
                +
              </button>
            </div>

            <div className="text-right min-w-[80px]">
              <p className="text-sm font-bold text-navy">
                {(() => {
                  const { discounted } = applyDiscountAndVat(item.prijs, discount);
                  return <>&euro; {(discounted * item.qty).toFixed(2).replace(".", ",")}</>;
                })()}
              </p>
            </div>

            <button
              type="button"
              onClick={() => removeItem(item.productId)}
              className="text-slate-300 hover:text-red-500 transition-colors"
              title={t("remove")}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>

      <div className="mt-6 bg-white border border-border-default rounded-xl p-6">
        {(() => {
          const displaySubtotal = items.reduce((sum, item) => {
            const { discounted } = applyDiscountAndVat(item.prijs, discount);
            return sum + discounted * item.qty;
          }, 0);
          return (
            <>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-500">{t("subtotal")} ({vatLabel})</span>
                <span className="font-bold text-navy">&euro; {displaySubtotal.toFixed(2).replace(".", ",")}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-green-600">Wederverkoper-korting ({discount}%)</span>
                  <span className="text-green-600 font-semibold">
                    -&euro; {(items.reduce((sum, item) => {
                      const { original, discounted: d } = applyDiscountAndVat(item.prijs, discount);
                      return sum + (original - d) * item.qty;
                    }, 0)).toFixed(2).replace(".", ",")}
                  </span>
                </div>
              )}
            </>
          );
        })()}
        <p className="text-xs text-slate-400 mb-4">
          {t("shipping")} &amp; {t("vat")} calculated at checkout
        </p>

        <Link
          href="/checkout"
          className="block w-full text-center bg-gold text-navy font-bold text-sm px-7 py-3.5 rounded-lg hover:brightness-110 transition-all shadow-[0_4px_16px_rgba(200,168,92,0.4)]"
        >
          {t("checkout")}
        </Link>

        <Link
          href="/catalogus"
          className="block text-center text-sm text-navy font-semibold mt-3 hover:underline"
        >
          {t("continueShopping")}
        </Link>
      </div>
    </div>
  );
}
