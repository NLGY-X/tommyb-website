import type { Metadata } from "next";
import Link from "next/link";
import { TWITCH_CHANNEL } from "@/data/content";
import TwitchStage from "@/components/bigroom/TwitchStage";
import TwitchChat from "@/components/bigroom/TwitchChat";

export const metadata: Metadata = {
  title: "Live",
  description:
    "Tommy B live. Hard trance sets streamed straight from the booth on Twitch.",
};

/*
 * Twitch refuses any embed whose `parent` does not match the domain it runs
 * on. Both embeds read that from the live hostname on the client, so no
 * domain list needs maintaining here — localhost, preview URLs and production
 * all work untouched.
 */

export default function LivePage() {
  return (
    <main className="relative overflow-hidden px-6 pb-24 pt-32">
      <div className="section-fade relative mx-auto max-w-6xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h1 className="distressed font-(family-name:--font-display) text-3xl uppercase text-br-platinum md:text-5xl">
            Live Sets
          </h1>
          <p className="font-(family-name:--font-space-mono) text-xs tracking-[0.3em] text-br-chrome/70">
            STRM/LIVE — TWITCH
          </p>
        </div>
        <hr className="beam-line mt-8" />

        {/*
          340px, not 300: Twitch's own Chat Settings panel is laid out for a
          wider column, and below ~330 its close button, chevrons and toggles
          get clipped by the iframe edge. Nothing inside the embed can be
          reflowed from here, so the column has to give it the room.
        */}
        <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_340px]">
          <div className="glass-panel rounded-2xl p-3 shadow-[0_0_80px_rgba(224,123,36,0.15)] md:p-4">
            <TwitchStage channel={TWITCH_CHANNEL} />
          </div>
          <div className="glass-panel hidden overflow-hidden rounded-2xl lg:flex lg:flex-col">
            {/* The embed brings its own "Stream Chat" heading, so this is just
                the palette's beam catching the top edge of the panel. */}
            <hr aria-hidden className="beam-line" />
            <TwitchChat channel={TWITCH_CHANNEL} />
          </div>
        </div>

        <div className="mt-10 grid gap-10 border-t border-white/10 pt-8 md:grid-cols-3">
          <div>
            <p className="font-(family-name:--font-space-mono) text-[10px] tracking-[0.3em] text-br-chrome/70">
              01 — WHEN
            </p>
            <p className="mt-3 font-(family-name:--font-inter) text-sm leading-relaxed text-br-chrome">
              Sets are announced to the Inner Circle first, then on the dates
              page. The stream goes quiet when the booth does.
            </p>
          </div>
          <div>
            <p className="font-(family-name:--font-space-mono) text-[10px] tracking-[0.3em] text-br-chrome/70">
              02 — FOLLOW
            </p>
            <p className="mt-3 font-(family-name:--font-inter) text-sm leading-relaxed text-br-chrome">
              Follow the channel and Twitch pings you the moment he goes live:{" "}
              <a
                href={`https://twitch.tv/${TWITCH_CHANNEL}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-br-teal underline-offset-4 hover:underline"
              >
                twitch.tv/{TWITCH_CHANNEL}
              </a>
            </p>
          </div>
          <div>
            <p className="font-(family-name:--font-space-mono) text-[10px] tracking-[0.3em] text-br-chrome/70">
              03 — MISSED IT
            </p>
            <p className="mt-3 font-(family-name:--font-inter) text-sm leading-relaxed text-br-chrome">
              Past sets and studio mixes live on the{" "}
              <Link
                href="/music"
                className="text-br-teal underline-offset-4 hover:underline"
              >
                music page
              </Link>
              .
            </p>
          </div>
        </div>

        <p className="mt-10 font-(family-name:--font-space-mono) text-[10px] tracking-[0.2em] text-br-chrome/50">
          HEADS UP: TWITCH CAN MUTE ARCHIVED RECORDINGS THAT CONTAIN OTHER
          ARTISTS&apos; TRACKS. ORIGINALS-ONLY SETS ARCHIVE CLEANEST.
        </p>
      </div>
    </main>
  );
}
