import Link from "next/link";
import HeroSection from "@/components/bigroom/HeroSection";
import ProductCard from "@/components/bigroom/ProductCard";
import SoundCloudEmbed from "@/components/shared/SoundCloudEmbed";
import { gigs } from "@/data/gigs";
import { products } from "@/data/products";
import { BOOKING_COPY, BOOKING_EMAIL, SOUNDCLOUD_URL } from "@/data/content";

const FEATURED_IDS = ["wired-to-respond", "back-catalogue-pack"];

const TICKER = [
  "HARD TRANCE",
  "FREE PARTY CIRCUIT",
  "EST. EARLY 2000S",
  "OXFORD, UK",
  "PROJECT STORM RECORDINGS",
  "LIVE ON TWITCH",
];

/* Same order as the events timeline, so a date keeps its colour everywhere. */
const ACCENTS = ["#d43d2f", "#e07b24", "#2fa8a0"];

function statusLabel(status: (typeof gigs)[number]["status"]): string {
  if (status === "sold-out") return "SOLD OUT";
  if (status === "locked") return "ON REQUEST";
  return "TICKETS";
}

export default function BigRoomHome() {
  const nextDates = gigs.slice(0, 3);
  const featured = products.filter((product) =>
    FEATURED_IDS.includes(product.id),
  );

  return (
    <main className="relative">
      <HeroSection />

      {/* flyer ticker strip */}
      <div className="overflow-hidden border-y border-white/10 py-3">
        <div className="marquee-track font-(family-name:--font-space-mono) text-xs tracking-[0.35em] text-br-chrome">
          {[...TICKER, ...TICKER].map((item, i) => (
            <span key={i} className="flex items-center whitespace-nowrap">
              <span className="px-6">{item}</span>
              <span aria-hidden className="beam-text">
                {"//"}
              </span>
            </span>
          ))}
        </div>
      </div>

      {/* next dates */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 className="distressed font-(family-name:--font-display) text-[clamp(2.5rem,7vw,5.5rem)] uppercase leading-none tracking-tight text-br-platinum">
              Next Dates
            </h2>
            <p className="font-(family-name:--font-space-mono) text-xs tracking-[0.3em] text-br-chrome/70">
              DTE/06 — 2026
            </p>
          </div>
          <hr className="beam-line mt-8" />
          <div className="mt-2">
            {nextDates.map((gig, index) => (
              <Link
                key={gig.id}
                href="/events"
                className="group grid grid-cols-[auto_1fr_auto] items-center gap-5 border-b border-white/10 py-5 transition-colors hover:bg-white/[0.03] md:grid-cols-[140px_1fr_auto]"
              >
                <span
                  className="border-l-2 pl-4 font-(family-name:--font-space-mono) text-xs tracking-[0.2em] text-br-chrome"
                  style={{ borderColor: ACCENTS[index % ACCENTS.length] }}
                >
                  {gig.displayDate.replace(/ \d{4}$/, "").toUpperCase()}
                </span>
                <span>
                  <span className="block font-(family-name:--font-display) text-lg text-br-platinum transition-transform duration-300 group-hover:translate-x-1 md:text-xl">
                    {gig.city}
                  </span>
                  <span className="mt-0.5 block font-(family-name:--font-inter) text-xs text-br-chrome">
                    {gig.status === "locked"
                      ? `Undisclosed location · ${gig.name}`
                      : `${gig.venue} · ${gig.name}`}
                  </span>
                </span>
                <span
                  className={`font-(family-name:--font-space-mono) text-[10px] tracking-[0.25em] ${
                    gig.status === "sold-out"
                      ? "text-br-chrome/60"
                      : gig.status === "locked"
                        ? "text-br-gold"
                        : "text-br-teal"
                  }`}
                >
                  {statusLabel(gig.status)}
                </span>
              </Link>
            ))}
          </div>
          <Link
            href="/events"
            className="mt-6 inline-flex min-h-11 items-center font-(family-name:--font-space-mono) text-xs tracking-[0.25em] text-br-teal underline-offset-4 hover:underline md:min-h-0"
          >
            ALL TOUR DATES →
          </Link>
        </div>
      </section>

      {/* listen */}
      <section className="relative overflow-hidden px-6 py-24">
        <div className="relative mx-auto max-w-4xl">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 className="font-(family-name:--font-display) text-3xl uppercase text-br-platinum md:text-4xl">
              Latest Transmission
            </h2>
            <p className="font-(family-name:--font-space-mono) text-xs tracking-[0.3em] text-br-chrome/70">
              SC/FEED — LIVE
            </p>
          </div>
          <div className="glass-panel mt-8 rounded-2xl p-3 shadow-[0_0_80px_rgba(61,139,255,0.18)] md:p-4">
            <div className="overflow-hidden rounded-xl">
              <SoundCloudEmbed url={SOUNDCLOUD_URL} height={166} color="2fa8a0" />
            </div>
          </div>
          <Link
            href="/music"
            className="mt-6 inline-flex min-h-11 items-center font-(family-name:--font-space-mono) text-xs tracking-[0.25em] text-br-teal underline-offset-4 hover:underline md:min-h-0"
          >
            MORE MUSIC →
          </Link>
        </div>
      </section>

      {/* featured releases */}
      <section className="px-6 pb-24">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 className="font-(family-name:--font-display) text-3xl uppercase text-br-platinum md:text-4xl">
              From the Catalogue
            </h2>
            <p className="font-(family-name:--font-space-mono) text-xs tracking-[0.3em] text-br-chrome/70">
              CAT/08 — STORE
            </p>
          </div>
          <hr className="beam-line mt-8" />
          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            {featured.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                compact
                catalogNo={`TB-${String(products.indexOf(product) + 1).padStart(2, "0")}`}
              />
            ))}
          </div>
          <Link
            href="/store"
            className="mt-8 inline-flex min-h-11 items-center font-(family-name:--font-space-mono) text-xs tracking-[0.25em] text-br-teal underline-offset-4 hover:underline md:min-h-0"
          >
            VISIT THE STORE →
          </Link>
        </div>
      </section>

      {/* booking cta */}
      <section className="px-6 pb-28">
        <div className="mx-auto max-w-6xl text-center">
          <hr className="beam-line" />
          <h2 className="distressed mt-14 font-(family-name:--font-display) text-[clamp(2.2rem,6vw,4.5rem)] uppercase leading-tight text-br-platinum">
            Bring the Tempo Up
          </h2>
          <p className="mx-auto mt-6 max-w-xl font-(family-name:--font-inter) text-sm leading-relaxed text-br-chrome">
            {BOOKING_COPY}
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <a
              href={`mailto:${BOOKING_EMAIL}`}
              className="light-sweep bg-br-platinum px-8 py-3.5 font-(family-name:--font-space-mono) text-sm font-bold tracking-[0.1em] text-br-space transition-colors hover:bg-br-red hover:text-br-platinum"
            >
              {BOOKING_EMAIL}
            </a>
            <Link
              href="/booking"
              className="light-sweep border border-br-platinum/40 px-8 py-3.5 font-(family-name:--font-space-mono) text-sm font-bold tracking-[0.1em] text-br-platinum transition-colors hover:border-br-platinum"
            >
              Booking Details
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
