import type { Metadata } from "next";
import { BIO_PARAGRAPHS } from "@/data/content";

export const metadata: Metadata = {
  title: "The Artist",
  description:
    "Tommy B. Hard trance DJ and producer, engineered for the main stage.",
};

const RIDER_FACTS = [
  { label: "BASED", value: "Oxford, UK" },
  { label: "ACTIVE", value: "Early 2000s —" },
  { label: "LABELS", value: "Project Storm +4" },
  { label: "SIGNATURE", value: "Wired To Respond" },
];

export default function ArtistPage() {
  return (
    <main className="relative px-6 pb-24 pt-32">
      <div className="section-fade mx-auto max-w-6xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <p className="font-(family-name:--font-space-mono) text-xs tracking-[0.3em] text-br-chrome/70">
            BIO/26 — THE ARTIST
          </p>
          <p className="font-(family-name:--font-space-mono) text-xs tracking-[0.3em] text-br-chrome/70">
            EST. WAREHOUSE
          </p>
        </div>
        <h1 className="distressed mt-6 max-w-5xl font-(family-name:--font-display) text-[clamp(2.4rem,7vw,5.5rem)] uppercase leading-[1.05] tracking-tight text-br-platinum">
          Engineered for the Main&nbsp;Stage
        </h1>
        <hr className="beam-line mt-10" />

        <div className="mt-14 grid gap-12 lg:grid-cols-[1fr_320px]">
          <div>
            <blockquote className="font-(family-name:--font-display) text-xl uppercase leading-snug text-br-platinum md:text-2xl">
              <span aria-hidden className="text-br-red">&ldquo;</span>Wired To
              Respond. 270,000 plays and still the closer.<span aria-hidden className="text-br-red">&rdquo;</span>
            </blockquote>
            <div className="mt-10 space-y-6 border-l border-white/10 pl-6">
              {BIO_PARAGRAPHS.map((paragraph, i) => (
                <p
                  key={i}
                  className="max-w-2xl font-(family-name:--font-inter) text-sm leading-relaxed text-br-platinum/85 md:text-base"
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </div>

          <aside>
            <p className="font-(family-name:--font-space-mono) text-[10px] tracking-[0.3em] text-br-chrome/70">
              TECHNICAL PROFILE
            </p>
            <dl className="mt-4">
              {RIDER_FACTS.map((fact) => (
                <div
                  key={fact.label}
                  className="flex items-baseline justify-between gap-4 border-b border-white/10 py-4"
                >
                  <dt className="font-(family-name:--font-space-mono) text-[10px] tracking-[0.25em] text-br-chrome">
                    {fact.label}
                  </dt>
                  <dd className="text-right font-(family-name:--font-display) text-sm text-br-platinum">
                    {fact.value}
                  </dd>
                </div>
              ))}
            </dl>
          </aside>
        </div>
      </div>
    </main>
  );
}
