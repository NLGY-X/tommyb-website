import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getGig } from "@/lib/db";
import ConfirmButton from "@/components/admin/ConfirmButton";
import GigForm from "@/components/admin/GigForm";
import { AdminTop, buttonSecondary } from "@/components/admin/ui";
import { db } from "@/server/db";
import { requireAdmin } from "@/server/session";
import { deleteGig } from "../../actions";

export const metadata: Metadata = { title: "Edit gig" };

export default async function EditGigPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const gig = getGig(db(), Number(id));
  if (!gig) {
    notFound();
  }
  return (
    <>
      <AdminTop title="Edit gig" back="/admin/gigs" backLabel="Gigs" />
      <main className="mx-auto max-w-2xl px-4 pt-6">
        <GigForm gig={gig} mode="edit" />
        <div className="mt-10 grid grid-cols-2 gap-3 border-t border-white/10 pt-6">
          <Link href={`/admin/gigs/new?from=${gig.id}`} className={buttonSecondary}>
            Duplicate
          </Link>
          <ConfirmButton action={deleteGig} fields={{ id: gig.id }} confirm={`Delete ${gig.name}? This can't be undone.`}>
            Delete gig
          </ConfirmButton>
        </div>
      </main>
    </>
  );
}
