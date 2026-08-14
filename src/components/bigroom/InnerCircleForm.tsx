"use client";

import { useState } from "react";

export default function InnerCircleForm() {
  const [joined, setJoined] = useState(false);

  return (
    <section id="circle" className="relative px-6 py-24">
      <div className="mx-auto max-w-3xl text-center">
        <p className="font-(family-name:--font-space-mono) text-xs tracking-[0.3em] text-br-chrome/70">
          PVT/LIST — INNER CIRCLE
        </p>
        <h2 className="distressed mt-8 font-(family-name:--font-display) text-3xl uppercase text-br-platinum md:text-4xl">
          Join the Inner Circle
        </h2>
        <hr className="beam-line mx-auto mt-8 max-w-md" />
        <p className="mx-auto mt-8 max-w-xl font-(family-name:--font-inter) text-sm leading-relaxed text-br-chrome">
          First access to tickets, undisclosed locations and unreleased music.
          One email when it matters, silence when it does not.
        </p>
        {joined ? (
          <p className="mt-10 inline-block border border-br-teal/50 px-8 py-4 font-(family-name:--font-space-mono) text-sm tracking-[0.1em] text-br-teal">
            WELCOME INSIDE. WATCH YOUR INBOX.
          </p>
        ) : (
          <form
            className="mx-auto mt-10 flex max-w-md flex-col gap-3 sm:flex-row"
            onSubmit={(event) => {
              event.preventDefault();
              setJoined(true);
            }}
          >
            <input
              type="email"
              required
              placeholder="your@email.com"
              aria-label="Email address"
              autoComplete="email"
              inputMode="email"
              /* 16px on mobile: anything smaller makes iOS Safari zoom on focus. */
              className="min-h-11 flex-1 border border-br-chrome/30 bg-br-space/70 px-5 py-3 font-(family-name:--font-space-mono) text-base text-br-platinum placeholder:text-br-chrome/50 focus:border-br-teal focus:outline-none sm:text-sm"
            />
            <button
              type="submit"
              className="light-sweep min-h-11 bg-br-platinum px-7 py-3 font-(family-name:--font-space-mono) text-sm font-bold tracking-[0.1em] text-br-space transition-colors hover:bg-br-red hover:text-br-platinum"
            >
              REQUEST ACCESS
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
