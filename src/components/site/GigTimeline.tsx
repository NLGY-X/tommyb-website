import { dateParts, formatGigDate, placeLine } from "@/lib/gigs";
import type { Gig } from "@/lib/types";
import { ACCENTS, CalendarLink, GigAction, Poster } from "./GigBits";

/* The axis runs 21:00 to 05:00, like a club night does. */
const AXIS_START_MIN = 21 * 60;
const AXIS_MINUTES = 8 * 60;
const AXIS_TICKS = ["21:00", "23:00", "01:00", "03:00", "05:00"];

const mono = "font-(family-name:--font-space-mono)";
const display = "font-(family-name:--font-display)";

/** Minutes past 21:00, or null if the start is outside the night (an afternoon festival slot, say). */
function axisOffset(startTime: string): number | null {
  const [h, m] = startTime.split(":").map(Number);
  let mins = h * 60 + m;
  if (mins < AXIS_START_MIN) mins += 24 * 60;
  const offset = mins - AXIS_START_MIN;
  return offset >= 0 && offset < AXIS_MINUTES ? offset : null;
}

/*
 * Only the start time is known, not the length, so the set is drawn as a
 * marker at the start with a beam that fades out towards the end of the
 * night rather than a block that would claim an end time.
 */
function Lane({ gig, accent }: { gig: Gig; accent: string }) {
  const offset = gig.startTime ? axisOffset(gig.startTime) : null;
  return (
    <div
      className="relative h-10"
      style={{
        backgroundImage: "linear-gradient(to right, rgba(255,255,255,0.07) 1px, transparent 1px)",
        backgroundSize: "25% 100%",
      }}
    >
      {offset !== null ? (
        <div
          className="absolute inset-y-1.5 right-0 flex items-center overflow-hidden rounded-l"
          style={{
            left: `${(offset / AXIS_MINUTES) * 100}%`,
            background: `linear-gradient(90deg, ${accent} 0%, ${accent}b3 22%, ${accent}26 70%, transparent 100%)`,
            borderLeft: `3px solid ${accent}`,
          }}
        >
          <div aria-hidden className="timeline-wave absolute inset-0 opacity-40" />
          <span className={`relative pl-2 ${mono} text-[11px] font-bold tracking-[0.15em] text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.7)]`}>
            ON {gig.startTime}
          </span>
        </div>
      ) : (
        <p className={`absolute inset-y-0 left-2 flex items-center ${mono} text-[10px] tracking-[0.25em] text-br-chrome/60`}>
          {gig.startTime ? `STARTS ${gig.startTime}` : "SET TIME TBA"}
        </p>
      )}
    </div>
  );
}

export default function GigTimeline({ gigs }: { gigs: Gig[] }) {
  if (!gigs.length) {
    return null;
  }
  const anyTimed = gigs.some((g) => g.startTime && axisOffset(g.startTime) !== null);

  return (
    <>
      {/* desktop: the club-night timeline */}
      <div className="hidden md:block">
        <div className="grid grid-cols-[230px_minmax(0,1fr)_150px] items-end gap-6 border-b border-white/10 pb-3">
          <p className={`${mono} text-[10px] tracking-[0.25em] text-br-chrome/60`}>DATE / TOWN</p>
          <div className="relative h-4">
            {anyTimed
              ? AXIS_TICKS.map((tick, i) => (
                  <span
                    key={tick}
                    className={`absolute ${i === 0 ? "" : i === AXIS_TICKS.length - 1 ? "-translate-x-full" : "-translate-x-1/2"} ${mono} text-[10px] tracking-widest text-br-chrome/50`}
                    style={{ left: `${i * 25}%` }}
                  >
                    {tick}
                  </span>
                ))
              : (
                  <span className={`${mono} text-[10px] tracking-[0.25em] text-br-chrome/60`}>THE NIGHT</span>
                )}
          </div>
          <p className={`text-right ${mono} text-[10px] tracking-[0.25em] text-br-chrome/60`}>ENTRY</p>
        </div>

        <ol>
          {gigs.map((gig, index) => {
            const accent = ACCENTS[index % ACCENTS.length];
            const d = dateParts(gig.date);
            return (
              <li
                key={gig.id}
                className="grid grid-cols-[230px_minmax(0,1fr)_150px] items-center gap-6 border-b border-white/10 py-5"
              >
                <div className="flex items-center gap-4">
                  <Poster gig={gig} width={96} height={128} className="h-16 w-12 border border-white/15" />
                  <div className="border-l-2 pl-3" style={{ borderColor: accent }}>
                    <p className={`${mono} text-[11px] tracking-[0.2em] text-br-chrome`}>
                      <time dateTime={gig.date}>
                        {d.weekday.toUpperCase()} {d.day} {d.month.toUpperCase()}
                      </time>
                    </p>
                    <p className={`mt-1 ${display} text-base text-br-platinum`}>{gig.town}</p>
                  </div>
                </div>
                <div className="min-w-0">
                  <p className="mb-2 truncate font-(family-name:--font-inter) text-sm text-br-platinum">
                    <span className="font-semibold">{gig.name}</span>
                    <span className="text-br-chrome"> · {gig.status === "tba" ? "Location TBA" : gig.venue || gig.town}</span>
                    {gig.note ? <span className="text-br-chrome/70"> · {gig.note}</span> : null}
                  </p>
                  <Lane gig={gig} accent={accent} />
                </div>
                <div className="flex flex-col items-end gap-1">
                  <GigAction gig={gig} />
                  <CalendarLink gig={gig} />
                </div>
              </li>
            );
          })}
        </ol>
      </div>

      {/* phone: stacked cards */}
      <ol className="space-y-3 md:hidden">
        {gigs.map((gig, index) => {
          const accent = ACCENTS[index % ACCENTS.length];
          return (
            <li
              key={gig.id}
              className="glass-panel rounded-xl border-l-2 px-5 py-4"
              style={{ borderLeftColor: accent }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className={`${mono} text-[11px] tracking-[0.2em] text-br-chrome`}>
                    <time dateTime={gig.date}>{formatGigDate(gig.date, false).toUpperCase()}</time>
                    {gig.startTime ? ` · ON ${gig.startTime}` : ""}
                  </p>
                  <p className={`mt-1 ${display} text-lg leading-tight text-br-platinum`}>{gig.name}</p>
                  <p className="mt-1 font-(family-name:--font-inter) text-sm text-br-chrome">{placeLine(gig)}</p>
                  {gig.note ? (
                    <p className="mt-1 font-(family-name:--font-inter) text-xs text-br-chrome/70">{gig.note}</p>
                  ) : null}
                </div>
                <Poster gig={gig} width={128} height={170} className="h-[5.5rem] w-16 border border-white/15" />
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1">
                <GigAction gig={gig} />
                <CalendarLink gig={gig} />
              </div>
            </li>
          );
        })}
      </ol>
    </>
  );
}
