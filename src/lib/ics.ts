import { gigStart, placeLine } from "./gigs.ts";
import type { Gig } from "./types.ts";

/* Nominal length for a timed gig. Calendars show a zero-length event as a sliver. */
const DEFAULT_HOURS = 3;

/** RFC 5545 text escaping. */
export function escapeText(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

/** Folds lines longer than 75 octets, as the spec requires, without splitting a UTF-8 character. */
export function foldLine(line: string): string {
  const encoder = new TextEncoder();
  if (encoder.encode(line).length <= 75) {
    return line;
  }
  const out: string[] = [];
  let current = "";
  let size = 0;
  let limit = 75;
  for (const char of line) {
    const bytes = encoder.encode(char).length;
    if (size + bytes > limit) {
      out.push(current);
      current = "";
      size = 0;
      limit = 74; /* continuation lines start with a space */
    }
    current += char;
    size += bytes;
  }
  out.push(current);
  return out.join("\r\n ");
}

function stamp(at: Date): string {
  return at.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

function compactDate(date: string): string {
  return date.replace(/-/g, "");
}

function nextDay(date: string): string {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
}

export interface IcsOptions {
  siteUrl: string;
  now: Date;
  artist?: string;
}

export function gigToIcs(gig: Gig, { siteUrl, now, artist = "Tommy B" }: IcsOptions): string {
  const host = new URL(siteUrl).host;
  const start = gigStart(gig);
  const description = [
    gig.note,
    gig.ticketUrl ? `Tickets: ${gig.ticketUrl}` : "",
    `${siteUrl.replace(/\/$/, "")}/events`,
  ]
    .filter(Boolean)
    .join("\n");

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    `PRODID:-//${host}//Gigs//EN`,
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:gig-${gig.id}@${host}`,
    `DTSTAMP:${stamp(now)}`,
    ...(start
      ? [
          `DTSTART:${stamp(start)}`,
          `DTEND:${stamp(new Date(start.getTime() + DEFAULT_HOURS * 3600_000))}`,
        ]
      : [
          `DTSTART;VALUE=DATE:${compactDate(gig.date)}`,
          `DTEND;VALUE=DATE:${compactDate(nextDay(gig.date))}`,
        ]),
    `SUMMARY:${escapeText(`${artist} at ${gig.name}`)}`,
    `LOCATION:${escapeText(placeLine(gig))}`,
    `DESCRIPTION:${escapeText(description)}`,
    ...(gig.ticketUrl ? [`URL:${gig.ticketUrl}`] : []),
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return lines.map(foldLine).join("\r\n") + "\r\n";
}

/** A safe download name, e.g. "tommy-b-2026-11-14-hard-trance-night.ics". */
export function icsFileName(gig: Pick<Gig, "date" | "name">): string {
  const slug = gig.name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
  return `tommy-b-${gig.date}${slug ? `-${slug}` : ""}.ics`;
}
