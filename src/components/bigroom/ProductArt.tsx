import type { Product, ProductArt as ProductArtKind } from "@/data/types";

/*
 * Placeholder product art. Everything here is drawn, not photographed — the
 * merch line does not exist yet, so a vinyl disc standing in for a snapback
 * was reading as a mistake rather than as a placeholder. Each garment gets
 * its own silhouette in the product's accent colour, so a glance down the
 * grid tells you what kind of thing each item is.
 *
 * Swap these for real product shots as soon as there are any.
 */

function kindFor(product: Product): ProductArtKind {
  if (product.art) {
    return product.art;
  }
  return product.category === "music" ? "vinyl" : "tee";
}

/* Shared line-art frame: 64x64 grid, strokes in the accent colour. */
function Mark({ children }: { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className="h-28 w-28 transition-transform duration-500 group-hover:scale-105"
    >
      {children}
    </svg>
  );
}

function Hoodie() {
  return (
    <Mark>
      {/* body and sleeves */}
      <path
        d="M25 17 L14 21.5 L10 37.5 L18 40 V53 a2 2 0 0 0 2 2 h24 a2 2 0 0 0 2-2 V40 l8-2.5 -4-16 -11-4.5 z"
        fill="currentColor"
        fillOpacity="0.09"
      />
      {/* hood */}
      <path d="M25 17 c0-7 14-7 14 0" />
      <path d="M27.5 17.5 c1.6 3.4 7.4 3.4 9 0" />
      {/* drawstrings */}
      <path d="M29.5 21.5 v6.5" />
      <path d="M34.5 21.5 v6.5" />
      {/* pocket */}
      <path d="M24.5 40.5 h15 v8.5 h-15 z" />
    </Mark>
  );
}

function Tee() {
  return (
    <Mark>
      <path
        d="M25 17 L14 21.5 L10 34 L18 36.5 V53 a2 2 0 0 0 2 2 h24 a2 2 0 0 0 2-2 V36.5 l8-2.5 -4-12.5 -11-4.5 z"
        fill="currentColor"
        fillOpacity="0.09"
      />
      {/* collar */}
      <path d="M25 17 c2.6 5 13.4 5 16 0" />
      {/* acid print, stands in for the graphic */}
      <path d="M27 33 l4.5 -6 4.5 6 -4.5 6 z" />
    </Mark>
  );
}

function Cap() {
  return (
    <Mark>
      {/* crown */}
      <path
        d="M13 38 a19 16 0 0 1 38 0 z"
        fill="currentColor"
        fillOpacity="0.09"
      />
      {/* peak */}
      <path
        d="M13 38 h30 a11 5.5 0 0 1 -11 6.5 H16 a3 3 0 0 1 -3 -6.5 z"
        fill="currentColor"
        fillOpacity="0.14"
      />
      {/* button and seams */}
      <path d="M32 22.5 v15.5" />
      <path d="M22.5 38 c1.5 -8 4 -12.5 9.5 -15.5" />
      <path d="M41.5 38 c-1.5 -8 -4 -12.5 -9.5 -15.5" />
      <circle cx="32" cy="21.5" r="1.6" fill="currentColor" />
    </Mark>
  );
}

function Slipmat() {
  return (
    <Mark>
      {/* the pair, one behind the other */}
      <circle cx="25" cy="37" r="15" fill="currentColor" fillOpacity="0.07" />
      <circle
        cx="38"
        cy="29"
        r="15"
        fill="currentColor"
        fillOpacity="0.12"
      />
      <circle cx="38" cy="29" r="7.5" />
      <circle cx="38" cy="29" r="1.8" fill="currentColor" />
    </Mark>
  );
}

/* The record keeps its CSS build: the grooves need a repeating gradient. */
function Vinyl({ accent }: { accent: string }) {
  return (
    <div
      className="relative h-28 w-28 rounded-full border border-white/10 transition-transform duration-500 group-hover:rotate-45"
      style={{
        background:
          "repeating-radial-gradient(circle at center, #0b0b0f 0 2px, #13131a 2px 4px)",
        boxShadow: `0 0 30px ${accent}33`,
      }}
    >
      <div
        className="absolute inset-[30%] rounded-full"
        style={{
          background: `conic-gradient(from 200deg, ${accent}, ${accent}88, ${accent})`,
        }}
      />
      <div className="absolute inset-[46%] rounded-full bg-br-space" />
    </div>
  );
}

export default function ProductArt({ product }: { product: Product }) {
  const accent = product.accent ?? "#2fa8a0";
  const kind = kindFor(product);

  if (kind === "vinyl") {
    return <Vinyl accent={accent} />;
  }

  return (
    <div
      style={{ color: accent, filter: `drop-shadow(0 0 18px ${accent}40)` }}
    >
      {kind === "hoodie" ? <Hoodie /> : null}
      {kind === "tee" ? <Tee /> : null}
      {kind === "cap" ? <Cap /> : null}
      {kind === "slipmat" ? <Slipmat /> : null}
    </div>
  );
}
