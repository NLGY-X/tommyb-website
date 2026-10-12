import { test } from "node:test";
import assert from "node:assert/strict";
import {
  countdown,
  currentNight,
  describeGigWhen,
  gigStart,
  isoWithOffset,
  londonToUtc,
  placeLine,
  splitGigs,
} from "../src/lib/gigs.ts";

const g = (date: string, startTime: string | null = null) => ({ date, startTime });

test("a gig stays upcoming through its night and moves to past at 6am London", () => {
  const gigs = [g("2026-11-14", "22:00")];
  // 23:30 GMT on the night itself
  assert.equal(splitGigs(gigs, new Date("2026-11-14T23:30:00Z")).upcoming.length, 1);
  // 05:59 the next morning: still the same night
  assert.equal(splitGigs(gigs, new Date("2026-11-15T05:59:00Z")).upcoming.length, 1);
  // 06:00 the next morning: past
  const after = splitGigs(gigs, new Date("2026-11-15T06:00:00Z"));
  assert.equal(after.upcoming.length, 0);
  assert.equal(after.past.length, 1);
});

test("the 6am cut-off follows British Summer Time", () => {
  // 05:30 UTC on 16 Aug is 06:30 BST, so the 15 Aug night is over
  assert.equal(currentNight(new Date("2026-08-16T05:30:00Z")), "2026-08-16");
  // 04:30 UTC is 05:30 BST, still the night of the 15th
  assert.equal(currentNight(new Date("2026-08-16T04:30:00Z")), "2026-08-15");
});

test("upcoming is soonest first and past is most recent first", () => {
  const now = new Date("2026-10-12T12:00:00Z");
  const { upcoming, past } = splitGigs(
    [g("2026-12-01"), g("2026-10-20", "23:00"), g("2026-10-20", "21:00"), g("2026-01-05"), g("2026-09-30")],
    now,
  );
  assert.deepEqual(
    upcoming.map((x) => `${x.date} ${x.startTime}`),
    ["2026-10-20 21:00", "2026-10-20 23:00", "2026-12-01 null"],
  );
  assert.deepEqual(past.map((x) => x.date), ["2026-09-30", "2026-01-05"]);
});

test("a gig tonight with no start time is still upcoming", () => {
  const { upcoming } = splitGigs([g("2026-10-12")], new Date("2026-10-12T20:00:00Z"));
  assert.equal(upcoming.length, 1);
});

test("London wall-clock time converts to UTC in winter and summer", () => {
  assert.equal(londonToUtc("2026-01-10", "22:00").toISOString(), "2026-01-10T22:00:00.000Z");
  assert.equal(londonToUtc("2026-07-10", "22:00").toISOString(), "2026-07-10T21:00:00.000Z");
  // the night the clocks go back (25 Oct 2026, 02:00 BST becomes 01:00 GMT)
  assert.equal(londonToUtc("2026-10-24", "23:00").toISOString(), "2026-10-24T22:00:00.000Z");
  assert.equal(londonToUtc("2026-10-25", "03:00").toISOString(), "2026-10-25T03:00:00.000Z");
});

test("an early-hours start belongs to the morning after the night's date", () => {
  assert.equal(gigStart(g("2026-01-10", "01:30"))?.toISOString(), "2026-01-11T01:30:00.000Z");
  assert.equal(gigStart(g("2026-01-10", "21:00"))?.toISOString(), "2026-01-10T21:00:00.000Z");
  assert.equal(gigStart(g("2026-01-10")), null);
});

test("schema.org dates carry London's offset", () => {
  assert.equal(isoWithOffset(new Date("2026-07-10T21:00:00Z")), "2026-07-10T22:00:00+01:00");
  assert.equal(isoWithOffset(new Date("2026-01-10T22:00:00Z")), "2026-01-10T22:00:00+00:00");
});

test("countdown labels", () => {
  const now = new Date("2026-10-12T12:00:00Z");
  assert.equal(countdown("2026-10-12", now), "Tonight");
  assert.equal(countdown("2026-10-13", now), "Tomorrow");
  assert.equal(countdown("2026-10-17", now), "In 5 days");
  assert.equal(countdown("2026-12-25", now), "");
});

test("a TBA location never shows the venue", () => {
  assert.equal(placeLine({ venue: "Secret Warehouse", town: "Oxford", status: "tba" }), "Location TBA, Oxford");
  assert.equal(placeLine({ venue: "The Bullingdon", town: "Oxford", status: "tickets" }), "The Bullingdon, Oxford");
});

test("the gig form reads the picked date back in words", () => {
  assert.equal(describeGigWhen("2026-11-21", null), "Saturday 21 November 2026");
  assert.equal(describeGigWhen("2026-11-21", "22:30"), "Saturday 21 November 2026, 22:30");
  assert.equal(
    describeGigWhen("2026-12-31", "02:00"),
    "Thursday 31 December 2026, 02:00 (the early hours of Friday 1 January)",
  );
  assert.equal(describeGigWhen("", "22:00"), "");
  assert.equal(describeGigWhen("2026-02-30", null), "");
  assert.equal(describeGigWhen("2026-11-21", "25:00"), "Saturday 21 November 2026");
});
