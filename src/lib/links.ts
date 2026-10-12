import type { LinkKey } from "./types.ts";

export interface LinkInfo {
  label: string;
  hosts: string[];
  example: string;
}

export const LINK_INFO: Record<LinkKey, LinkInfo> = {
  soundcloud: { label: "SoundCloud", hosts: ["soundcloud.com"], example: "https://soundcloud.com/tommy-b-2" },
  instagram: { label: "Instagram", hosts: ["instagram.com"], example: "https://instagram.com/yourname" },
  facebook: { label: "Facebook", hosts: ["facebook.com", "fb.com", "fb.me"], example: "https://facebook.com/yourpage" },
  twitch: { label: "Twitch", hosts: ["twitch.tv"], example: "https://twitch.tv/yourname" },
  bandcamp: { label: "Bandcamp", hosts: ["bandcamp.com"], example: "https://yourname.bandcamp.com" },
  spotify: { label: "Spotify", hosts: ["spotify.com"], example: "https://open.spotify.com/artist/..." },
  beatport: { label: "Beatport", hosts: ["beatport.com"], example: "https://www.beatport.com/artist/..." },
  residentAdvisor: { label: "Resident Advisor", hosts: ["ra.co", "residentadvisor.net"], example: "https://ra.co/dj/yourname" },
};

function hostMatches(host: string, allowed: string[]): boolean {
  const h = host.toLowerCase().replace(/^www\./, "").replace(/^m\./, "");
  return allowed.some((a) => h === a || h.endsWith(`.${a}`));
}

/**
 * Accepts what people paste from a phone: with or without https://, with
 * tracking junk on the end. Returns the cleaned URL, "" for empty input, or
 * null if it isn't a link to the right site.
 */
export function normaliseLink(key: LinkKey, raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) {
    return "";
  }
  const url = toUrl(trimmed);
  if (!url || !hostMatches(url.hostname, LINK_INFO[key].hosts)) {
    return null;
  }
  for (const param of [...url.searchParams.keys()]) {
    if (/^(utm_|si$|igsh|ref|fbclid)/i.test(param)) {
      url.searchParams.delete(param);
    }
  }
  return url.toString().replace(/\/$/, "");
}

/** Any http(s) link, e.g. a ticket page. Null if it isn't one. */
export function toUrl(raw: string): URL | null {
  const trimmed = raw.trim();
  if (!trimmed) {
    return null;
  }
  try {
    const url = new URL(/^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`);
    if (!/^https?:$/.test(url.protocol) || !url.hostname.includes(".")) {
      return null;
    }
    return url;
  } catch {
    return null;
  }
}

/** The channel name from a Twitch link, for the player embed. */
export function twitchChannel(link: string): string | null {
  const url = toUrl(link);
  if (!url || !hostMatches(url.hostname, ["twitch.tv"])) {
    return null;
  }
  const name = url.pathname.split("/").filter(Boolean)[0];
  return name && /^[A-Za-z0-9_]{3,25}$/.test(name) ? name.toLowerCase() : null;
}

export function isSoundCloudUrl(raw: string): boolean {
  const url = toUrl(raw);
  return Boolean(url && hostMatches(url.hostname, ["soundcloud.com"]));
}

export function isEmail(value: string): boolean {
  return /^[^\s@<>"]+@[^\s@<>"]+\.[^\s@<>"]{2,}$/.test(value) && value.length <= 254;
}
