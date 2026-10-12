import { DatabaseSync } from "node:sqlite";
import { randomBytes } from "node:crypto";
import {
  GIG_STATUSES,
  LINK_KEYS,
  type Enquiry,
  type Gig,
  type GigInput,
  type GigStatus,
  type Links,
  type Mix,
  type PressPhoto,
  type SeedData,
  type SiteSettings,
  type Subscriber,
} from "./types.ts";

export type Db = DatabaseSync;

type Row = Record<string, unknown>;

/*
 * Each entry runs once, in order, tracked by SQLite's user_version. Add new
 * steps to the end; never edit one that has shipped.
 */
const MIGRATIONS = [
  `
  CREATE TABLE settings (
    key   TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );
  CREATE TABLE gigs (
    id         INTEGER PRIMARY KEY,
    date       TEXT NOT NULL,
    start_time TEXT,
    name       TEXT NOT NULL,
    venue      TEXT NOT NULL DEFAULT '',
    town       TEXT NOT NULL,
    ticket_url TEXT,
    status     TEXT NOT NULL CHECK (status IN ('tickets', 'free', 'sold-out', 'tba')),
    poster     TEXT,
    note       TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE INDEX gigs_date ON gigs (date);
  CREATE TABLE mixes (
    id       INTEGER PRIMARY KEY,
    title    TEXT NOT NULL,
    url      TEXT NOT NULL,
    position INTEGER NOT NULL
  );
  CREATE TABLE press_photos (
    id         INTEGER PRIMARY KEY,
    file       TEXT NOT NULL,
    caption    TEXT NOT NULL DEFAULT '',
    width      INTEGER,
    height     INTEGER,
    bytes      INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE TABLE enquiries (
    id         INTEGER PRIMARY KEY,
    name       TEXT NOT NULL,
    email      TEXT NOT NULL,
    event      TEXT NOT NULL DEFAULT '',
    event_date TEXT NOT NULL DEFAULT '',
    place      TEXT NOT NULL DEFAULT '',
    message    TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
    seen       INTEGER NOT NULL DEFAULT 0
  );
  CREATE TABLE subscribers (
    id         INTEGER PRIMARY KEY,
    email      TEXT NOT NULL UNIQUE COLLATE NOCASE,
    town       TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
    seen       INTEGER NOT NULL DEFAULT 0
  );
  `,
];

export function openDb(file: string): Db {
  const db = new DatabaseSync(file);
  db.exec("PRAGMA busy_timeout = 3000;");
  if (file !== ":memory:") {
    db.exec("PRAGMA journal_mode = WAL;");
  }
  migrate(db);
  return db;
}

export function migrate(db: Db): void {
  const current = Number((db.prepare("PRAGMA user_version").get() as Row).user_version);
  for (let v = current; v < MIGRATIONS.length; v++) {
    db.exec("BEGIN");
    try {
      db.exec(MIGRATIONS[v]);
      db.exec(`PRAGMA user_version = ${v + 1}`);
      db.exec("COMMIT");
    } catch (error) {
      db.exec("ROLLBACK");
      throw error;
    }
  }
}

/* ---------- settings ---------- */

const SETTING_KEYS = {
  tagline: "tagline",
  bio: "bio",
  shortBio: "short_bio",
  featuredTrack: "featured_track",
  riderText: "rider_text",
  riderPdf: "rider_pdf",
  bookingEmail: "booking_email",
} as const;

function linkKey(key: string): string {
  return `link_${key}`;
}

function readAll(db: Db): Map<string, string> {
  const rows = db.prepare("SELECT key, value FROM settings").all() as Row[];
  return new Map(rows.map((r) => [String(r.key), String(r.value)]));
}

function put(db: Db, key: string, value: string): void {
  db.prepare(
    "INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value",
  ).run(key, value);
}

/**
 * First run only: copies the copy that was hardcoded in content.ts into the
 * database. A "seeded" marker means clearing a field later never brings the
 * old text back.
 */
export function seed(db: Db, data: SeedData): boolean {
  const done = db.prepare("SELECT 1 FROM settings WHERE key = 'seeded'").get();
  if (done) {
    return false;
  }
  db.exec("BEGIN");
  try {
    put(db, SETTING_KEYS.tagline, data.tagline);
    put(db, SETTING_KEYS.bio, JSON.stringify(data.bio));
    put(db, SETTING_KEYS.bookingEmail, data.bookingEmail);
    put(db, SETTING_KEYS.featuredTrack, data.featuredTrack);
    for (const [key, value] of Object.entries(data.links)) {
      if (value) {
        put(db, linkKey(key), value);
      }
    }
    put(db, "seeded", new Date().toISOString());
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
  return true;
}

export function getSettings(db: Db): SiteSettings {
  const all = readAll(db);
  let bio: string[] = [];
  try {
    const parsed = JSON.parse(all.get(SETTING_KEYS.bio) ?? "[]");
    if (Array.isArray(parsed)) {
      bio = parsed.filter((p): p is string => typeof p === "string" && p.trim() !== "");
    }
  } catch {
    bio = [];
  }
  const links = {} as Links;
  for (const key of LINK_KEYS) {
    links[key] = all.get(linkKey(key)) ?? "";
  }
  return {
    tagline: all.get(SETTING_KEYS.tagline) ?? "",
    bio,
    shortBio: all.get(SETTING_KEYS.shortBio) ?? "",
    featuredTrack: all.get(SETTING_KEYS.featuredTrack) ?? "",
    riderText: all.get(SETTING_KEYS.riderText) ?? "",
    riderPdf: all.get(SETTING_KEYS.riderPdf) ?? "",
    bookingEmail: all.get(SETTING_KEYS.bookingEmail) ?? "",
    links,
  };
}

export type SettingsPatch = Partial<Omit<SiteSettings, "links">> & {
  links?: Partial<Links>;
};

export function saveSettings(db: Db, patch: SettingsPatch): void {
  db.exec("BEGIN");
  try {
    for (const [field, key] of Object.entries(SETTING_KEYS)) {
      const value = patch[field as keyof typeof SETTING_KEYS];
      if (value === undefined) {
        continue;
      }
      put(db, key, Array.isArray(value) ? JSON.stringify(value) : String(value));
    }
    for (const [key, value] of Object.entries(patch.links ?? {})) {
      if ((LINK_KEYS as readonly string[]).includes(key) && value !== undefined) {
        put(db, linkKey(key), value);
      }
    }
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}

/** Random per-install secret for signing the admin cookie. Made once, kept forever. */
export function getSecret(db: Db): string {
  const row = db.prepare("SELECT value FROM settings WHERE key = 'session_secret'").get() as
    | Row
    | undefined;
  if (row) {
    return String(row.value);
  }
  const secret = randomBytes(32).toString("base64url");
  db.prepare("INSERT OR IGNORE INTO settings (key, value) VALUES ('session_secret', ?)").run(secret);
  return String((db.prepare("SELECT value FROM settings WHERE key = 'session_secret'").get() as Row).value);
}

/* ---------- gigs ---------- */

function toGig(r: Row): Gig {
  return {
    id: Number(r.id),
    date: String(r.date),
    startTime: r.start_time ? String(r.start_time) : null,
    name: String(r.name),
    venue: String(r.venue ?? ""),
    town: String(r.town),
    ticketUrl: r.ticket_url ? String(r.ticket_url) : null,
    status: (GIG_STATUSES as readonly string[]).includes(String(r.status))
      ? (String(r.status) as GigStatus)
      : "tba",
    poster: r.poster ? String(r.poster) : null,
    note: String(r.note ?? ""),
  };
}

/** Every gig, soonest first. Gigs without a start time sort after timed ones on the same night. */
export function listGigs(db: Db): Gig[] {
  const rows = db
    .prepare("SELECT * FROM gigs ORDER BY date ASC, start_time IS NULL, start_time ASC, id ASC")
    .all() as Row[];
  return rows.map(toGig);
}

export function getGig(db: Db, id: number): Gig | null {
  const row = db.prepare("SELECT * FROM gigs WHERE id = ?").get(id) as Row | undefined;
  return row ? toGig(row) : null;
}

function gigParams(input: GigInput) {
  return [
    input.date,
    input.startTime || null,
    input.name,
    input.venue,
    input.town,
    input.ticketUrl || null,
    input.status,
    input.poster || null,
    input.note,
  ] as const;
}

export function createGig(db: Db, input: GigInput): number {
  const result = db
    .prepare(
      `INSERT INTO gigs (date, start_time, name, venue, town, ticket_url, status, poster, note)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(...gigParams(input));
  return Number(result.lastInsertRowid);
}

export function updateGig(db: Db, id: number, input: GigInput): boolean {
  const result = db
    .prepare(
      `UPDATE gigs SET date = ?, start_time = ?, name = ?, venue = ?, town = ?, ticket_url = ?,
       status = ?, poster = ?, note = ?, updated_at = datetime('now') WHERE id = ?`,
    )
    .run(...gigParams(input), id);
  return Number(result.changes) > 0;
}

/** Duplicated gigs share a poster file, so it is only safe to delete when nothing else uses it. */
export function isUploadInUse(db: Db, file: string): boolean {
  const checks = [
    db.prepare("SELECT 1 FROM gigs WHERE poster = ? LIMIT 1").get(file),
    db.prepare("SELECT 1 FROM press_photos WHERE file = ? LIMIT 1").get(file),
    db.prepare("SELECT 1 FROM settings WHERE key = 'rider_pdf' AND value = ? LIMIT 1").get(file),
  ];
  return checks.some(Boolean);
}

/** Deletes the gig. Returns its poster file if nothing else uses it any more, so the caller can remove it. */
export function deleteGig(db: Db, id: number): { deleted: boolean; orphan: string | null } {
  const gig = getGig(db, id);
  if (!gig) {
    return { deleted: false, orphan: null };
  }
  db.prepare("DELETE FROM gigs WHERE id = ?").run(id);
  const orphan = gig.poster && !isUploadInUse(db, gig.poster) ? gig.poster : null;
  return { deleted: true, orphan };
}

/* ---------- mixes ---------- */

export function listMixes(db: Db): Mix[] {
  const rows = db.prepare("SELECT id, title, url FROM mixes ORDER BY position ASC, id ASC").all() as Row[];
  return rows.map((r) => ({ id: Number(r.id), title: String(r.title), url: String(r.url) }));
}

export function addMix(db: Db, title: string, url: string): number {
  const max = db.prepare("SELECT COALESCE(MAX(position), 0) AS p FROM mixes").get() as Row;
  const result = db
    .prepare("INSERT INTO mixes (title, url, position) VALUES (?, ?, ?)")
    .run(title, url, Number(max.p) + 1);
  return Number(result.lastInsertRowid);
}

export function deleteMix(db: Db, id: number): void {
  db.prepare("DELETE FROM mixes WHERE id = ?").run(id);
}

/** Swaps a mix with its neighbour. The order is what the music and booking pages show. */
export function moveMix(db: Db, id: number, direction: "up" | "down"): void {
  const mixes = listMixes(db);
  const index = mixes.findIndex((m) => m.id === id);
  const target = direction === "up" ? index - 1 : index + 1;
  if (index < 0 || target < 0 || target >= mixes.length) {
    return;
  }
  [mixes[index], mixes[target]] = [mixes[target], mixes[index]];
  const update = db.prepare("UPDATE mixes SET position = ? WHERE id = ?");
  db.exec("BEGIN");
  mixes.forEach((m, i) => update.run(i + 1, m.id));
  db.exec("COMMIT");
}

/* ---------- press photos ---------- */

export function listPressPhotos(db: Db): PressPhoto[] {
  const rows = db.prepare("SELECT * FROM press_photos ORDER BY id DESC").all() as Row[];
  return rows.map((r) => ({
    id: Number(r.id),
    file: String(r.file),
    caption: String(r.caption ?? ""),
    width: r.width == null ? null : Number(r.width),
    height: r.height == null ? null : Number(r.height),
    bytes: Number(r.bytes ?? 0),
  }));
}

export function addPressPhoto(db: Db, photo: Omit<PressPhoto, "id">): number {
  const result = db
    .prepare("INSERT INTO press_photos (file, caption, width, height, bytes) VALUES (?, ?, ?, ?, ?)")
    .run(photo.file, photo.caption, photo.width, photo.height, photo.bytes);
  return Number(result.lastInsertRowid);
}

export function deletePressPhoto(db: Db, id: number): string | null {
  const row = db.prepare("SELECT file FROM press_photos WHERE id = ?").get(id) as Row | undefined;
  if (!row) {
    return null;
  }
  db.prepare("DELETE FROM press_photos WHERE id = ?").run(id);
  const file = String(row.file);
  return isUploadInUse(db, file) ? null : file;
}

/* ---------- messages ---------- */

export function addEnquiry(
  db: Db,
  e: Omit<Enquiry, "id" | "createdAt" | "seen">,
): number {
  const result = db
    .prepare(
      "INSERT INTO enquiries (name, email, event, event_date, place, message) VALUES (?, ?, ?, ?, ?, ?)",
    )
    .run(e.name, e.email, e.event, e.eventDate, e.place, e.message);
  return Number(result.lastInsertRowid);
}

export function listEnquiries(db: Db): Enquiry[] {
  const rows = db.prepare("SELECT * FROM enquiries ORDER BY created_at DESC, id DESC").all() as Row[];
  return rows.map((r) => ({
    id: Number(r.id),
    name: String(r.name),
    email: String(r.email),
    event: String(r.event),
    eventDate: String(r.event_date),
    place: String(r.place),
    message: String(r.message),
    createdAt: String(r.created_at),
    seen: Number(r.seen) === 1,
  }));
}

export function deleteEnquiry(db: Db, id: number): void {
  db.prepare("DELETE FROM enquiries WHERE id = ?").run(id);
}

/** Adds or refreshes a mailing list sign-up. A repeat sign-up keeps the first date and only fills in a missing town. */
export function addSubscriber(db: Db, email: string, town: string): { created: boolean } {
  const existing = db.prepare("SELECT id FROM subscribers WHERE email = ?").get(email);
  if (existing) {
    if (town) {
      db.prepare("UPDATE subscribers SET town = ? WHERE email = ? AND town = ''").run(town, email);
    }
    return { created: false };
  }
  db.prepare("INSERT INTO subscribers (email, town) VALUES (?, ?)").run(email, town);
  return { created: true };
}

export function listSubscribers(db: Db): Subscriber[] {
  const rows = db.prepare("SELECT * FROM subscribers ORDER BY created_at DESC, id DESC").all() as Row[];
  return rows.map((r) => ({
    id: Number(r.id),
    email: String(r.email),
    town: String(r.town),
    createdAt: String(r.created_at),
    seen: Number(r.seen) === 1,
  }));
}

export function deleteSubscriber(db: Db, id: number): void {
  db.prepare("DELETE FROM subscribers WHERE id = ?").run(id);
}

export function countNew(db: Db): { enquiries: number; subscribers: number } {
  const e = db.prepare("SELECT COUNT(*) AS n FROM enquiries WHERE seen = 0").get() as Row;
  const s = db.prepare("SELECT COUNT(*) AS n FROM subscribers WHERE seen = 0").get() as Row;
  return { enquiries: Number(e.n), subscribers: Number(s.n) };
}

export function markAllSeen(db: Db, table: "enquiries" | "subscribers"): void {
  db.prepare(`UPDATE ${table === "enquiries" ? "enquiries" : "subscribers"} SET seen = 1 WHERE seen = 0`).run();
}
