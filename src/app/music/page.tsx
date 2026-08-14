import type { Metadata } from "next";
import SoundCloudEmbed from "@/components/shared/SoundCloudEmbed";
import { SOUNDCLOUD_URL } from "@/data/content";

export const metadata: Metadata = {
  title: "Music",
  description:
    "Tommy B. Latest hard trance transmissions, sets and productions.",
};

/* The middle stat used to count a back catalogue pack on a Bandcamp account
   that turned out to be a different Tommy B; it went when the link did. */
const TRACK_RECORD = [
  { value: "270K+", label: "SoundCloud plays — Wired To Respond (2016)" },
  { value: "20+", label: "years on the UK hard trance circuit" },
  { value: "3×", label: "Illusive Festival appearances, plus Boomtown's Imagination Stage" },
];

export default function MusicPage() {
  return (
    <main className="relative overflow-hidden px-6 pb-24 pt-32">
      <div className="section-fade relative mx-auto max-w-4xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h1 className="distressed font-(family-name:--font-display) text-3xl uppercase text-br-platinum md:text-5xl">
            Latest Transmissions
          </h1>
          <p className="font-(family-name:--font-space-mono) text-xs tracking-[0.3em] text-br-chrome/70">
            SC/FEED — LIVE
          </p>
        </div>
        <hr className="beam-line mt-8" />
        <div className="glass-panel mt-10 rounded-2xl p-3 shadow-[0_0_80px_rgba(61,139,255,0.18)] md:p-4">
          <div className="overflow-hidden rounded-xl">
            <SoundCloudEmbed url={SOUNDCLOUD_URL} height={450} color="2fa8a0" />
          </div>
        </div>
        <div className="mt-6 flex flex-wrap gap-8">
          <a
            href={SOUNDCLOUD_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center font-(family-name:--font-space-mono) text-xs tracking-[0.25em] text-br-teal underline-offset-4 hover:underline md:min-h-0"
          >
            STREAMS + FREE DOWNLOADS ON SOUNDCLOUD →
          </a>
        </div>

        <div className="mt-20">
          <p className="font-(family-name:--font-space-mono) text-xs tracking-[0.3em] text-br-chrome/70">
            RCRD/03 — TRACK RECORD
          </p>
          <div className="mt-6 grid gap-10 sm:grid-cols-3">
            {TRACK_RECORD.map((stat) => (
              <div key={stat.label} className="border-t border-white/10 pt-6">
                <p className="font-(family-name:--font-display) text-4xl leading-none text-br-red md:text-5xl">
                  {stat.value}
                </p>
                <p className="mt-4 font-(family-name:--font-inter) text-sm leading-relaxed text-br-chrome">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
