import Link from "next/link";
import { countdown, dateParts, placeLine } from "@/lib/gigs";
import type { Gig } from "@/lib/types";
import { CalendarLink, GigAction, Poster } from "./GigBits";

const mono = "font-(family-name:--font-space-mono)";
const display = "font-(family-name:--font-display)";

/*
 * The next gig as a flyer pasted up straight under the hero: hazard-tape
 * edge in the artwork's three colours, the date big enough to read across
 * a room, and the poster tilted like it was stuck on a wall.
 */
export default function NextGigFlyer({ gig, now }: { gig: Gig; now: Date }) {
  const d = dateParts(gig.date);
  const soon = countdown(gig.date, now);
  return (
    <section aria-labelledby="next-gig" className="relative px-4 pt-6 md:px-6 md:pt-0">
      <div className="mx-auto max-w-6xl">
        <div className="flyer relative overflow-hidden border border-white/10 bg-[#0c0b0b] shadow-[0_30px_80px_rgba(0,0,0,0.6)]">
          <div aria-hidden className="flyer-tape h-2.5" />
          <div className="grid grid-cols-[1fr_auto] gap-x-5 gap-y-6 p-5 sm:p-7 md:grid-cols-[auto_1fr_auto] md:items-center md:gap-x-10 md:p-10">
            {/* date */}
            <div className="md:border-r md:border-white/10 md:pr-10">
              <p className={`${mono} text-[11px] tracking-[0.3em] text-br-amber`}>
                NEXT UP{soon ? ` · ${soon.toUpperCase()}` : ""}
              </p>
              <p className="mt-3 flex items-end gap-3">
                <span className={`distressed ${display} text-[5.5rem] leading-[0.8] text-br-platinum md:text-[7.5rem]`}>
                  {d.day}
                </span>
                <span className={`${mono} pb-1 text-sm font-bold leading-tight tracking-[0.2em] text-br-chrome`}>
                  {d.weekday.toUpperCase()}
                  <br />
                  {d.month.toUpperCase()}
                  <br />
                  {d.year}
                </span>
              </p>
            </div>

            {/* poster: beside the date on a phone, far right on desktop */}
            {gig.poster ? (
              <Poster
                gig={gig}
                width={240}
                height={320}
                sizes="(min-width: 768px) 200px, 96px"
                className="row-start-1 col-start-2 h-32 w-24 rotate-2 border-4 border-br-platinum/90 shadow-[0_12px_30px_rgba(0,0,0,0.7)] md:col-start-3 md:h-64 md:w-48 md:rotate-3"
              />
            ) : (
              <span aria-hidden className="col-start-2 row-start-1 md:hidden" />
            )}

            {/* details */}
            <div className="col-span-2 md:col-span-1 md:col-start-2 md:row-start-1">
              <h2
                id="next-gig"
                className={`distressed ${display} text-[clamp(2.1rem,6.5vw,4.6rem)] uppercase leading-[0.95] tracking-tight text-br-platinum`}
              >
                {gig.name}
              </h2>
              <p className="mt-4 font-(family-name:--font-inter) text-base text-br-platinum/90 md:text-lg">
                {placeLine(gig)}
                {gig.startTime ? (
                  <span className="text-br-chrome"> · Tommy on from {gig.startTime}</span>
                ) : null}
              </p>
              {gig.note ? (
                <p className="mt-2 font-(family-name:--font-inter) text-sm text-br-chrome">{gig.note}</p>
              ) : null}
              <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
                <GigAction gig={gig} size="lg" />
                <CalendarLink gig={gig} />
                <Link
                  href="/events"
                  className={`inline-flex min-h-11 items-center ${mono} text-[11px] tracking-[0.2em] text-br-chrome underline-offset-4 hover:text-br-platinum hover:underline md:min-h-9`}
                >
                  ALL DATES →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
