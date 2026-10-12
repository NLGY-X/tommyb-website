import Link from "next/link";
import HeroSection from "@/components/bigroom/HeroSection";
import SoundCloudEmbed, { isProfileUrl } from "@/components/shared/SoundCloudEmbed";
import Credits from "@/components/site/Credits";
import { ACCENTS, GigAction } from "@/components/site/GigBits";
import MailingList from "@/components/site/MailingList";
import NextGigFlyer from "@/components/site/NextGigFlyer";
import { BOOKING_COPY } from "@/data/content";
import { dateParts, placeLine } from "@/lib/gigs";
import { gigsNow, siteSettings } from "@/server/data";

const TICKER = ["HARD TRANCE", "FREE PARTY CIRCUIT", "EST. EARLY 2000S", "OXFORD, UK", "PROJECT STORM RECORDINGS"];

const mono = "font-(family-name:--font-space-mono)";
const display = "font-(family-name:--font-display)";

export default function Home() {
  const now = new Date();
  const settings = siteSettings();
  const { upcoming } = gigsNow(now);
  const [next, ...rest] = upcoming;
  const more = rest.slice(0, 5);
  const track = settings.featuredTrack || settings.links.soundcloud;

  return (
    <main className="relative">
      <HeroSection tagline={settings.tagline} />

      {next ? <NextGigFlyer gig={next} now={now} /> : null}

      {/* flyer ticker strip */}
      <div className="mt-12 overflow-hidden border-y border-white/10 py-3">
        <div className={`marquee-track ${mono} text-xs tracking-[0.35em] text-br-chrome`}>
          {[...TICKER, ...TICKER].map((item, i) => (
            <span key={i} aria-hidden={i >= TICKER.length} className="flex items-center whitespace-nowrap">
              <span className="px-6">{item}</span>
              <span aria-hidden className="beam-text">
                {"//"}
              </span>
            </span>
          ))}
        </div>
      </div>

      {/* featured track */}
      {track ? (
        <section className="relative px-6 pt-20 md:pt-24">
          <div className="mx-auto max-w-4xl">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <h2 className={`${display} text-3xl uppercase text-br-platinum md:text-4xl`}>Now Playing</h2>
              <p className={`${mono} text-xs tracking-[0.3em] text-br-chrome/70`}>SC/FEATURED</p>
            </div>
            <div className="glass-panel mt-8 rounded-2xl p-3 shadow-[0_0_80px_rgba(224,123,36,0.12)] md:p-4">
              <div className="overflow-hidden rounded-xl">
                {isProfileUrl(track) ? (
                  <SoundCloudEmbed url={track} height={166} />
                ) : (
                  <SoundCloudEmbed url={track} height={300} visual title="Featured track by Tommy B" />
                )}
              </div>
            </div>
            <Link
              href="/music"
              className={`mt-6 inline-flex min-h-11 items-center ${mono} text-xs tracking-[0.25em] text-br-teal underline-offset-4 hover:underline md:min-h-0`}
            >
              MORE MUSIC →
            </Link>
          </div>
        </section>
      ) : null}

      {/* upcoming dates */}
      <section className="px-6 py-20 md:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 className={`distressed ${display} text-[clamp(2.5rem,7vw,5.5rem)] uppercase leading-none tracking-tight text-br-platinum`}>
              {next ? "More Dates" : "Dates"}
            </h2>
            <p className={`${mono} text-xs tracking-[0.3em] text-br-chrome/70`}>
              {upcoming.length ? `${upcoming.length} COMING UP` : "DATES TBA"}
            </p>
          </div>
          <hr className="beam-line mt-8" />
          {!next ? (
            <p className="mt-8 max-w-xl font-(family-name:--font-inter) text-sm leading-relaxed text-br-chrome">
              New dates are being booked. Sign up below to hear first, or if you run a night,{" "}
              <Link href="/booking" className="text-br-teal underline-offset-4 hover:underline">
                get in touch about booking
              </Link>
              .
            </p>
          ) : more.length === 0 ? (
            <p className="mt-8 max-w-xl font-(family-name:--font-inter) text-sm leading-relaxed text-br-chrome">
              That&apos;s the next one. More are being booked; sign up below to hear first.
            </p>
          ) : (
            <ol className="mt-2">
              {more.map((gig, index) => {
                const d = dateParts(gig.date);
                return (
                  <li
                    key={gig.id}
                    className="grid grid-cols-[auto_1fr] items-center gap-x-5 gap-y-3 border-b border-white/10 py-5 sm:grid-cols-[auto_1fr_auto] md:grid-cols-[140px_1fr_auto]"
                  >
                    <time
                      dateTime={gig.date}
                      className={`border-l-2 pl-4 ${mono} text-xs tracking-[0.2em] text-br-chrome`}
                      style={{ borderColor: ACCENTS[(index + 1) % ACCENTS.length] }}
                    >
                      {d.weekday.toUpperCase()} {d.day} {d.month.toUpperCase()}
                    </time>
                    <Link href="/events" className="group min-w-0">
                      <span className={`block truncate ${display} text-lg text-br-platinum transition-transform duration-300 group-hover:translate-x-1 md:text-xl`}>
                        {gig.name}
                      </span>
                      <span className="mt-0.5 block truncate font-(family-name:--font-inter) text-xs text-br-chrome">
                        {placeLine(gig)}
                        {gig.startTime ? ` · from ${gig.startTime}` : ""}
                      </span>
                    </Link>
                    <span className="col-start-2 sm:col-start-auto">
                      <GigAction gig={gig} />
                    </span>
                  </li>
                );
              })}
            </ol>
          )}
          {upcoming.length ? (
            <Link
              href="/events"
              className={`mt-6 inline-flex min-h-11 items-center ${mono} text-xs tracking-[0.25em] text-br-teal underline-offset-4 hover:underline md:min-h-0`}
            >
              ALL DATES AND PAST GIGS →
            </Link>
          ) : null}
        </div>
      </section>

      {/* credits */}
      <section className="px-6 pb-8">
        <div className="mx-auto max-w-6xl">
          <p className={`${mono} text-xs tracking-[0.3em] text-br-chrome/70`}>RCRD — TRACK RECORD</p>
          <div className="mt-6">
            <Credits />
          </div>
        </div>
      </section>

      <MailingList />

      {/* booking cta */}
      <section className="px-6 pb-28">
        <div className="mx-auto max-w-6xl text-center">
          <hr className="beam-line" />
          <h2 className={`distressed mt-14 ${display} text-[clamp(2.2rem,6vw,4.5rem)] uppercase leading-tight text-br-platinum`}>
            Bring the Tempo Up
          </h2>
          <p className="mx-auto mt-6 max-w-xl font-(family-name:--font-inter) text-sm leading-relaxed text-br-chrome">
            {BOOKING_COPY}
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link
              href="/booking#enquire"
              className={`light-sweep bg-br-platinum px-8 py-3.5 ${mono} text-sm font-bold tracking-[0.1em] text-br-space transition-colors hover:bg-br-red hover:text-br-platinum`}
            >
              BOOK TOMMY B
            </Link>
            <Link
              href="/booking"
              className={`light-sweep border border-br-platinum/40 px-8 py-3.5 ${mono} text-sm font-bold tracking-[0.1em] text-br-platinum transition-colors hover:border-br-platinum`}
            >
              PRESS KIT
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
