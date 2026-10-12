import type { Gig, GigStatus } from "./types.ts";

export const TIME_ZONE = "Europe/London";

/*
 * A night doesn't end at midnight. Until 6am a gig still counts as tonight,
 * so Saturday's date stays on the upcoming list while the set is still on.
 */
const NIGHT_ENDS_HOUR = 6;

/* Starts before 7am belong to the night before: a 01:00 set on "Sat" is Sunday 01:00. */
const EARLY_HOURS_BEFORE = 7;

const londonFormat = new Intl.DateTimeFormat("en-GB", {
  timeZone: TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
});

/** Wall-clock parts in London for an instant. */
export function londonParts(at: Date) {
  const parts = Object.fromEntries(
    londonFormat.formatToParts(at).map((p) => [p.type, p.value]),
  ) as Record<string, string>;
  return {
    date: `${parts.year}-${parts.month}-${parts.day}`,
    hour: Number(parts.hour),
    minute: Number(parts.minute),
    second: Number(parts.second),
  };
}

/** The date of the night that is "on" right now in London. */
export function currentNight(now: Date): string {
  return londonParts(new Date(now.getTime() - NIGHT_ENDS_HOUR * 3600_000)).date;
}

export function isUpcoming(gig: Pick<Gig, "date">, now: Date): boolean {
  return gig.date >= currentNight(now);
}

/** Upcoming soonest first, past most recent first. */
export function splitGigs<T extends Pick<Gig, "date" | "startTime">>(
  gigs: T[],
  now: Date,
): { upcoming: T[]; past: T[] } {
  const night = currentNight(now);
  const key = (g: T) => `${g.date} ${g.startTime ?? "99:99"}`;
  const upcoming = gigs.filter((g) => g.date >= night).sort((a, b) => key(a).localeCompare(key(b)));
  const past = gigs.filter((g) => g.date < night).sort((a, b) => key(b).localeCompare(key(a)));
  return { upcoming, past };
}

function addDays(date: string, days: number): string {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** The London offset from UTC, in minutes, at an instant. */
function londonOffsetMinutes(at: Date): number {
  const p = londonParts(at);
  const asUtc = Date.UTC(
    Number(p.date.slice(0, 4)),
    Number(p.date.slice(5, 7)) - 1,
    Number(p.date.slice(8, 10)),
    p.hour,
    p.minute,
    p.second,
  );
  return Math.round((asUtc - Math.floor(at.getTime() / 1000) * 1000) / 60_000);
}

/** Converts a London wall-clock date and time to the real instant, handling GMT and BST. */
export function londonToUtc(date: string, time: string): Date {
  const [h, m] = time.split(":").map(Number);
  const naive = Date.UTC(
    Number(date.slice(0, 4)),
    Number(date.slice(5, 7)) - 1,
    Number(date.slice(8, 10)),
    h,
    m,
  );
  /* Guess with the offset at the naive instant, then correct once for a DST edge. */
  let utc = naive - londonOffsetMinutes(new Date(naive)) * 60_000;
  utc = naive - londonOffsetMinutes(new Date(utc)) * 60_000;
  return new Date(utc);
}

/** When the set actually starts, rolling early-hours times into the next calendar day. */
export function gigStart(gig: Pick<Gig, "date" | "startTime">): Date | null {
  if (!gig.startTime) {
    return null;
  }
  const hour = Number(gig.startTime.slice(0, 2));
  const day = hour < EARLY_HOURS_BEFORE ? addDays(gig.date, 1) : gig.date;
  return londonToUtc(day, gig.startTime);
}

/** "2026-11-14T22:00:00+00:00" style, with London's offset, for schema.org. */
export function isoWithOffset(at: Date): string {
  const offset = londonOffsetMinutes(at);
  const local = new Date(at.getTime() + offset * 60_000).toISOString().slice(0, 19);
  const sign = offset >= 0 ? "+" : "-";
  const abs = Math.abs(offset);
  const hh = String(Math.floor(abs / 60)).padStart(2, "0");
  const mm = String(abs % 60).padStart(2, "0");
  return `${local}${sign}${hh}:${mm}`;
}

/* ---------- display ---------- */

function utcDate(date: string): Date {
  return new Date(`${date}T12:00:00Z`);
}

export function dateParts(date: string) {
  const d = utcDate(date);
  const fmt = (opts: Intl.DateTimeFormatOptions) =>
    d.toLocaleDateString("en-GB", { ...opts, timeZone: "UTC" });
  return {
    weekday: fmt({ weekday: "short" }),
    weekdayLong: fmt({ weekday: "long" }),
    day: String(d.getUTCDate()),
    month: fmt({ month: "short" }),
    monthLong: fmt({ month: "long" }),
    year: String(d.getUTCFullYear()),
  };
}

/** "Sat 14 Nov 2026" */
export function formatGigDate(date: string, withYear = true): string {
  const p = dateParts(date);
  return `${p.weekday} ${p.day} ${p.month}${withYear ? ` ${p.year}` : ""}`;
}

/**
 * The gig form's read-back of the picked date, in words. A phone's date
 * picker shows whatever order the phone's region uses, so 03/04 can mean
 * either month; "Friday 3 April 2026" can't. Early-hours starts say which
 * morning they fall on. "" until there's a valid date.
 */
export function describeGigWhen(date: string, startTime: string | null | undefined): string {
  const parsed = /^\d{4}-\d{2}-\d{2}$/.test(date) ? utcDate(date) : null;
  if (!parsed || Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== date) {
    return "";
  }
  const long = (d: string) => {
    const p = dateParts(d);
    return `${p.weekdayLong} ${p.day} ${p.monthLong}`;
  };
  const day = `${long(date)} ${dateParts(date).year}`;
  if (!startTime || !/^([01]\d|2[0-3]):[0-5]\d$/.test(startTime)) {
    return day;
  }
  if (Number(startTime.slice(0, 2)) < EARLY_HOURS_BEFORE) {
    return `${day}, ${startTime} (the early hours of ${long(addDays(date, 1))})`;
  }
  return `${day}, ${startTime}`;
}

/** "Tonight", "Tomorrow", "In 5 days" or "" when more than a fortnight away. */
export function countdown(date: string, now: Date): string {
  const night = currentNight(now);
  const days = Math.round(
    (utcDate(date).getTime() - utcDate(night).getTime()) / 86_400_000,
  );
  if (days === 0) return "Tonight";
  if (days === 1) return "Tomorrow";
  if (days > 1 && days <= 14) return `In ${days} days`;
  return "";
}

export const STATUS_LABELS: Record<GigStatus, string> = {
  tickets: "Tickets",
  free: "Free entry",
  "sold-out": "Sold out",
  tba: "Location TBA",
};

/** Venue line for the public site; a TBA location never shows a venue. */
export function placeLine(gig: Pick<Gig, "venue" | "town" | "status">): string {
  if (gig.status === "tba" || !gig.venue) {
    return gig.status === "tba" ? `Location TBA, ${gig.town}` : gig.town;
  }
  return `${gig.venue}, ${gig.town}`;
}
