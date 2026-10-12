import type { Metadata } from "next";
import { getGig } from "@/lib/db";
import GigForm from "@/components/admin/GigForm";
import { AdminTop } from "@/components/admin/ui";
import { db } from "@/server/db";
import { requireAdmin } from "@/server/session";

export const metadata: Metadata = { title: "Add a gig" };

export default async function NewGigPage({ searchParams }: { searchParams: Promise<{ from?: string }> }) {
  await requireAdmin();
  const { from } = await searchParams;
  const source = from ? getGig(db(), Number(from)) : null;
  /* A duplicate copies everything except the date, which is the bit that changes. */
  const gig = source ? { ...source, id: undefined, date: "" } : undefined;

  return (
    <>
      <AdminTop title={source ? "Duplicate a gig" : "Add a gig"} back="/admin/gigs" backLabel="Gigs" />
      <main className="mx-auto max-w-2xl px-4 pt-6">
        {source ? (
          <p className="mb-6 text-base text-br-chrome">
            Copied from {source.name}. Pick the new date and save.
          </p>
        ) : null}
        <GigForm gig={gig} mode={source ? "duplicate" : "add"} />
      </main>
    </>
  );
}
