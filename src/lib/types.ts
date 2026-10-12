/*
 * Shapes shared by the data layer, the admin and the public pages.
 * Everything in src/lib is plain Node (no Next imports, no "@/" paths, ".ts"
 * on relative imports) so `npm test` can load it without a bundler.
 */

export const GIG_STATUSES = ["tickets", "free", "sold-out", "tba"] as const;
export type GigStatus = (typeof GIG_STATUSES)[number];

export interface Gig {
  id: number;
  /** "YYYY-MM-DD", the date of the night (a 01:00 start still uses the night's date). */
  date: string;
  /** "HH:MM", 24h, or null when not known yet. */
  startTime: string | null;
  name: string;
  venue: string;
  town: string;
  ticketUrl: string | null;
  status: GigStatus;
  /** File name in the uploads folder. */
  poster: string | null;
  note: string;
}

export type GigInput = Omit<Gig, "id">;

export const LINK_KEYS = [
  "soundcloud",
  "instagram",
  "facebook",
  "twitch",
  "bandcamp",
  "spotify",
  "beatport",
  "residentAdvisor",
] as const;
export type LinkKey = (typeof LINK_KEYS)[number];
export type Links = Record<LinkKey, string>;

export interface SiteSettings {
  tagline: string;
  bio: string[];
  /** Promoter bio for the booking page. Empty means "use the first bio paragraph". */
  shortBio: string;
  featuredTrack: string;
  riderText: string;
  /** PDF file name in the uploads folder, or "". */
  riderPdf: string;
  bookingEmail: string;
  links: Links;
}

export interface Mix {
  id: number;
  title: string;
  url: string;
}

export interface PressPhoto {
  id: number;
  file: string;
  caption: string;
  width: number | null;
  height: number | null;
  bytes: number;
}

export interface Enquiry {
  id: number;
  name: string;
  email: string;
  event: string;
  eventDate: string;
  place: string;
  message: string;
  createdAt: string;
  seen: boolean;
}

export interface Subscriber {
  id: number;
  email: string;
  town: string;
  createdAt: string;
  seen: boolean;
}

/** What the first run copies in, so nothing on the live site disappears. */
export interface SeedData {
  tagline: string;
  bio: string[];
  bookingEmail: string;
  featuredTrack: string;
  links: Partial<Links>;
}
