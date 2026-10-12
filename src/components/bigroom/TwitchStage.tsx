"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useHostname } from "@/components/shared/useHostname";

const SCRIPT_SRC = "https://player.twitch.tv/js/embed/v1.js";
const PLAYER_ID = "tb-twitch-player";

interface TwitchPlayerInstance {
  addEventListener: (event: string, callback: () => void) => void;
}

interface TwitchGlobal {
  Player: {
    new (id: string, options: Record<string, unknown>): TwitchPlayerInstance;
    ONLINE: string;
    OFFLINE: string;
  };
}

declare global {
  interface Window {
    Twitch?: TwitchGlobal;
  }
}

/* The SDK hangs itself off window.Twitch, so it only ever needs loading once. */
let scriptPromise: Promise<void> | null = null;

function loadTwitch(): Promise<void> {
  if (window.Twitch) {
    return Promise.resolve();
  }
  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = SCRIPT_SRC;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Twitch embed script failed"));
      document.head.appendChild(script);
    });
  }
  return scriptPromise;
}

function OfflinePanel({ channel }: { channel: string }) {
  return (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 px-6 text-center sm:gap-4">
      <div
        aria-hidden
        className="absolute inset-0 bg-br-space"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 70% 60% at 50% 120%, rgba(224,123,36,0.14), transparent), radial-gradient(ellipse 60% 50% at 15% 0%, rgba(212,61,47,0.10), transparent)",
        }}
      />
      <p className="relative font-(family-name:--font-space-mono) text-[10px] tracking-[0.35em] text-br-chrome/70">
        STRM/OFFLINE
      </p>
      <h2 className="distressed relative font-(family-name:--font-display) text-xl uppercase text-br-platinum sm:text-2xl md:text-4xl">
        No Set Right Now
      </h2>
      <hr className="beam-line relative w-full max-w-xs" />
      <p className="relative max-w-sm font-(family-name:--font-inter) text-xs leading-relaxed text-br-chrome sm:text-sm">
        Nothing streaming right now. Follow on Twitch to get a notification when
        Tommy goes live.
      </p>
      <div className="relative mt-2 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/events"
          className="light-sweep inline-flex min-h-11 items-center bg-br-platinum px-6 font-(family-name:--font-space-mono) text-xs font-bold tracking-[0.15em] text-br-space transition-colors hover:bg-br-red hover:text-br-platinum"
        >
          DATES
        </Link>
        <a
          href={`https://twitch.tv/${channel}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-11 items-center border border-br-chrome/40 px-6 font-(family-name:--font-space-mono) text-xs tracking-[0.15em] text-br-platinum transition-colors hover:border-br-teal hover:text-br-teal"
        >
          FOLLOW ON TWITCH
        </a>
      </div>
    </div>
  );
}

export default function TwitchStage({ channel }: { channel: string }) {
  const mountRef = useRef<HTMLDivElement>(null);
  const hostname = useHostname();
  /*
   * Starts offline on purpose. The branded panel covers the embed until the
   * SDK positively reports the channel as live, so Twitch's white "is offline"
   * card never flashes through — and if the script is blocked or fails, the
   * panel simply stays, which is the right fallback rather than a blank box.
   */
  const [live, setLive] = useState(false);

  useEffect(() => {
    /* Wait for the client render: the server has no hostname to hand Twitch. */
    if (!hostname) {
      return;
    }
    let cancelled = false;
    loadTwitch()
      .then(() => {
        if (cancelled || !window.Twitch) {
          return;
        }
        const player = new window.Twitch.Player(PLAYER_ID, {
          channel,
          parent: [hostname],
          autoplay: false,
          muted: false,
          width: "100%",
          height: "100%",
        });
        player.addEventListener(window.Twitch.Player.ONLINE, () =>
          setLive(true),
        );
        player.addEventListener(window.Twitch.Player.OFFLINE, () =>
          setLive(false),
        );
      })
      .catch(() => {
        /* Panel stays up; it still links out to the channel. */
      });
    return () => {
      cancelled = true;
    };
  }, [channel, hostname]);

  return (
    /*
     * Only the video needs to hold 16:9. On a phone that ratio is barely
     * 160px tall — not enough for the offline panel's copy and buttons — so
     * while offline the box is free to grow and only takes the aspect back
     * from sm up, where 16:9 is roomy enough on its own.
     */
    <div
      className={`relative overflow-hidden rounded-xl bg-black ${
        live ? "aspect-video" : "min-h-[19rem] sm:aspect-video sm:min-h-0"
      }`}
    >
      <div
        id={PLAYER_ID}
        ref={mountRef}
        className="absolute inset-0 h-full w-full [&>iframe]:h-full [&>iframe]:w-full [&>iframe]:border-0"
      />
      {live ? null : <OfflinePanel channel={channel} />}
    </div>
  );
}
