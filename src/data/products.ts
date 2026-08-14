import type { Product } from "./types";

/*
 * Every price and pack size here is placeholder. They were originally taken
 * from a Bandcamp account that turned out to belong to a different Tommy B,
 * so nothing in this file should be treated as his real catalogue until it is
 * confirmed. Merch is invented too — there is no merch line yet.
 */
export const products: Product[] = [
  {
    id: "wired-to-respond",
    title: "Wired To Respond",
    category: "music",
    detail: "Signature single, 2016 · 270K+ plays",
    format: "Digital",
    priceGbp: 1.5,
    accent: "#d43d2f",
  },
  {
    id: "forbidden",
    title: "Forbidden",
    category: "music",
    detail: "with Logger & Critical Error, 2025",
    format: "Digital",
    priceGbp: 1.5,
    accent: "#e07b24",
  },
  {
    id: "rescue-me",
    title: "Rescue Me (La'Da Da'Da)",
    category: "music",
    detail: "Latest single, 2026",
    format: "Digital",
    priceGbp: 1.5,
    accent: "#2fa8a0",
  },
  {
    id: "back-catalogue-pack",
    title: "Back Catalogue Pack",
    category: "music",
    detail: "Two decades of releases, one download",
    format: "Digital",
    priceGbp: 15,
    accent: "#b0542a",
  },
  {
    id: "warehouse-certified-tee",
    title: "Warehouse Certified Tee",
    category: "merch",
    detail: "Heavyweight black tee, acid print",
    priceGbp: 18,
    accent: "#c2a24a",
    art: "tee",
  },
  {
    id: "acid-line-hoodie",
    title: "Acid Line Hoodie",
    category: "merch",
    detail: "Oversized, UV reactive print",
    priceGbp: 38,
    accent: "#d8cfc0",
    art: "hoodie",
  },
  {
    id: "tb-slipmat-pair",
    title: "TB Slipmat Pair",
    category: "merch",
    detail: "Felt slipmats, stencil logo",
    priceGbp: 14,
    accent: "#a39d90",
    art: "slipmat",
  },
  {
    id: "140-snapback",
    title: "140 Snapback",
    category: "merch",
    detail: "Black cap, embroidered 140",
    priceGbp: 16,
    accent: "#7a7468",
    art: "cap",
  },
];
