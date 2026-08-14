export type GigStatus = "tickets" | "sold-out" | "locked";

export interface Gig {
  id: string;
  date: string;
  displayDate: string;
  name: string;
  venue: string;
  city: string;
  status: GigStatus;
  /** 24h "HH:MM". After-midnight starts are fine ("01:00"). */
  setStart: string;
  /** Set length in hours, half-hour steps. */
  setHours: number;
  note?: string;
}

export type ProductCategory = "music" | "merch";

/** Which placeholder mark the card draws until real product shots exist. */
export type ProductArt = "vinyl" | "tee" | "hoodie" | "slipmat" | "cap";

export interface Product {
  id: string;
  title: string;
  category: ProductCategory;
  detail: string;
  format?: string;
  priceGbp: number;
  accent?: string;
  /** Defaults to vinyl for music, tee for merch. */
  art?: ProductArt;
}

export type ReleaseFormat = "WAV" | "MP3" | '12" Vinyl';

export interface Release {
  id: string;
  title: string;
  kind: "EP" | "Single";
  format: ReleaseFormat;
  priceGbp: number;
}
