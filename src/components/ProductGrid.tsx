"use client";

import type { Product } from "@/lib/types";
import ProductCard from "./ProductCard";
import ProductListItem from "./ProductListItem";
import { useViewMode } from "./CatalogViewToggle";

interface ProductGridProps {
  products: Product[];
  locale: string;
  dimmed?: boolean;
}

const GRID_CLASSES: Record<string, string> = {
  grid: "grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3",
  list: "flex flex-col gap-2",
  compact: "grid grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-2",
};

export default function ProductGrid({
  products,
  locale,
  dimmed = false,
}: ProductGridProps) {
  const { mode } = useViewMode();

  return (
    <div className={`${GRID_CLASSES[mode] || GRID_CLASSES.grid} ${dimmed ? "opacity-50" : ""}`}>
      {products.map((product) =>
        mode === "list" ? (
          <ProductListItem
            key={product.id}
            product={product}
            locale={locale}
          />
        ) : (
          <ProductCard
            key={product.id}
            product={product}
            locale={locale}
          />
        )
      )}
    </div>
  );
}
