"use client";

import Link from "next/link";
import { buttonPrimary, buttonSecondary } from "@/components/admin/ui";

/*
 * Shown when an admin page or a one-tap action (delete, move a mix) fails,
 * usually because the phone lost signal. Says so plainly and offers a retry.
 */
export default function AdminError({ unstable_retry }: { error: Error; unstable_retry: () => void }) {
  return (
    <main className="mx-auto max-w-2xl space-y-4 px-4 pt-[calc(2.5rem+env(safe-area-inset-top))]">
      <h1 className="text-2xl font-bold text-br-platinum">That didn&apos;t go through</h1>
      <p className="text-base text-br-chrome">
        Usually that means the phone lost its connection for a moment. Check your signal and try again.
        If you were deleting or moving something, look at the list first: it may already be done.
      </p>
      <button type="button" onClick={() => unstable_retry()} className={buttonPrimary}>
        Try again
      </button>
      <Link href="/admin" className={`${buttonSecondary} w-full`}>
        Admin home
      </Link>
    </main>
  );
}
