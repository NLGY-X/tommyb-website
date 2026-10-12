import type { Metadata } from "next";
import Link from "next/link";
import { gigs } from "@/data/gigs";
import type { Gig } from "@/data/types";

export const metadata: Metadata = {
  title: "Tour Dates",
  description:
    "Tommy B tour dates. Clubs, festivals and undisclosed locations across the UK.",
};

/* Timeline axis runs 21:00 to 05:00, like a club night does. */
const AXIS_START_MIN = 21 * 60;
const AXIS_HOURS = 8;
const AXIS_TICKS = ["21:00", "23:00", "01:00", "03:00", "05:00"];

/* Per-row accent, cycling through the palette like the room lights do. */
const ACCENTS = ["#d43d2f", "#e07b24", "#2fa8a0", "#d8cfc0", "#b0542a", "#c2a24a"];

function axisOffset(setStart: string): number {
  const [h, m] = setStart.split(":").map(Number);
  let mins = h * 60 + m;
  if (mins < AXIS_START_MIN) {
    mins += 24 * 60;
  }
  return mins - AXIS_START_MIN;
}

function formatSetLength(hours: number): string {
  const whole = Math.floor(hours);
  const mins = Math.round((hours - whole) * 60);
  return mins === 0 ? `${whole}h` : `${whole}h${mins}`;
}

function shortDate(displayDate: string): string {
  return displayDate.replace(/ \d{4}$/, "");
}

function monthLabel(date: string): string {
  return new Date(`${date}T00:00:00Z`)
    .toLocaleString("en-GB", { month: "short", timeZone: "UTC" })
    .toUpperCase();
}

function StatusBadge({ status }: { status: Gig["status"] }) {
  if (status === "sold-out") {
    return (
      <span className="inline-flex min-h-11 items-center border border-br-chrome/40 px-3 font-(family-name:--font-space-mono) text-[10px] tracking-[0.2em] text-br-chrome md:min-h-0 md:py-1.5">
        SOLD OUT
      </span>
    );
  }
  if (status === "locked") {
    return (
      <Link
        href="/booking"
        className="inline-flex min-h-11 items-center border border-br-gold/60 px-3 font-(family-name:--font-space-mono) text-[10px] tracking-[0.2em] text-br-gold transition-colors hover:border-br-gold hover:text-br-platinum md:min-h-0 md:py-1.5"
      >
        ON REQUEST
      </Link>
    );
  }
  return (
    <Link
      href="/booking"
      className="light-sweep inline-flex min-h-11 items-center bg-br-platinum px-3 font-(family-name:--font-space-mono) text-[10px] font-bold tracking-[0.2em] text-br-space transition-colors hover:bg-br-red hover:text-br-platinum md:min-h-0 md:py-1.5"
    >
      TICKETS
    </Link>
  );
}

function SetBlock({ gig, accent }: { gig: Gig; accent: string }) {
  const left = (axisOffset(gig.setStart) / (AXIS_HOURS * 60)) * 100;
  const width = (gig.setHours / AXIS_HOURS) * 100;
  const hatched = gig.status !== "tickets";

  return (
    <div
      className="absolute top-1/2 flex h-10 -translate-y-1/2 items-center justify-between gap-3 overflow-hidden rounded px-3"
      style={{
        left: `${left}%`,
        width: `${width}%`,
        background: hatched
          ? `repeating-linear-gradient(45deg, ${accent}59 0 6px, ${accent}14 6px 12px)`
          : `linear-gradient(180deg, ${accent} 0%, ${accent}b3 100%)`,
        border: `1px solid ${accent}80`,
      }}
    >
      {!hatched ? (
        <div aria-hidden className="timeline-wave absolute inset-0 opacity-40" />
      ) : null}
      <span className="relative truncate font-(family-name:--font-inter) text-[11px] font-semibold text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">
        {gig.status === "locked" ? "Undisclosed location" : gig.venue}
      </span>
      <span className="relative shrink-0 font-(family-name:--font-space-mono) text-[10px] text-white/85 drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">
        {formatSetLength(gig.setHours)}
      </span>
    </div>
  );
}

export default function EventsPage() {
  const range =
    gigs.length > 0
      ? `${monthLabel(gigs[0].date)} — ${monthLabel(gigs[gigs.length - 1].date)}`
      : "";

  return (
    <main className="relative px-6 pb-24 pt-32">
      <div className="section-fade mx-auto max-w-6xl">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h1 className="font-(family-name:--font-display) text-2xl tracking-[0.15em] text-br-platinum md:text-3xl">
            TOMMY B — LIVE 2026
          </h1>
          <p className="font-(family-name:--font-space-mono) text-xs tracking-[0.3em] text-br-chrome">
            {gigs.length > 0 ? <>{gigs.length} SHOWS&nbsp;&nbsp;{range}</> : "DATES TBA"}
          </p>
        </div>

        {gigs.length === 0 ? (
          <p className="mt-10 max-w-xl font-(family-name:--font-inter) text-sm leading-relaxed text-br-chrome">
            New dates are landing soon. Follow on SoundCloud for the latest, or
            head to the booking page to bring Tommy to your night.
          </p>
        ) : null}

        {/* desktop: timeline grid */}
        <div className={gigs.length === 0 ? "hidden" : "mt-10 hidden md:block"}>
          <div className="grid grid-cols-[170px_minmax(0,1fr)_120px] items-center gap-4 border-b border-white/10 pb-3">
            <p className="font-(family-name:--font-space-mono) text-[10px] tracking-[0.25em] text-br-chrome/60">
              DATE / CITY
            </p>
            <div className="relative h-4">
              {AXIS_TICKS.map((tick, i) => (
                <span
                  key={tick}
                  className="absolute -translate-x-1/2 font-(family-name:--font-space-mono) text-[10px] tracking-widest text-br-chrome/50"
                  style={{ left: `${i * 25}%` }}
                >
                  {tick}
                </span>
              ))}
            </div>
            <p className="text-right font-(family-name:--font-space-mono) text-[10px] tracking-[0.25em] text-br-chrome/60">
              STATUS
            </p>
          </div>

          {gigs.map((gig, index) => (
            <div
              key={gig.id}
              className="grid grid-cols-[170px_minmax(0,1fr)_120px] items-center gap-4 border-b border-white/10 py-4"
            >
              <div className="border-l-2 pl-3" style={{ borderColor: ACCENTS[index % ACCENTS.length] }}>
                <p className="font-(family-name:--font-space-mono) text-[10px] tracking-[0.2em] text-br-chrome">
                  {shortDate(gig.displayDate).toUpperCase()}
                </p>
                <p className="mt-1 font-(family-name:--font-display) text-sm text-br-platinum">
                  {gig.city}
                </p>
              </div>
              <div
                className="relative h-14"
                style={{
                  backgroundImage:
                    "linear-gradient(to right, rgba(255,255,255,0.06) 1px, transparent 1px)",
                  backgroundSize: "25% 100%",
                }}
              >
                <SetBlock gig={gig} accent={ACCENTS[index % ACCENTS.length]} />
              </div>
              <div className="text-right">
                <StatusBadge status={gig.status} />
              </div>
            </div>
          ))}
        </div>

        {/* mobile: stacked cards */}
        <div className="mt-10 space-y-3 md:hidden">
          {gigs.map((gig, index) => (
            <div
              key={gig.id}
              className="glass-panel rounded-xl border-l-2 px-5 py-4"
              style={{ borderLeftColor: ACCENTS[index % ACCENTS.length] }}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-(family-name:--font-space-mono) text-[10px] tracking-[0.2em] text-br-chrome">
                    {shortDate(gig.displayDate).toUpperCase()}
                  </p>
                  <p className="mt-1 font-(family-name:--font-display) text-base text-br-platinum">
                    {gig.city}
                  </p>
                  <p className="mt-0.5 font-(family-name:--font-inter) text-sm text-br-chrome">
                    {gig.status === "locked"
                      ? "Undisclosed location"
                      : `${gig.venue} · ${gig.name}`}
                  </p>
                  <p className="mt-1 font-(family-name:--font-space-mono) text-[10px] text-br-chrome/60">
                    {gig.setStart} — {formatSetLength(gig.setHours)} SET
                  </p>
                  {gig.note ? (
                    <p className="mt-2 font-(family-name:--font-inter) text-xs text-br-chrome/60">
                      {gig.note}
                    </p>
                  ) : null}
                </div>
                <StatusBadge status={gig.status} />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <Link
            href="/booking"
            className="light-sweep inline-block bg-br-platinum px-8 py-3.5 font-(family-name:--font-space-mono) text-sm font-bold tracking-[0.1em] text-br-space transition-colors hover:bg-br-red hover:text-br-platinum"
          >
            BOOK TOMMY B
          </Link>
        </div>
      </div>
    </main>
  );
}
