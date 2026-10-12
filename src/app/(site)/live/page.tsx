import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import TwitchChat from "@/components/bigroom/TwitchChat";
import TwitchStage from "@/components/bigroom/TwitchStage";
import { siteSettings } from "@/server/data";

export const metadata: Metadata = {
  title: "Live",
  description: "Tommy B live: hard trance sets streamed from the booth on Twitch.",
  openGraph: { title: "Tommy B | Live", url: "/live" },
};

/*
 * Only exists once Tommy adds his Twitch link in the admin. Both embeds read
 * the hostname on the client for Twitch's `parent` check, so no domain list
 * needs maintaining.
 */
export default function LivePage() {
  const { twitch, links } = siteSettings();
  if (!twitch) {
    notFound();
  }
  const mono = "font-(family-name:--font-space-mono)";

  return (
    <main className="relative overflow-hidden px-6 pb-24 pt-32">
      <div className="section-fade relative mx-auto max-w-6xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h1 className="distressed font-(family-name:--font-display) text-3xl uppercase text-br-platinum md:text-5xl">
            Live Sets
          </h1>
          <p className={`${mono} text-xs tracking-[0.3em] text-br-chrome/70`}>STRM/LIVE — TWITCH</p>
        </div>
        <hr className="beam-line mt-8" />

        {/* 340px: Twitch's chat settings panel clips below about 330px wide. */}
        <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_340px]">
          <div className="glass-panel rounded-2xl p-3 shadow-[0_0_80px_rgba(224,123,36,0.15)] md:p-4">
            <TwitchStage channel={twitch} />
          </div>
          <div className="glass-panel hidden overflow-hidden rounded-2xl lg:flex lg:flex-col">
            <hr aria-hidden className="beam-line" />
            <TwitchChat channel={twitch} />
          </div>
        </div>

        <div className="mt-10 grid gap-10 border-t border-white/10 pt-8 md:grid-cols-2">
          <div>
            <p className={`${mono} text-[10px] tracking-[0.3em] text-br-chrome/70`}>01 — FOLLOW</p>
            <p className="mt-3 font-(family-name:--font-inter) text-sm leading-relaxed text-br-chrome">
              Follow the channel and Twitch tells you when he goes live:{" "}
              <a href={links.twitch} target="_blank" rel="noopener noreferrer" className="text-br-teal underline-offset-4 hover:underline">
                twitch.tv/{twitch}
              </a>
            </p>
          </div>
          <div>
            <p className={`${mono} text-[10px] tracking-[0.3em] text-br-chrome/70`}>02 — MISSED IT</p>
            <p className="mt-3 font-(family-name:--font-inter) text-sm leading-relaxed text-br-chrome">
              Mixes and sets are on the{" "}
              <Link href="/music" className="text-br-teal underline-offset-4 hover:underline">
                music page
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
