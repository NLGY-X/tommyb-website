import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import {
  addEnquiry,
  addMix,
  addPressPhoto,
  addSubscriber,
  countNew,
  createGig,
  deleteGig,
  deletePressPhoto,
  getGig,
  getSecret,
  getSettings,
  listEnquiries,
  listGigs,
  listMixes,
  listSubscribers,
  markAllSeen,
  moveMix,
  openDb,
  saveSettings,
  seed,
  updateGig,
} from "../src/lib/db.ts";
import { toCsv } from "../src/lib/csv.ts";
import { detectKind, imageSize, isSafeUploadName, saveUpload } from "../src/lib/uploads.ts";
import { normaliseLink, toUrl, twitchChannel } from "../src/lib/links.ts";
import type { GigInput } from "../src/lib/types.ts";

const SEED = {
  tagline: "Two decades of hard trance. Oxford, UK.",
  bio: ["First paragraph.", "Second paragraph."],
  bookingEmail: "tommybmusic@mail.com",
  featuredTrack: "https://soundcloud.com/tommy-b-2",
  links: { soundcloud: "https://soundcloud.com/tommy-b-2" },
};

const gig = (over: Partial<GigInput> = {}): GigInput => ({
  date: "2026-11-14",
  startTime: "22:00",
  name: "Night",
  venue: "Venue",
  town: "Oxford",
  ticketUrl: null,
  status: "tickets",
  poster: null,
  note: "",
  ...over,
});

test("first run seeds from content.ts, and only once", () => {
  const db = openDb(":memory:");
  assert.equal(seed(db, SEED), true);
  const s = getSettings(db);
  assert.equal(s.tagline, SEED.tagline);
  assert.deepEqual(s.bio, SEED.bio);
  assert.equal(s.links.soundcloud, SEED.links.soundcloud);
  assert.equal(s.links.twitch, "");
  assert.equal(s.featuredTrack, SEED.featuredTrack);

  // Tommy clears his tagline; a restart must not bring the old one back
  saveSettings(db, { tagline: "" });
  assert.equal(seed(db, SEED), false);
  assert.equal(getSettings(db).tagline, "");
});

test("migrations are idempotent on an existing file", () => {
  const dir = mkdtempSync(path.join(tmpdir(), "tb-db-"));
  const file = path.join(dir, "site.db");
  const a = openDb(file);
  createGig(a, gig());
  a.close();
  const b = openDb(file);
  assert.equal(listGigs(b).length, 1);
  b.close();
  rmSync(dir, { recursive: true, force: true });
});

test("settings save partially, links included", () => {
  const db = openDb(":memory:");
  seed(db, SEED);
  saveSettings(db, { bio: ["One.", "Two.", "Three."], links: { instagram: "https://instagram.com/tb" } });
  const s = getSettings(db);
  assert.deepEqual(s.bio, ["One.", "Two.", "Three."]);
  assert.equal(s.links.instagram, "https://instagram.com/tb");
  assert.equal(s.links.soundcloud, SEED.links.soundcloud);
  assert.equal(s.tagline, SEED.tagline);
});

test("gig create, read, update and list order", () => {
  const db = openDb(":memory:");
  const late = createGig(db, gig({ date: "2026-12-01", name: "Later" }));
  const untimed = createGig(db, gig({ date: "2026-11-14", startTime: null, name: "Untimed" }));
  const early = createGig(db, gig({ date: "2026-11-14", startTime: "21:00", name: "Early" }));
  assert.deepEqual(listGigs(db).map((g) => g.id), [early, untimed, late]);

  assert.equal(updateGig(db, late, gig({ date: "2026-12-02", name: "Later still", status: "sold-out", ticketUrl: "" })), true);
  const updated = getGig(db, late);
  assert.equal(updated?.name, "Later still");
  assert.equal(updated?.status, "sold-out");
  assert.equal(updated?.ticketUrl, null);
  assert.equal(getGig(db, 9999), null);
});

test("deleting a duplicated gig keeps the poster the other copy still uses", () => {
  const db = openDb(":memory:");
  const a = createGig(db, gig({ poster: "aaaaaaaaaaaaaaaaaaaaaaaa.jpg" }));
  const b = createGig(db, gig({ poster: "aaaaaaaaaaaaaaaaaaaaaaaa.jpg", date: "2026-12-12" }));
  assert.deepEqual(deleteGig(db, a), { deleted: true, orphan: null });
  assert.deepEqual(deleteGig(db, b), { deleted: true, orphan: "aaaaaaaaaaaaaaaaaaaaaaaa.jpg" });
  assert.deepEqual(deleteGig(db, b), { deleted: false, orphan: null });
});

test("the status column only takes the four statuses", () => {
  const db = openDb(":memory:");
  assert.throws(() => createGig(db, gig({ status: "secret" as never })));
});

test("mixes keep their order and move up and down", () => {
  const db = openDb(":memory:");
  const one = addMix(db, "One", "https://soundcloud.com/a/1");
  const two = addMix(db, "Two", "https://soundcloud.com/a/2");
  const three = addMix(db, "Three", "https://soundcloud.com/a/3");
  moveMix(db, three, "up");
  assert.deepEqual(listMixes(db).map((m) => m.id), [one, three, two]);
  moveMix(db, one, "up"); // already first: no change
  assert.deepEqual(listMixes(db).map((m) => m.id), [one, three, two]);
});

test("press photo delete returns the file to remove", () => {
  const db = openDb(":memory:");
  const id = addPressPhoto(db, { file: "bbbbbbbbbbbbbbbbbbbbbbbb.jpg", caption: "", width: 10, height: 10, bytes: 100 });
  assert.equal(deletePressPhoto(db, id), "bbbbbbbbbbbbbbbbbbbbbbbb.jpg");
  assert.equal(deletePressPhoto(db, id), null);
});

test("messages: newest first, new counts, mark seen", () => {
  const db = openDb(":memory:");
  addEnquiry(db, { name: "A", email: "a@x.com", event: "", eventDate: "", place: "", message: "first" });
  addEnquiry(db, { name: "B", email: "b@x.com", event: "", eventDate: "", place: "", message: "second" });
  assert.deepEqual(listEnquiries(db).map((e) => e.message), ["second", "first"]);
  assert.equal(addSubscriber(db, "Fan@Example.com", "").created, true);
  // same address in another case is the same person, and fills in the town
  assert.equal(addSubscriber(db, "fan@example.com", "Reading").created, false);
  assert.equal(listSubscribers(db).length, 1);
  assert.equal(listSubscribers(db)[0].town, "Reading");
  assert.deepEqual(countNew(db), { enquiries: 2, subscribers: 1 });
  markAllSeen(db, "enquiries");
  assert.deepEqual(countNew(db), { enquiries: 0, subscribers: 1 });
});

test("the session secret is made once and kept", () => {
  const db = openDb(":memory:");
  const first = getSecret(db);
  assert.ok(first.length >= 40);
  assert.equal(getSecret(db), first);
});

test("CSV export escapes quotes and defuses formulas", () => {
  const csv = toCsv(["email", "town"], [["a@x.com", 'Oxford, "UK"'], ["=HYPERLINK(1)", "-1"]]);
  assert.equal(csv, '﻿email,town\r\na@x.com,"Oxford, ""UK"""\r\n\'=HYPERLINK(1),\'-1\r\n');
});

test("uploads are typed by their bytes and sized from the header", async () => {
  const png = Buffer.from(
    "89504e470d0a1a0a0000000d4948445200000280000001e00802000000",
    "hex",
  );
  assert.equal(detectKind(png), "png");
  assert.deepEqual(imageSize(png), { width: 640, height: 480 });
  // minimal JPEG header: SOI, APP0 stub, SOF0 with 300x200
  const jpg = Buffer.from("ffd8ffe000044a46ffc0000b0800c8012c03011100", "hex");
  assert.equal(detectKind(jpg), "jpg");
  assert.deepEqual(imageSize(jpg), { width: 300, height: 200 });
  assert.equal(detectKind(Buffer.from("%PDF-1.7\n")), "pdf");
  assert.equal(detectKind(Buffer.from("<svg onload=alert(1)>")), null);

  const dir = mkdtempSync(path.join(tmpdir(), "tb-up-"));
  const asFile = (buf: Buffer) => ({ size: buf.length, arrayBuffer: async () => new Uint8Array(buf).buffer });
  const saved = await saveUpload(dir, asFile(png), ["jpg", "png", "webp"]);
  assert.equal(saved.ok, true);
  if (saved.ok) {
    assert.ok(isSafeUploadName(saved.name));
    assert.deepEqual(readdirSync(dir), [saved.name]);
  }
  const refused = await saveUpload(dir, asFile(Buffer.from("%PDF-1.7\n")), ["jpg", "png", "webp"]);
  assert.equal(refused.ok, false);
  rmSync(dir, { recursive: true, force: true });

  assert.equal(isSafeUploadName("../site.db"), false);
  assert.equal(isSafeUploadName("aaaaaaaaaaaaaaaaaaaaaaaa.svg"), false);
});

test("links are cleaned up or refused", () => {
  assert.equal(normaliseLink("instagram", "instagram.com/tommyb?igsh=abc"), "https://instagram.com/tommyb");
  assert.equal(normaliseLink("instagram", "https://evil.example/instagram.com"), null);
  assert.equal(normaliseLink("residentAdvisor", "https://ra.co/dj/tommyb"), "https://ra.co/dj/tommyb");
  assert.equal(normaliseLink("bandcamp", "tommyb.bandcamp.com"), "https://tommyb.bandcamp.com");
  assert.equal(normaliseLink("twitch", ""), "");
  assert.equal(twitchChannel("https://www.twitch.tv/TommyB_live"), "tommyb_live");
  assert.equal(twitchChannel("https://example.com/x"), null);
  assert.equal(toUrl("javascript:alert(1)"), null);
});
