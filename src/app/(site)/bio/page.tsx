import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { pressPhotos, siteSettings } from "@/server/data";

export const metadata: Metadata = {
  title: "The artist",
  description: "Tommy B: Oxford-based hard trance DJ and producer, part of the Project Storm Recordings family.",
  openGraph: { title: "Tommy B | The artist", url: "/bio" },
};

const FACTS = [
  { label: "BASED", value: "Oxford, UK" },
  { label: "ACTIVE", value: "Early 2000s on" },
  { label: "LABEL", value: "Project Storm" },
  { label: "SIGNATURE", value: "Wired To Respond" },
];

const mono = "font-(family-name:--font-space-mono)";

export default function ArtistPage() {
  const settings = siteSettings();
  const portrait = pressPhotos()[0];

  return (
    <main className="relative px-6 pb-24 pt-32">
      <div className="section-fade mx-auto max-w-6xl">
        <p className={`${mono} text-xs tracking-[0.3em] text-br-chrome/70`}>BIO / THE ARTIST</p>
        <h1 className="distressed mt-6 max-w-5xl font-(family-name:--font-display) text-[clamp(2.4rem,7vw,5.5rem)] uppercase leading-[1.05] tracking-tight text-br-platinum">
          Engineered for the Main&nbsp;Stage
        </h1>
        <hr className="beam-line mt-10" />

        <div className="mt-14 grid gap-12 lg:grid-cols-[1fr_320px]">
          <div>
            {settings.tagline ? (
              <p className="font-(family-name:--font-display) text-xl uppercase leading-snug text-br-platinum md:text-2xl">
                {settings.tagline}
              </p>
            ) : null}
            <div className="mt-10 space-y-6 border-l border-white/10 pl-6">
              {settings.bio.map((paragraph, i) => (
                <p key={i} className="max-w-2xl font-(family-name:--font-inter) text-sm leading-relaxed text-br-platinum/85 md:text-base">
                  {paragraph}
                </p>
              ))}
            </div>
            <Link
              href="/booking"
              className={`light-sweep mt-12 inline-block bg-br-platinum px-8 py-3.5 ${mono} text-sm font-bold tracking-[0.1em] text-br-space transition-colors hover:bg-br-red hover:text-br-platinum`}
            >
              BOOKING AND PRESS KIT
            </Link>
          </div>

          <aside>
            {portrait ? (
              <Image
                src={`/uploads/${portrait.file}`}
                alt={portrait.caption ? `Tommy B. ${portrait.caption}` : "Tommy B"}
                width={portrait.width ?? 800}
                height={portrait.height ?? 1000}
                sizes="(min-width: 1024px) 320px, 100vw"
                className="mb-8 aspect-[4/5] w-full object-cover"
              />
            ) : null}
            <p className={`${mono} text-[10px] tracking-[0.3em] text-br-chrome/70`}>PROFILE</p>
            <dl className="mt-4">
              {FACTS.map((fact) => (
                <div key={fact.label} className="flex items-baseline justify-between gap-4 border-b border-white/10 py-4">
                  <dt className={`${mono} text-[10px] tracking-[0.25em] text-br-chrome`}>{fact.label}</dt>
                  <dd className="text-right font-(family-name:--font-display) text-sm text-br-platinum">{fact.value}</dd>
                </div>
              ))}
            </dl>
          </aside>
        </div>
      </div>
    </main>
  );
}
