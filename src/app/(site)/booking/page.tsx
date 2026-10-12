import type { Metadata } from "next";
import Image from "next/image";
import SoundCloudEmbed, { isProfileUrl } from "@/components/shared/SoundCloudEmbed";
import Credits from "@/components/site/Credits";
import EnquiryForm from "@/components/site/EnquiryForm";
import { ACCENTS, GigAction } from "@/components/site/GigBits";
import PastGigs from "@/components/site/PastGigs";
import { BOOKING_COPY, BOOKING_EMAIL } from "@/data/content";
import { formatGigDate, placeLine } from "@/lib/gigs";
import { gigsNow, mixes, pressPhotos, siteSettings } from "@/server/data";

export const metadata: Metadata = {
  title: "Booking and press kit",
  description:
    "Book Tommy B for club nights, festivals and free parties. Bio, press photos, tech rider, mixes and past gigs for promoters.",
  openGraph: { title: "Book Tommy B | Press kit", url: "/booking" },
};

const mono = "font-(family-name:--font-space-mono)";
const display = "font-(family-name:--font-display)";

function Heading({ code, title, id }: { code: string; title: string; id?: string }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <h2 id={id} className={`${display} text-2xl uppercase text-br-platinum md:text-3xl`}>
        {title}
      </h2>
      <p className={`${mono} text-xs tracking-[0.3em] text-br-chrome/70`}>{code}</p>
    </div>
  );
}

function kb(bytes: number): string {
  return bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)}MB` : `${Math.max(1, Math.round(bytes / 1024))}KB`;
}

export default function BookingPage() {
  const settings = siteSettings();
  const email = settings.bookingEmail || BOOKING_EMAIL;
  const { upcoming, past } = gigsNow();
  const photos = pressPhotos();
  const featuredMixes = mixes().slice(0, 3);
  const shortBio = settings.shortBio || settings.bio[0] || "";
  const fallbackTrack = settings.featuredTrack || settings.links.soundcloud;
  const hasRider = Boolean(settings.riderText || settings.riderPdf);

  return (
    <main className="relative pb-24 pt-32">
      {/* header */}
      <section className="section-fade px-6">
        <div className="mx-auto max-w-6xl">
          <p className={`${mono} text-xs tracking-[0.3em] text-br-chrome/70`}>BKG / BOOKINGS AND PRESS KIT</p>
          <h1 className={`distressed mt-6 max-w-4xl ${display} text-[clamp(2.4rem,7vw,5.5rem)] uppercase leading-[1.02] tracking-tight text-br-platinum`}>
            Book Tommy&nbsp;B
          </h1>
          <hr className="beam-line mt-10" />
          <div className="mt-10 grid gap-10 lg:grid-cols-[1.3fr_1fr]">
            <div>
              <p className="max-w-xl font-(family-name:--font-inter) text-base leading-relaxed text-br-platinum/90">
                {BOOKING_COPY}
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <a
                  href="#enquire"
                  className={`light-sweep bg-br-platinum px-8 py-3.5 ${mono} text-sm font-bold tracking-[0.1em] text-br-space transition-colors hover:bg-br-red hover:text-br-platinum`}
                >
                  SEND AN ENQUIRY
                </a>
                <a
                  href={`mailto:${email}`}
                  className={`light-sweep border border-br-platinum/40 px-6 py-3.5 ${mono} text-sm font-bold tracking-[0.05em] text-br-platinum transition-colors hover:border-br-platinum`}
                >
                  {email}
                </a>
              </div>
            </div>
            <dl className="self-start">
              {[
                ["BASED", "Oxford, UK"],
                ["SOUND", "Hard trance"],
                ["LABEL", "Project Storm Recordings"],
                ["COMING UP", upcoming.length ? `${upcoming.length} ${upcoming.length === 1 ? "date" : "dates"}` : "Booking now"],
              ].map(([k, v]) => (
                <div key={k} className="flex items-baseline justify-between gap-4 border-b border-white/10 py-3.5">
                  <dt className={`${mono} text-[10px] tracking-[0.25em] text-br-chrome`}>{k}</dt>
                  <dd className={`text-right ${display} text-sm text-br-platinum`}>{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* credits */}
      <section className="px-6 pt-20">
        <div className="mx-auto max-w-6xl">
          <Credits />
        </div>
      </section>

      {/* bio */}
      {shortBio ? (
        <section aria-labelledby="bio" className="px-6 pt-20">
          <div className="mx-auto max-w-6xl">
            <Heading id="bio" title="Bio" code="EPK/01" />
            <hr className="beam-line mt-6 opacity-60" />
            <p className="mt-8 max-w-3xl whitespace-pre-line font-(family-name:--font-inter) text-base leading-relaxed text-br-platinum/90">
              {shortBio}
            </p>
            <p className="mt-4 font-(family-name:--font-inter) text-xs text-br-chrome">
              Free to use in event listings and press.
            </p>
          </div>
        </section>
      ) : null}

      {/* press photos */}
      {photos.length ? (
        <section aria-labelledby="photos" className="px-6 pt-20">
          <div className="mx-auto max-w-6xl">
            <Heading id="photos" title="Press Photos" code={`EPK/02 / ${photos.length}`} />
            <hr className="beam-line mt-6 opacity-60" />
            <ul className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3">
              {photos.map((photo, i) => (
                <li key={photo.id}>
                  <a href={`/uploads/${photo.file}`} target="_blank" rel="noopener noreferrer" className="block overflow-hidden bg-black">
                    <Image
                      src={`/uploads/${photo.file}`}
                      alt={photo.caption ? `Tommy B. ${photo.caption}` : "Tommy B press photo"}
                      width={photo.width ?? 800}
                      height={photo.height ?? 1000}
                      sizes="(min-width: 768px) 33vw, 50vw"
                      className="aspect-[4/5] w-full object-cover transition-transform duration-500 hover:scale-[1.03]"
                    />
                  </a>
                  <div className="mt-2 flex flex-wrap items-baseline justify-between gap-x-3">
                    <a
                      href={`/uploads/${photo.file}?download=tommy-b-press-${i + 1}`}
                      className={`inline-flex min-h-11 items-center ${mono} text-[11px] tracking-[0.2em] text-br-teal underline-offset-4 hover:underline md:min-h-0`}
                    >
                      DOWNLOAD
                    </a>
                    <span className={`${mono} text-[10px] text-br-chrome/70`}>
                      {photo.width && photo.height ? `${photo.width}×${photo.height} · ` : ""}
                      {kb(photo.bytes)}
                    </span>
                  </div>
                  {photo.caption ? (
                    <p className="font-(family-name:--font-inter) text-xs text-br-chrome">{photo.caption}</p>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      {/* mixes */}
      {featuredMixes.length || fallbackTrack ? (
        <section aria-labelledby="mixes" className="px-6 pt-20">
          <div className="mx-auto max-w-6xl">
            <Heading id="mixes" title={featuredMixes.length ? "Mixes" : "Listen"} code="EPK/03" />
            <hr className="beam-line mt-6 opacity-60" />
            <div className="mt-8 grid gap-4 lg:grid-cols-2">
              {featuredMixes.length
                ? featuredMixes.map((mix) => (
                    <div key={mix.id} className="glass-panel overflow-hidden rounded-xl p-2">
                      <SoundCloudEmbed url={mix.url} height={166} title={mix.title} />
                    </div>
                  ))
                : (
                    <div className="glass-panel overflow-hidden rounded-xl p-2 lg:col-span-2">
                      <SoundCloudEmbed url={fallbackTrack} height={isProfileUrl(fallbackTrack) ? 300 : 166} />
                    </div>
                  )}
            </div>
          </div>
        </section>
      ) : null}

      {/* rider */}
      {hasRider ? (
        <section aria-labelledby="rider" className="px-6 pt-20">
          <div className="mx-auto max-w-6xl">
            <Heading id="rider" title="Tech Rider" code="EPK/04" />
            <hr className="beam-line mt-6 opacity-60" />
            {settings.riderText ? (
              <pre className="mt-8 max-w-3xl whitespace-pre-wrap border-l-2 border-br-amber pl-5 font-(family-name:--font-space-mono) text-sm leading-relaxed text-br-platinum/90">
                {settings.riderText}
              </pre>
            ) : null}
            {settings.riderPdf ? (
              <a
                href={`/uploads/${settings.riderPdf}?download=tommy-b-tech-rider`}
                className={`mt-8 inline-flex min-h-11 items-center border border-br-platinum/40 px-6 ${mono} text-xs font-bold tracking-[0.15em] text-br-platinum transition-colors hover:border-br-platinum`}
              >
                DOWNLOAD THE RIDER (PDF)
              </a>
            ) : null}
          </div>
        </section>
      ) : null}

      {/* track record */}
      {upcoming.length || past.length ? (
        <section aria-labelledby="record" className="px-6 pt-20">
          <div className="mx-auto max-w-6xl">
            <Heading id="record" title="Gigs" code="EPK/05" />
            <hr className="beam-line mt-6 opacity-60" />
            {upcoming.length ? (
              <>
                <p className={`mt-8 ${mono} text-xs tracking-[0.3em] text-br-amber`}>COMING UP</p>
                <ul className="mt-3">
                  {upcoming.map((gig, i) => (
                    <li
                      key={gig.id}
                      className="flex flex-wrap items-center justify-between gap-3 border-b border-l-2 border-b-white/10 py-3 pl-4"
                      style={{ borderLeftColor: ACCENTS[i % ACCENTS.length] }}
                    >
                      <p className="font-(family-name:--font-inter) text-sm text-br-platinum/90">
                        <span className={`${mono} mr-3 text-[11px] tracking-[0.15em] text-br-chrome`}>
                          {formatGigDate(gig.date).toUpperCase()}
                        </span>
                        <span className="font-semibold">{gig.name}</span>
                        <span className="text-br-chrome"> · {placeLine(gig)}</span>
                      </p>
                      <GigAction gig={gig} />
                    </li>
                  ))}
                </ul>
              </>
            ) : null}
            {past.length ? (
              <div className="mt-10">
                <PastGigs gigs={past} limit={12} />
              </div>
            ) : null}
          </div>
        </section>
      ) : null}

      {/* enquiry */}
      <section id="enquire" aria-labelledby="enquire-title" className="scroll-mt-24 px-6 pt-24">
        <div className="mx-auto max-w-3xl">
          <h2 id="enquire-title" className={`distressed text-center ${display} text-[clamp(2rem,5vw,3.4rem)] uppercase leading-tight text-br-platinum`}>
            Bring the Tempo Up
          </h2>
          <p className="mx-auto mt-5 max-w-lg text-center font-(family-name:--font-inter) text-sm leading-relaxed text-br-chrome">
            Tell Tommy about your night. He reads every enquiry and replies by email.
          </p>
          <div className="mt-10">
            <EnquiryForm email={email} />
          </div>
        </div>
      </section>
    </main>
  );
}
