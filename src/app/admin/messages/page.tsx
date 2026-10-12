import type { Metadata } from "next";
import Link from "next/link";
import { listEnquiries, listSubscribers, markAllSeen } from "@/lib/db";
import ConfirmButton from "@/components/admin/ConfirmButton";
import { AdminTop, buttonSecondary } from "@/components/admin/ui";
import { db } from "@/server/db";
import { requireAdmin } from "@/server/session";
import { deleteEnquiry, deleteSubscriber } from "../actions";

export const metadata: Metadata = { title: "Messages" };
export const dynamic = "force-dynamic";

function when(iso: string): string {
  const d = new Date(iso.endsWith("Z") ? iso : `${iso}Z`);
  return d.toLocaleString("en-GB", {
    timeZone: "Europe/London",
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function NewBadge() {
  return <span className="rounded-full bg-br-amber px-2 py-0.5 text-xs font-bold text-br-space">New</span>;
}

export default async function MessagesPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  await requireAdmin();
  const { tab } = await searchParams;
  const showMailing = tab === "mailing";
  const database = db();
  const enquiries = listEnquiries(database);
  const subscribers = listSubscribers(database);
  const newEnquiries = enquiries.filter((e) => !e.seen).length;
  const newSubscribers = subscribers.filter((s) => !s.seen).length;

  /* Opening a tab counts as reading it. The "New" badges still show this once. */
  markAllSeen(database, showMailing ? "subscribers" : "enquiries");

  const tabClass = (active: boolean) =>
    `flex min-h-12 flex-1 items-center justify-center gap-2 rounded-lg text-base ${
      active ? "bg-br-platinum font-semibold text-br-space" : "text-br-chrome"
    }`;

  return (
    <>
      <AdminTop title="Messages" />
      <main className="mx-auto max-w-2xl space-y-5 px-4 pt-6">
        <nav className="flex gap-1 rounded-xl border border-white/10 p-1" aria-label="Message type">
          <Link href="/admin/messages" className={tabClass(!showMailing)} aria-current={!showMailing ? "page" : undefined}>
            Bookings {newEnquiries > 0 && showMailing ? <NewBadge /> : null}
          </Link>
          <Link href="/admin/messages?tab=mailing" className={tabClass(showMailing)} aria-current={showMailing ? "page" : undefined}>
            Mailing list {newSubscribers > 0 && !showMailing ? <NewBadge /> : null}
          </Link>
        </nav>

        {showMailing ? (
          <>
            <div className="flex items-center justify-between gap-3">
              <p className="text-base text-br-chrome">
                {subscribers.length} {subscribers.length === 1 ? "person" : "people"} signed up for gig news.
              </p>
              {subscribers.length ? (
                <a href="/admin/messages/export?list=mailing" className={buttonSecondary} download>
                  Export CSV
                </a>
              ) : null}
            </div>
            <ul className="divide-y divide-white/10 rounded-2xl border border-white/10">
              {subscribers.map((s) => (
                <li key={s.id} className="flex items-center gap-3 p-4">
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-2 truncate text-base font-semibold">
                      {s.email} {!s.seen ? <NewBadge /> : null}
                    </p>
                    <p className="text-sm text-br-chrome">
                      {s.town ? `${s.town} · ` : ""}
                      {when(s.createdAt)}
                    </p>
                  </div>
                  <ConfirmButton action={deleteSubscriber} fields={{ id: s.id }} confirm={`Take ${s.email} off the list?`} label={`Remove ${s.email}`}>
                    Remove
                  </ConfirmButton>
                </li>
              ))}
            </ul>
            <p className="text-sm text-br-chrome">
              The site doesn&apos;t send emails to this list. Export it and send from your own email when there&apos;s news.
              If someone asks to come off the list, remove them here.
            </p>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between gap-3">
              <p className="text-base text-br-chrome">Booking enquiries from the booking page, newest first.</p>
              {enquiries.length ? (
                <a href="/admin/messages/export?list=enquiries" className={buttonSecondary} download>
                  Export CSV
                </a>
              ) : null}
            </div>
            {enquiries.length ? (
              <ul className="space-y-3">
                {enquiries.map((e) => (
                  <li key={e.id} className={`rounded-2xl border p-4 ${e.seen ? "border-white/10" : "border-br-amber/60"}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="flex items-center gap-2 text-lg font-semibold">
                          {e.name} {!e.seen ? <NewBadge /> : null}
                        </p>
                        <p className="text-sm text-br-chrome">{when(e.createdAt)}</p>
                      </div>
                    </div>
                    <dl className="mt-3 space-y-1 text-base">
                      {e.event ? (
                        <div>
                          <dt className="inline text-br-chrome">Event: </dt>
                          <dd className="inline">{e.event}</dd>
                        </div>
                      ) : null}
                      {e.eventDate ? (
                        <div>
                          <dt className="inline text-br-chrome">Date: </dt>
                          <dd className="inline">
                            {new Date(`${e.eventDate}T12:00:00Z`).toLocaleDateString("en-GB", {
                              weekday: "short",
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                              timeZone: "UTC",
                            })}
                          </dd>
                        </div>
                      ) : null}
                      {e.place ? (
                        <div>
                          <dt className="inline text-br-chrome">Where: </dt>
                          <dd className="inline">{e.place}</dd>
                        </div>
                      ) : null}
                    </dl>
                    {e.message ? <p className="mt-3 whitespace-pre-line text-base leading-relaxed">{e.message}</p> : null}
                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <a
                        href={`mailto:${e.email}?subject=${encodeURIComponent(`Re: ${e.event || "Booking Tommy B"}`)}`}
                        className={buttonSecondary}
                      >
                        Reply
                      </a>
                      <ConfirmButton action={deleteEnquiry} fields={{ id: e.id }} confirm={`Delete the enquiry from ${e.name}?`}>
                        Delete
                      </ConfirmButton>
                    </div>
                    <p className="mt-2 break-all text-sm text-br-chrome">{e.email}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-base text-br-chrome">No enquiries yet.</p>
            )}
          </>
        )}
      </main>
    </>
  );
}
