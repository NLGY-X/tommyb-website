import Link from "next/link";
import type { ReactNode } from "react";

/*
 * The admin is the site's palette turned down: same near-black, bone and
 * teal, no grain or distressed type, and every control big enough for a
 * thumb. Inputs are 17px so iOS doesn't zoom when one is tapped.
 */

export const inputClass =
  "block w-full min-h-14 rounded-xl border border-white/20 bg-white/[0.04] px-4 py-3 text-[17px] text-br-platinum placeholder:text-br-chrome/50 focus:border-br-teal focus:outline-none focus:ring-2 focus:ring-br-teal/40";

export const buttonPrimary =
  "flex min-h-14 w-full items-center justify-center rounded-xl bg-br-platinum px-6 text-[17px] font-semibold text-br-space transition-colors hover:bg-white active:bg-br-chrome disabled:opacity-60";

export const buttonSecondary =
  "flex min-h-12 items-center justify-center rounded-xl border border-white/25 px-5 text-base font-medium text-br-platinum transition-colors hover:border-white/50 active:bg-white/5";

export const buttonDanger =
  "flex min-h-12 items-center justify-center rounded-xl border border-br-red/60 px-5 text-base font-medium text-[#f08a7f] transition-colors hover:bg-br-red/10";

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: ReactNode;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-[15px] font-semibold text-br-platinum">{label}</span>
      {hint ? <span className="-mt-1 mb-2 block text-sm leading-snug text-br-chrome">{hint}</span> : null}
      {children}
    </label>
  );
}

export function AdminTop({ title, back = "/admin", backLabel = "Admin home" }: { title: string; back?: string | null; backLabel?: string }) {
  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-br-space/95 pt-[env(safe-area-inset-top)] backdrop-blur">
      <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-3">
        {back ? (
          <Link href={back} className="-ml-2 flex min-h-11 items-center rounded-lg px-2 text-base text-br-chrome hover:text-br-platinum">
            <span aria-hidden className="mr-1 text-lg">‹</span>
            {backLabel}
          </Link>
        ) : (
          <span className="font-(family-name:--font-display) text-sm tracking-[0.2em] text-br-platinum">TOMMY B</span>
        )}
      </div>
      <h1 className="mx-auto max-w-2xl px-4 pb-4 text-2xl font-bold text-br-platinum">{title}</h1>
    </header>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`rounded-2xl border border-white/10 bg-white/[0.03] p-5 ${className}`}>{children}</section>;
}

export function Notice({ children }: { children: ReactNode }) {
  return (
    <p role="status" className="rounded-xl border border-br-teal/60 bg-br-teal/10 px-4 py-3 text-base text-br-platinum">
      {children}
    </p>
  );
}
