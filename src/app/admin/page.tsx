import Link from "next/link";
import { countNew } from "@/lib/db";
import { formatGigDate, placeLine } from "@/lib/gigs";
import { AdminTop, buttonPrimary, buttonSecondary } from "@/components/admin/ui";
import { gigsNow } from "@/server/data";
import { db } from "@/server/db";
import { requireAdmin } from "@/server/session";
import { signOut } from "./actions";

export const dynamic = "force-dynamic";

function Tile({ href, title, detail, badge }: { href: string; title: string; detail: string; badge?: number }) {
  return (
    <Link
      href={href}
      className="flex min-h-20 items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4 transition-colors hover:border-white/25 active:bg-white/[0.06]"
    >
      <span>
        <span className="block text-lg font-semibold text-br-platinum">{title}</span>
        <span className="mt-0.5 block text-sm text-br-chrome">{detail}</span>
      </span>
      <span className="flex items-center gap-3">
        {badge ? (
          <span className="rounded-full bg-br-amber px-2.5 py-1 text-sm font-bold text-br-space">{badge} new</span>
        ) : null}
        <span aria-hidden className="text-2xl text-br-chrome">›</span>
      </span>
    </Link>
  );
}

export default async function AdminHome() {
  await requireAdmin();
  const { upcoming } = gigsNow();
  const fresh = countNew(db());
  const next = upcoming[0];
  const newTotal = fresh.enquiries + fresh.subscribers;

  return (
    <>
      <AdminTop title="Your site" back="/" backLabel="View the site" />
      <main className="mx-auto max-w-2xl space-y-4 px-4 pt-6">
        <Link href="/admin/gigs/new" className={buttonPrimary}>
          Add a gig
        </Link>

        <div className="space-y-3 pt-2">
          <Tile
            href="/admin/gigs"
            title="Gigs"
            detail={
              next
                ? `Next: ${formatGigDate(next.date, false)}, ${next.name} (${placeLine(next)}). ${upcoming.length} coming up.`
                : "Nothing coming up yet"
            }
          />
          <Tile
            href="/admin/messages"
            title="Messages"
            detail={
              newTotal
                ? [
                    fresh.enquiries ? `${fresh.enquiries} booking ${fresh.enquiries === 1 ? "enquiry" : "enquiries"}` : "",
                    fresh.subscribers ? `${fresh.subscribers} mailing list sign-up${fresh.subscribers === 1 ? "" : "s"}` : "",
                  ]
                    .filter(Boolean)
                    .join(", ")
                : "Booking enquiries and mailing list"
            }
            badge={newTotal}
          />
          <Tile href="/admin/music" title="Music" detail="Featured track and mixes" />
          <Tile href="/admin/about" title="About" detail="Bio and tagline" />
          <Tile href="/admin/links" title="Links" detail="Instagram, Twitch, Spotify and the rest, plus booking email" />
          <Tile href="/admin/press" title="Press kit" detail="Press photos, short bio and tech rider" />
        </div>

        <form action={signOut} className="pt-6">
          <button type="submit" className={`${buttonSecondary} w-full`}>
            Sign out
          </button>
        </form>
      </main>
    </>
  );
}
