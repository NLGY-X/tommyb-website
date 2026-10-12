import Link from "next/link";

const HERO_ALT = "Tommy B: a tower of stacked speaker cabinets lit by stage light";

/*
 * The artwork already carries the TOMMY B lettering, so it is the hero.
 * One image for every screen: on a phone it sits at its natural shape so
 * the lettering is never cropped; from md up it fills the screen with a
 * slow zoom and letterbox bars. One <img> means one download.
 *
 * The WebP sizes are made ahead of time (public/hero-*.webp, 43KB to 189KB
 * against the 2.3MB PNG) rather than by the image optimiser, so the most
 * important picture on the site never waits on a resize job.
 */
export default function HeroSection({ tagline }: { tagline: string }) {
  return (
    <section className="relative flex flex-col items-center justify-center overflow-hidden bg-black pt-20 md:min-h-[100svh] md:justify-end md:pt-0">
      {/* mobile glow behind the artwork */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-16 h-[60vw] blur-2xl md:hidden"
        style={{
          background:
            "radial-gradient(ellipse 55% 50% at 25% 45%, rgba(232,72,63,0.28), transparent), radial-gradient(ellipse 55% 50% at 75% 45%, rgba(236,72,153,0.22), transparent), radial-gradient(ellipse 45% 40% at 50% 65%, rgba(43,197,200,0.2), transparent)",
        }}
      />
      <div className="hero-kenburns relative w-full md:absolute md:inset-0">
        {/* eslint-disable-next-line @next/next/no-img-element -- pre-sized static files, see above */}
        <img
          src="/hero-1024.webp"
          srcSet="/hero-640.webp 640w, /hero-1024.webp 1024w, /hero-1667.webp 1667w"
          sizes="100vw"
          alt={HERO_ALT}
          width={1667}
          height={943}
          fetchPriority="high"
          decoding="async"
          className="relative h-auto w-full md:h-full md:object-cover"
        />
      </div>

      {/* legibility and blend gradients, full bleed only */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 z-10 hidden h-40 bg-gradient-to-b from-black/80 to-transparent md:block" />
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 z-10 hidden h-72 bg-gradient-to-t from-br-space via-br-space/70 to-transparent md:block" />

      {/* cinematic letterbox bars, full bleed only */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 z-20 hidden h-14 bg-black md:block" />
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 z-20 hidden h-14 bg-black md:block" />

      <div className="relative z-30 px-6 pb-12 pt-6 text-center md:pb-24 md:pt-0">
        <h1 className="sr-only">Tommy B, hard trance DJ and producer</h1>
        <div className="flex items-center justify-center gap-4">
          <span aria-hidden className="beam-line hidden w-16 sm:block" />
          <p className="font-(family-name:--font-space-mono) text-[11px] tracking-[0.35em] text-br-platinum drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
            HARD TRANCE {"//"} DJ {"//"} PRODUCER
          </p>
          <span aria-hidden className="beam-line hidden w-16 sm:block" />
        </div>
        {tagline ? (
          <p className="mt-4 font-(family-name:--font-display) text-sm font-bold uppercase tracking-[0.25em] text-br-platinum drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] md:text-base">
            {tagline}
          </p>
        ) : null}
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
