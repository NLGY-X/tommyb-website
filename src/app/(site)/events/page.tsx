import type { Metadata } from "next";
import Link from "next/link";
import GigTimeline from "@/components/site/GigTimeline";
import { GigJsonLd } from "@/components/site/GigBits";
import MailingList from "@/components/site/MailingList";
import PastGigs from "@/components/site/PastGigs";
import { dateParts } from "@/lib/gigs";
import { gigsNow } from "@/server/data";
import { siteUrl } from "@/server/db";

export const metadata: Metadata = {
  title: "Dates",
  description: "Tommy B's upcoming gigs, with tickets and add-to-calendar, plus every past date.",
  openGraph: { title: "Tommy B | Dates", url: "/events" },
};

const mono = "font-(family-name:--font-space-mono)";

export default function EventsPage() {
  const { upcoming, past } = gigsNow();
  const first = upcoming[0];
  const last = upcoming[upcoming.length - 1];
  const range =
    first && last
      ? `${dateParts(first.date).month.toUpperCase()} ${first.date.slice(0, 4)}${
          first.date.slice(0, 7) !== last.date.slice(0, 7)
            ? ` – ${dateParts(last.date).month.toUpperCase()} ${last.date.slice(0, 4)}`
            : ""
        }`
      : "";

  return (
    <main className="relative pt-32">
      <GigJsonLd gigs={upcoming} siteUrl={siteUrl()} />
      <section className="px-6 pb-16">
        <div className="section-fade mx-auto max-w-6xl">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <h1 className="distressed font-(family-name:--font-display) text-[clamp(2.5rem,7vw,5.5rem)] uppercase leading-none tracking-tight text-br-platinum">
              Dates
            </h1>
            <p className={`${mono} text-xs tracking-[0.3em] text-br-chrome`}>
              {upcoming.length ? (
                <>
                  {upcoming.length} {upcoming.length === 1 ? "SHOW" : "SHOWS"}&nbsp;&nbsp;{range}
                </>
              ) : (
                "DATES TBA"
              )}
            </p>
          </div>
          <hr className="beam-line mt-8" />

          {upcoming.length ? (
            <div className="mt-8">
              <GigTimeline gigs={upcoming} />
            </div>
          ) : (
            <p className="mt-10 max-w-xl font-(family-name:--font-inter) text-sm leading-relaxed text-br-chrome">
              New dates are being booked. Sign up below to hear when they go up, or head to the{" "}
              <Link href="/booking" className="text-br-teal underline-offset-4 hover:underline">
                booking page
              </Link>{" "}
              to bring Tommy to your night.
            </p>
          )}
        </div>
      </section>

      <MailingList />

      {past.length ? (
        <section aria-labelledby="past-gigs" className="px-6 pb-20">
          <div className="mx-auto max-w-6xl">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <h2 id="past-gigs" className="font-(family-name:--font-display) text-2xl uppercase text-br-platinum md:text-3xl">
                Past Gigs
              </h2>
              <p className={`${mono} text-xs tracking-[0.3em] text-br-chrome/70`}>ARCHIVE/{past.length}</p>
            </div>
            <hr className="beam-line mt-6 opacity-60" />
            <div className="mt-8">
              <PastGigs gigs={past} />
            </div>
          </div>
        </section>
      ) : null}

      <div className="px-6 pb-24 text-center">
        <Link
          href="/booking"
          className={`light-sweep inline-block bg-br-platinum px-8 py-3.5 ${mono} text-sm font-bold tracking-[0.1em] text-br-space transition-colors hover:bg-br-red hover:text-br-platinum`}
        >
          BOOK TOMMY B
        </Link>
      </div>
    </main>
  );
}
