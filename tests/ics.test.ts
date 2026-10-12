import { test } from "node:test";
import assert from "node:assert/strict";
import { escapeText, foldLine, gigToIcs, icsFileName } from "../src/lib/ics.ts";
import type { Gig } from "../src/lib/types.ts";

const base: Gig = {
  id: 7,
  date: "2026-07-11",
  startTime: "23:00",
  name: "Hard Trance Night",
  venue: "The Venue",
  town: "Oxford",
  ticketUrl: "https://tickets.example.com/tb",
  status: "tickets",
  poster: null,
  note: "Over 18s, ID required",
};
const opts = { siteUrl: "https://tommybmusic.co.uk", now: new Date("2026-06-01T10:00:00Z") };

test("a timed gig becomes a UTC event with a nominal three-hour length", () => {
  const ics = gigToIcs(base, opts);
  assert.ok(ics.startsWith("BEGIN:VCALENDAR\r\nVERSION:2.0\r\n"));
  assert.ok(ics.endsWith("END:VCALENDAR\r\n"));
  assert.match(ics, /\r\nUID:gig-7@tommybmusic\.co\.uk\r\n/);
  assert.match(ics, /\r\nDTSTAMP:20260601T100000Z\r\n/);
  // 23:00 BST is 22:00 UTC
  assert.match(ics, /\r\nDTSTART:20260711T220000Z\r\n/);
  assert.match(ics, /\r\nDTEND:20260712T010000Z\r\n/);
  assert.match(ics, /\r\nSUMMARY:Tommy B at Hard Trance Night\r\n/);
  assert.match(ics, /\r\nLOCATION:The Venue\\, Oxford\r\n/);
  assert.match(ics, /\r\nURL:https:\/\/tickets\.example\.com\/tb\r\n/);
  // every line ends CRLF, no bare LF
  assert.equal(ics.replace(/\r\n/g, "").includes("\n"), false);
});

test("a gig with no start time is an all-day event", () => {
  const ics = gigToIcs({ ...base, startTime: null, ticketUrl: null }, opts);
  assert.match(ics, /\r\nDTSTART;VALUE=DATE:20260711\r\n/);
  assert.match(ics, /\r\nDTEND;VALUE=DATE:20260712\r\n/);
  assert.equal(ics.includes("URL:"), false);
});

test("a TBA location keeps the venue out of the calendar", () => {
  const ics = gigToIcs({ ...base, status: "tba", venue: "Secret" }, opts);
  assert.match(ics, /LOCATION:Location TBA\\, Oxford/);
  assert.equal(ics.includes("Secret"), false);
});

test("text is escaped and long lines are folded at 75 octets", () => {
  assert.equal(escapeText("a,b;c\\d\ne"), "a\\,b\\;c\\\\d\\ne");
  const long = "DESCRIPTION:" + "é".repeat(60);
  const folded = foldLine(long);
  for (const line of folded.split("\r\n")) {
    assert.ok(new TextEncoder().encode(line).length <= 75);
  }
  assert.equal(folded.replace(/\r\n /g, ""), long);
});

test("file names are safe", () => {
  assert.equal(
    icsFileName({ date: "2026-07-11", name: "Rave / Night: Vol 2!" }),
    "tommy-b-2026-07-11-rave-night-vol-2.ics",
  );
});
