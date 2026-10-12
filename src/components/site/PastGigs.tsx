import { dateParts } from "@/lib/gigs";
import type { Gig } from "@/lib/types";

const mono = "font-(family-name:--font-space-mono)";

/** The archive: every gig that's been, grouped by year, newest first. */
export default function PastGigs({ gigs, limit }: { gigs: Gig[]; limit?: number }) {
  const shown = limit ? gigs.slice(0, limit) : gigs;
  if (!shown.length) {
    return null;
  }
  const years = new Map<string, Gig[]>();
  for (const gig of shown) {
    const year = gig.date.slice(0, 4);
    years.set(year, [...(years.get(year) ?? []), gig]);
  }
  return (
    <div className="space-y-8">
      {[...years.entries()].map(([year, list]) => (
        <div key={year}>
          <p className={`${mono} text-xs tracking-[0.3em] text-br-amber`}>{year}</p>
          <ul className="mt-3 grid gap-x-10 md:grid-cols-2">
            {list.map((gig) => {
              const d = dateParts(gig.date);
              return (
                <li key={gig.id} className="grid grid-cols-[4.5rem_1fr] gap-3 border-b border-white/10 py-3">
                  <time dateTime={gig.date} className={`${mono} pt-0.5 text-[11px] tracking-[0.15em] text-br-chrome`}>
                    {d.day} {d.month.toUpperCase()}
                  </time>
                  <p className="font-(family-name:--font-inter) text-sm leading-snug text-br-platinum/90">
                    <span className="font-semibold">{gig.name}</span>
                    <span className="block text-br-chrome">
                      {gig.status === "tba" || !gig.venue ? gig.town : `${gig.venue}, ${gig.town}`}
                    </span>
                  </p>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}
