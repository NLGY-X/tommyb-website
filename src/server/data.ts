import { revalidatePath } from "next/cache";
import { getSettings, listGigs, listMixes, listPressPhotos } from "@/lib/db";
import { splitGigs } from "@/lib/gigs";
import { twitchChannel } from "@/lib/links";
import { db } from "@/server/db";

/** Everything the public layout needs on every page. */
export function siteSettings() {
  const settings = getSettings(db());
  return { ...settings, twitch: twitchChannel(settings.links.twitch) };
}

export function gigsNow(now = new Date()) {
  return splitGigs(listGigs(db()), now);
}

export function mixes() {
  return listMixes(db());
}

export function pressPhotos() {
  return listPressPhotos(db());
}

/** After any admin save: every public page reads the database, so refresh the lot. */
export function refreshSite(): void {
  revalidatePath("/", "layout");
}

/**
 * The SoundCloud app shares on.soundcloud.com short links, which the embed
 * player can't read. Follow the redirect once at save time and keep the full
 * soundcloud.com address, minus tracking parameters.
 */
export async function resolveSoundCloud(raw: string): Promise<string | null> {
  let url: URL;
  try {
    url = new URL(/^https?:\/\//i.test(raw.trim()) ? raw.trim() : `https://${raw.trim()}`);
  } catch {
    return null;
  }
  const host = url.hostname.replace(/^(www|m)\./, "");
  if (host === "on.soundcloud.com") {
    try {
      const res = await fetch(url, { redirect: "manual", signal: AbortSignal.timeout(8000) });
      const location = res.headers.get("location");
      if (!location) return null;
      url = new URL(location, url);
    } catch {
      return null;
    }
  } else if (host !== "soundcloud.com") {
    return null;
  }
  if (url.hostname.replace(/^(www|m)\./, "") !== "soundcloud.com" || url.pathname.length < 2) {
    return null;
  }
  url.hostname = "soundcloud.com";
  url.search = "";
  url.hash = "";
  return url.toString().replace(/\/$/, "");
}
