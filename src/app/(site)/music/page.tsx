import type { Metadata } from "next";
import SoundCloudEmbed, { isProfileUrl } from "@/components/shared/SoundCloudEmbed";
import Credits from "@/components/site/Credits";
import { mixes, siteSettings } from "@/server/data";

export const metadata: Metadata = {
  title: "Music",
  description: "Tommy B's hard trance tracks, mixes and sets on SoundCloud.",
  openGraph: { title: "Tommy B | Music", url: "/music" },
};

const mono = "font-(family-name:--font-space-mono)";

export default function MusicPage() {
  const settings = siteSettings();
  const list = mixes();
  const featured = settings.featuredTrack;
  const profile = settings.links.soundcloud;

  return (
    <main className="relative overflow-hidden px-6 pb-24 pt-32">
      <div className="section-fade relative mx-auto max-w-4xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h1 className="distressed font-(family-name:--font-display) text-3xl uppercase text-br-platinum md:text-5xl">
            Music
          </h1>
          <p className={`${mono} text-xs tracking-[0.3em] text-br-chrome/70`}>SC/FEED</p>
        </div>
        <hr className="beam-line mt-8" />

        {featured && !isProfileUrl(featured) ? (
          <div className="glass-panel mt-10 rounded-2xl p-3 shadow-[0_0_80px_rgba(224,123,36,0.12)] md:p-4">
            <div className="overflow-hidden rounded-xl">
              <SoundCloudEmbed url={featured} height={300} visual title="Featured track by Tommy B" />
            </div>
          </div>
        ) : null}

        {list.length ? (
          <section aria-labelledby="mixes" className="mt-16">
            <h2 id="mixes" className={`${mono} text-xs tracking-[0.3em] text-br-chrome/70`}>
              MIXES AND SETS — {list.length}
            </h2>
            <ul className="mt-6 space-y-4">
              {list.map((mix) => (
                <li key={mix.id} className="glass-panel overflow-hidden rounded-xl p-2">
                  <SoundCloudEmbed url={mix.url} height={166} title={mix.title} />
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {profile ? (
          <section aria-labelledby="latest" className="mt-16">
            <h2 id="latest" className={`${mono} text-xs tracking-[0.3em] text-br-chrome/70`}>
              LATEST ON SOUNDCLOUD
            </h2>
            <div className="glass-panel mt-6 rounded-2xl p-3 md:p-4">
              <div className="overflow-hidden rounded-xl">
                <SoundCloudEmbed url={profile} height={450} />
              </div>
            </div>
            <a
              href={profile}
              target="_blank"
              rel="noopener noreferrer"
              className={`mt-6 inline-flex min-h-11 items-center ${mono} text-xs tracking-[0.25em] text-br-teal underline-offset-4 hover:underline md:min-h-0`}
            >
              STREAMS AND FREE DOWNLOADS ON SOUNDCLOUD →
            </a>
          </section>
        ) : null}

        <div className="mt-20">
          <p className={`${mono} text-xs tracking-[0.3em] text-br-chrome/70`}>RCRD — TRACK RECORD</p>
          <div className="mt-6">
            <Credits />
          </div>
        </div>
      </div>
    </main>
  );
}
