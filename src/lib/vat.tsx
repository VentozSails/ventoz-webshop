"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

const NL_VAT_RATE = 0.21;

interface VatContextValue {
  exclVat: boolean;
  toggleVat: () => void;
  /** Applies VAT conversion: if exclVat is true, divides by (1 + rate) */
  applyVat: (priceInclVat: number) => number;
  /** Applies reseller discount then VAT conversion */
  applyDiscountAndVat: (priceInclVat: number, discountPct: number) => {
    original: number;
    discounted: number;
    hasDiscount: boolean;
  };
  vatLabel: string;
}

const VatContext = createContext<VatContextValue | null>(null);

export function VatProvider({ children }: { children: ReactNode }) {
  const [exclVat, setExclVat] = useState(false);

  const toggleVat = useCallback(() => setExclVat((v) => !v), []);

  const applyVat = useCallback(
    (priceInclVat: number) =>
      exclVat ? priceInclVat / (1 + NL_VAT_RATE) : priceInclVat,
    [exclVat]
  );

  const applyDiscountAndVat = useCallback(
    (priceInclVat: number, discountPct: number) => {
      const base = exclVat ? priceInclVat / (1 + NL_VAT_RATE) : priceInclVat;
      const hasDiscount = discountPct > 0;
      const discounted = hasDiscount ? base * (1 - discountPct / 100) : base;
      return { original: base, discounted, hasDiscount };
    },
    [exclVat]
  );

  const vatLabel = exclVat ? "excl. BTW" : "incl. BTW";

  return (
    <VatContext.Provider value={{ exclVat, toggleVat, applyVat, applyDiscountAndVat, vatLabel }}>
      {children}
    </VatContext.Provider>
  );
}

export function useVat() {
  const ctx = useContext(VatContext);
  if (!ctx) throw new Error("useVat must be used within VatProvider");
  return ctx;
}
