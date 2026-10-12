import { CREDITS } from "@/data/content";

/** Track-record numbers from the bio, set big like a festival poster's line-up. */
export default function Credits() {
  return (
    <dl className="grid grid-cols-2 gap-x-6 gap-y-8 md:grid-cols-4">
      {CREDITS.map((c) => (
        <div key={c.label} className="border-t border-white/10 pt-5">
          <dt className="sr-only">{c.label}</dt>
          <dd>
            <span className="block font-(family-name:--font-display) text-[clamp(1.6rem,4vw,2.6rem)] leading-none text-br-red">
              {c.value}
            </span>
            <span className="mt-3 block font-(family-name:--font-inter) text-sm leading-snug text-br-chrome">
              {c.label}
            </span>
          </dd>
        </div>
      ))}
    </dl>
  );
}
