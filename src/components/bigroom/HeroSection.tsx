import Image from "next/image";
import Link from "next/link";
import { TAGLINE_BIGROOM } from "@/data/content";

const HERO_ALT =
  "Tommy B: a tower of stacked speaker cabinets lit by stage light";

/*
 * The artwork already carries the TOMMY B lettering, so it is the hero.
 * Desktop: full bleed with a slow cinematic zoom and letterbox bars.
 * Mobile: the full artwork at natural aspect over an ambient glow, so the
 * lettering is never cropped.
 */
export default function HeroSection() {
  return (
    <section className="relative flex min-h-[85vh] flex-col items-center justify-center overflow-hidden bg-black pt-24 md:min-h-screen md:justify-end md:pt-0">
      {/* desktop: full bleed cover with slow zoom */}
      <div className="hero-kenburns absolute inset-0 hidden md:block">
        <Image
          src="/tommy-b-stack.png"
          alt={HERO_ALT}
          fill
          priority
          sizes="(min-width: 768px) 100vw, 1px"
          quality={80}
          className="object-cover"
        />
      </div>

      {/* mobile: full artwork, ambient glow behind */}
      <div className="relative w-full md:hidden">
        <div
          aria-hidden
          className="absolute -inset-x-8 -inset-y-12 blur-2xl"
          style={{
            background:
              "radial-gradient(ellipse 55% 50% at 25% 45%, rgba(232,72,63,0.28), transparent), radial-gradient(ellipse 55% 50% at 75% 45%, rgba(236,72,153,0.28), transparent), radial-gradient(ellipse 45% 40% at 50% 65%, rgba(43,197,200,0.2), transparent)",
          }}
        />
        <Image
          src="/tommy-b-stack.png"
          alt={HERO_ALT}
          width={1667}
          height={943}
          priority
          sizes="(min-width: 768px) 1px, 100vw"
          quality={80}
          className="relative h-auto w-full"
        />
      </div>

      {/* legibility and blend gradients, full bleed only */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 z-10 hidden h-40 bg-gradient-to-b from-black/80 to-transparent md:block"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 z-10 hidden h-72 bg-gradient-to-t from-br-space via-br-space/70 to-transparent md:block"
      />

      {/* cinematic letterbox bars, full bleed only */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 z-20 hidden h-14 bg-black md:block"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 z-20 hidden h-14 bg-black md:block"
      />

      <div className="relative z-30 px-6 pb-16 pt-8 text-center md:pb-24 md:pt-0">
        <h1 className="sr-only">Tommy B</h1>
        <div className="flex items-center justify-center gap-4">
          <span aria-hidden className="beam-line hidden w-16 sm:block" />
          <p className="font-(family-name:--font-space-mono) text-[11px] tracking-[0.35em] text-br-platinum drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
            HARD TRANCE {"//"} PRODUCER {"//"} HEADLINER
          </p>
          <span aria-hidden className="beam-line hidden w-16 sm:block" />
        </div>
        <p className="mt-4 font-(family-name:--font-display) text-sm font-bold uppercase tracking-[0.25em] text-br-platinum drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] md:text-base">
          {TAGLINE_BIGROOM}
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link
            href="/music"
            className="light-sweep bg-br-platinum px-8 py-3.5 font-(family-name:--font-space-mono) text-sm font-bold tracking-[0.1em] text-br-space shadow-[0_4px_20px_rgba(0,0,0,0.5)] transition-colors hover:bg-br-red hover:text-br-platinum"
          >
            LISTEN NOW
          </Link>
          <Link
            href="/booking"
            className="light-sweep border border-br-platinum/40 bg-black/40 px-8 py-3.5 font-(family-name:--font-space-mono) text-sm font-bold tracking-[0.1em] text-br-platinum backdrop-blur-sm transition-colors hover:border-br-platinum"
          >
            BOOK TOMMY B
          </Link>
        </div>
      </div>
    </section>
  );
}
