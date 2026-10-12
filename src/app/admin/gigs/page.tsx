import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { formatGigDate, placeLine, STATUS_LABELS } from "@/lib/gigs";
import type { Gig } from "@/lib/types";
import { AdminTop, buttonPrimary, Notice } from "@/components/admin/ui";
import { gigsNow } from "@/server/data";
import { requireAdmin } from "@/server/session";

export const metadata: Metadata = { title: "Gigs" };
export const dynamic = "force-dynamic";

function GigRow({ gig, highlight }: { gig: Gig; highlight?: boolean }) {
  return (
    <li
      className={`rounded-2xl border bg-white/[0.03] ${highlight ? "border-br-teal/70" : "border-white/10"}`}
    >
      <Link href={`/admin/gigs/${gig.id}`} className="flex items-center gap-4 p-4 active:bg-white/[0.05]">
        {gig.poster ? (
          <Image
            src={`/uploads/${gig.poster}`}
            alt=""
            width={48}
            height={64}
            className="h-16 w-12 shrink-0 rounded object-cover"
          />
        ) : (
          <span aria-hidden className="flex h-16 w-12 shrink-0 flex-col items-center justify-center rounded border border-white/10 text-br-chrome">
            <span className="text-lg font-bold leading-none text-br-platinum">{formatGigDate(gig.date).split(" ")[1]}</span>
            <span className="text-xs">{formatGigDate(gig.date).split(" ")[2]}</span>
          </span>
        )}
        <span className="min-w-0 flex-1">
          <span className="block text-sm text-br-chrome">
            {formatGigDate(gig.date)}
            {gig.startTime ? `, ${gig.startTime}` : ""}
          </span>
          <span className="block truncate text-lg font-semibold text-br-platinum">{gig.name}</span>
          <span className="block truncate text-sm text-br-chrome">
            {placeLine(gig)} · {STATUS_LABELS[gig.status]}
            {gig.ticketUrl ? " · ticket link" : ""}
          </span>
        </span>
        <span aria-hidden className="text-2xl text-br-chrome">›</span>
      </Link>
      <div className="flex border-t border-white/10 text-base">
        <Link href={`/admin/gigs/${gig.id}`} className="flex min-h-12 flex-1 items-center justify-center text-br-platinum">
          Edit
        </Link>
        <Link
          href={`/admin/gigs/new?from=${gig.id}`}
          className="flex min-h-12 flex-1 items-center justify-center border-l border-white/10 text-br-platinum"
        >
          Duplicate
        </Link>
      </div>
    </li>
  );
}

export default async function GigsAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; deleted?: string }>;
}) {
  await requireAdmin();
  const { saved, deleted } = await searchParams;
  const { upcoming, past } = gigsNow();
  const savedId = Number(saved);
  const savedIsPast = past.some((g) => g.id === savedId);

  return (
    <>
      <AdminTop title="Gigs" />
      <main className="mx-auto max-w-2xl space-y-6 px-4 pt-6">
        {saved ? (
          <Notice>
            Saved. It&apos;s on the site now.{" "}
            {savedIsPast ? "That date has passed, so it's under Past gigs." : null}{" "}
            <Link href="/events" className="underline underline-offset-4">
              See the dates page
            </Link>
          </Notice>
        ) : null}
        {deleted ? <Notice>Deleted.</Notice> : null}

        <Link href="/admin/gigs/new" className={buttonPrimary}>
          Add a gig
        </Link>

        <section>
          <h2 className="mb-3 text-lg font-semibold">Coming up ({upcoming.length})</h2>
          {upcoming.length ? (
            <ul className="space-y-3">
              {upcoming.map((gig) => (
                <GigRow key={gig.id} gig={gig} highlight={gig.id === savedId} />
              ))}
            </ul>
          ) : (
            <p className="text-base text-br-chrome">No gigs coming up. Add one and it shows on the site straight away.</p>
          )}
        </section>

        <details className="group rounded-2xl border border-white/10" open={savedIsPast}>
          <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between px-4 text-lg font-semibold">
            Past gigs ({past.length})
            <span aria-hidden className="text-br-chrome transition-transform group-open:rotate-90">›</span>
          </summary>
          <div className="px-3 pb-3">
            <p className="mb-3 px-1 text-sm text-br-chrome">
              Gigs move here on their own the morning after. They stay on the site as your track record.
            </p>
            <ul className="space-y-3">
              {past.map((gig) => (
                <GigRow key={gig.id} gig={gig} highlight={gig.id === savedId} />
              ))}
            </ul>
          </div>
        </details>
      </main>
    </>
  );
}
