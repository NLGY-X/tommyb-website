"use server";

import { redirect } from "next/navigation";
import { passwordMatches } from "@/lib/auth";
import * as store from "@/lib/db";
import { fileFrom, filesFrom, isIsoDate, isSubmitToken, isTime, SubmitOnce, text, type FormState } from "@/lib/form";
import { LINK_INFO, isEmail, normaliseLink, toUrl } from "@/lib/links";
import { GIG_STATUSES, LINK_KEYS, type GigInput, type GigStatus, type Links } from "@/lib/types";
import { isSafeUploadName, removeUpload, saveUpload } from "@/lib/uploads";
import { refreshSite, resolveSoundCloud } from "@/server/data";
import { db, uploadsDir } from "@/server/db";
import { clientAddress, endSession, loginLimiter, requireAdmin, startSession } from "@/server/session";

const IMAGE_KINDS = ["jpg", "png", "webp"] as const;

function done(ok: string): FormState {
  return { ok, at: Date.now() };
}

function fail(error: string, field?: string): FormState {
  return { error, field, at: Date.now() };
}

/* One per server process: a double tap on "Save gig" or a retry after lost signal adds one gig, not two. */
const holder = globalThis as unknown as { __tommybGigSaves?: SubmitOnce<number | FormState> };
const gigSaves = (holder.__tommybGigSaves ??= new SubmitOnce<number | FormState>());

/* ---------- sign in and out ---------- */

export async function signIn(_prev: FormState, fd: FormData): Promise<FormState> {
  if (!process.env.ADMIN_PASSWORD) {
    return fail("Sign-in isn't set up yet: ADMIN_PASSWORD is missing on the server.");
  }
  const address = await clientAddress();
  const now = Date.now();
  const wait = loginLimiter.retryAfter(address, now);
  if (wait > 0) {
    return fail(`Too many wrong tries. Try again in ${Math.ceil(wait / 60)} minutes.`);
  }
  if (!passwordMatches(text(fd, "password", 200), process.env.ADMIN_PASSWORD)) {
    loginLimiter.fail(address, now);
    return fail("That password isn't right.", "password");
  }
  loginLimiter.succeed(address);
  await startSession();
  redirect("/admin");
}

export async function signOut(): Promise<void> {
  await endSession();
  redirect("/admin/login");
}

/* ---------- gigs ---------- */

export async function saveGig(_prev: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const database = db();
  const id = Number(text(fd, "id")) || null;
  const existing = id ? store.getGig(database, id) : null;
  if (id && !existing) {
    return fail("That gig has been deleted.");
  }

  const status = text(fd, "status") as GigStatus;
  const input: GigInput = {
    date: text(fd, "date"),
    startTime: text(fd, "startTime") || null,
    name: text(fd, "name", 120),
    venue: text(fd, "venue", 120),
    town: text(fd, "town", 80),
    ticketUrl: null,
    status,
    poster: existing?.poster ?? null,
    note: text(fd, "note", 500),
  };

  if (!isIsoDate(input.date)) return fail("Pick a date.", "date");
  if (input.startTime && !isTime(input.startTime)) return fail("The start time doesn't look right.", "startTime");
  if (!input.name) return fail("Add the name of the night.", "name");
  if (!input.town) return fail("Add the town.", "town");
  if (!(GIG_STATUSES as readonly string[]).includes(status)) return fail("Pick a status.", "status");
  if (!input.venue && status !== "tba") return fail("Add the venue, or pick “Location TBA”.", "venue");

  const ticket = text(fd, "ticketUrl", 500);
  if (ticket) {
    const url = toUrl(ticket);
    if (!url) return fail("The ticket link doesn't look like a web address.", "ticketUrl");
    input.ticketUrl = url.toString();
  }

  /* A duplicate starts with the original's poster. */
  const copied = text(fd, "copyPoster");
  if (!existing && copied && isSafeUploadName(copied)) {
    input.poster = copied;
  }
  if (text(fd, "removePoster") === "on") {
    input.poster = null;
  }
  const upload = fileFrom(fd, "poster");
  const withPoster = async (): Promise<FormState | null> => {
    if (upload) {
      const saved = await saveUpload(uploadsDir(), upload, [...IMAGE_KINDS]);
      if (!saved.ok) return fail(saved.error, "poster");
      input.poster = saved.name;
    }
    return null;
  };

  let savedId: number;
  if (existing && id) {
    const problem = await withPoster();
    if (problem) return problem;
    store.updateGig(database, id, input);
    if (existing.poster && existing.poster !== input.poster && !store.isUploadInUse(database, existing.poster)) {
      await removeUpload(uploadsDir(), existing.poster);
    }
    savedId = id;
  } else {
    const create = async () => (await withPoster()) ?? store.createGig(database, input);
    const token = text(fd, "submitToken", 64);
    const result = isSubmitToken(token) ? await gigSaves.run(token, Date.now(), create) : await create();
    if (typeof result !== "number") {
      /* A refused poster saved nothing, so the next try with another photo must run. */
      gigSaves.forget(token);
      return result;
    }
    savedId = result;
  }
  refreshSite();
  redirect(`/admin/gigs?saved=${savedId}`);
}

export async function deleteGig(fd: FormData): Promise<void> {
  await requireAdmin();
  const { orphan } = store.deleteGig(db(), Number(text(fd, "id")));
  await removeUpload(uploadsDir(), orphan);
  refreshSite();
  redirect("/admin/gigs?deleted=1");
}

/* ---------- music ---------- */

export async function saveFeatured(_prev: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const raw = text(fd, "featuredTrack", 500);
  if (!raw) {
    store.saveSettings(db(), { featuredTrack: "" });
    refreshSite();
    return done("Cleared. The home page shows your SoundCloud profile instead.");
  }
  const url = await resolveSoundCloud(raw);
  if (!url) return fail("That isn't a SoundCloud link. Open the track in SoundCloud, tap Share, then Copy link.", "featuredTrack");
  store.saveSettings(db(), { featuredTrack: url });
  refreshSite();
  return done("Saved. It's on the home page now.");
}

export async function addMix(_prev: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const title = text(fd, "title", 120);
  const raw = text(fd, "url", 500);
  if (!raw) return fail("Paste the SoundCloud link.", "url");
  const url = await resolveSoundCloud(raw);
  if (!url) return fail("That isn't a SoundCloud link. Open the mix in SoundCloud, tap Share, then Copy link.", "url");
  const fallback = url.split("/").pop()?.replace(/-/g, " ") ?? "Mix";
  store.addMix(db(), title || fallback, url);
  refreshSite();
  return done("Added.");
}

export async function deleteMix(fd: FormData): Promise<void> {
  await requireAdmin();
  store.deleteMix(db(), Number(text(fd, "id")));
  refreshSite();
}

export async function moveMix(fd: FormData): Promise<void> {
  await requireAdmin();
  store.moveMix(db(), Number(text(fd, "id")), text(fd, "direction") === "up" ? "up" : "down");
  refreshSite();
}

/* ---------- about ---------- */

export async function saveAbout(_prev: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const tagline = text(fd, "tagline", 120);
  const bio = text(fd, "bio", 8000)
    .split(/\r?\n\s*\r?\n/)
    .map((p) => p.replace(/\s*\r?\n\s*/g, " ").trim())
    .filter(Boolean);
  store.saveSettings(db(), { tagline, bio });
  refreshSite();
  return done("Saved.");
}

/* ---------- links ---------- */

export async function saveLinks(_prev: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const links: Partial<Links> = {};
  for (const key of LINK_KEYS) {
    const cleaned = normaliseLink(key, text(fd, key, 500));
    if (cleaned === null) {
      return fail(`The ${LINK_INFO[key].label} link doesn't look right. It should look like ${LINK_INFO[key].example}`, key);
    }
    links[key] = cleaned;
  }
  const bookingEmail = text(fd, "bookingEmail", 254);
  if (bookingEmail && !isEmail(bookingEmail)) return fail("The booking email doesn't look right.", "bookingEmail");
  store.saveSettings(db(), { links, bookingEmail });
  refreshSite();
  return done("Saved. Only the filled-in links show on the site.");
}

/* ---------- press kit ---------- */

export async function saveShortBio(_prev: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  store.saveSettings(db(), { shortBio: text(fd, "shortBio", 2000) });
  refreshSite();
  return done("Saved.");
}

export async function uploadPressPhotos(_prev: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const files = filesFrom(fd, "photos");
  if (!files.length) return fail("Choose at least one photo.");
  const caption = text(fd, "caption", 200);
  let added = 0;
  for (const file of files) {
    const saved = await saveUpload(uploadsDir(), file, [...IMAGE_KINDS]);
    if (!saved.ok) {
      refreshSite();
      return fail(added ? `${added} added, then: ${saved.error}` : saved.error);
    }
    store.addPressPhoto(db(), {
      file: saved.name,
      caption,
      width: saved.width,
      height: saved.height,
      bytes: saved.bytes,
    });
    added++;
  }
  refreshSite();
  return done(added === 1 ? "Photo added." : `${added} photos added.`);
}

export async function deletePressPhoto(fd: FormData): Promise<void> {
  await requireAdmin();
  const orphan = store.deletePressPhoto(db(), Number(text(fd, "id")));
  await removeUpload(uploadsDir(), orphan);
  refreshSite();
}

export async function saveRider(_prev: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const database = db();
  const current = store.getSettings(database).riderPdf;
  let riderPdf = current;
  if (text(fd, "removePdf") === "on") {
    riderPdf = "";
  }
  const upload = fileFrom(fd, "pdf");
  if (upload) {
    const saved = await saveUpload(uploadsDir(), upload, ["pdf"]);
    if (!saved.ok) return fail(saved.error);
    riderPdf = saved.name;
  }
  store.saveSettings(database, { riderText: text(fd, "riderText", 6000), riderPdf });
  if (current && current !== riderPdf && !store.isUploadInUse(database, current)) {
    await removeUpload(uploadsDir(), current);
  }
  refreshSite();
  return done("Saved.");
}

/* ---------- messages ---------- */

export async function deleteEnquiry(fd: FormData): Promise<void> {
  await requireAdmin();
  store.deleteEnquiry(db(), Number(text(fd, "id")));
  refreshSite();
}

export async function deleteSubscriber(fd: FormData): Promise<void> {
  await requireAdmin();
  store.deleteSubscriber(db(), Number(text(fd, "id")));
  refreshSite();
}
