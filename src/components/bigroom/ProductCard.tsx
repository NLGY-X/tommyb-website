"use client";

import { useCart } from "@/components/store/CartContext";
import { formatGbp } from "@/components/store/cartMath";
import ProductArt from "@/components/bigroom/ProductArt";
import type { Product } from "@/data/types";

export interface ProductCardProps {
  product: Product;
  compact?: boolean;
  /** Record-sleeve catalogue tag, e.g. "TB-01". */
  catalogNo?: string;
}

export default function ProductCard({
  product,
  compact = false,
  catalogNo,
}: ProductCardProps) {
  const cart = useCart();
  const line = cart.items.find((item) => item.productId === product.id);
  const inCart = Boolean(line);
  const accent = product.accent ?? "#2fa8a0";

  return (
    <article className="group border border-white/10 bg-white/[0.02] p-5 transition-colors duration-300 hover:border-white/25 md:p-6">
      {compact ? null : (
        <div
          className="relative flex h-40 items-center justify-center overflow-hidden"
          style={{
            background: `radial-gradient(ellipse 90% 90% at 50% 110%, ${accent}26, transparent), linear-gradient(180deg, #0a101d, #070b14)`,
          }}
        >
          <ProductArt product={product} />
          {catalogNo ? (
            <span className="absolute left-3 top-2 font-(family-name:--font-space-mono) text-[10px] tracking-[0.25em] text-br-chrome/60">
              {catalogNo}
            </span>
          ) : null}
        </div>
      )}
      <div className={compact ? "" : "mt-5"}>
        <div className="flex items-center justify-between gap-3">
          <span
            className="inline-block border px-2.5 py-0.5 font-(family-name:--font-space-mono) text-[10px] tracking-[0.25em]"
            style={{ borderColor: `${accent}66`, color: accent }}
          >
            {product.category === "music" ? "MUSIC" : "MERCH"}
          </span>
          {compact && catalogNo ? (
            <span className="font-(family-name:--font-space-mono) text-[10px] tracking-[0.25em] text-br-chrome/60">
              {catalogNo}
            </span>
          ) : null}
        </div>
        <h3 className="mt-3 font-(family-name:--font-display) text-base leading-snug text-br-platinum">
          {product.title}
        </h3>
        <p className="mt-1 font-(family-name:--font-inter) text-xs text-br-chrome">
          {product.detail}
          {product.format ? ` / ${product.format}` : ""}
        </p>
      </div>
      <div className="mt-5 flex items-center justify-between gap-3 border-t border-white/10 pt-4">
        <span className="font-(family-name:--font-space-mono) text-base font-bold text-br-platinum">
          {formatGbp(product.priceGbp)}
        </span>
        <button
          type="button"
          onClick={() => cart.add(product.id)}
          className={`inline-flex min-h-11 items-center px-4 font-(family-name:--font-space-mono) text-xs font-bold tracking-[0.1em] transition-colors md:min-h-0 md:py-2 ${
            inCart
              ? "border border-br-teal/60 text-br-teal hover:border-br-teal"
              : "bg-br-platinum text-br-space hover:bg-br-red hover:text-br-platinum"
          }`}
        >
          {inCart ? "ADD ANOTHER" : "ADD TO CART"}
        </button>
      </div>
      {line ? (
        <p className="mt-3 font-(family-name:--font-space-mono) text-[10px] tracking-[0.2em] text-br-chrome">
          IN CART: {line.qty}
        </p>
      ) : null}
    </article>
  );
}
