"use client";

import { startTransition, useActionState } from "react";
import { joinMailingList } from "@/app/actions";
import { initialFormState } from "@/lib/form";

const mono = "font-(family-name:--font-space-mono)";
const input =
  "min-h-12 w-full border border-br-chrome/30 bg-br-space/70 px-4 py-3 font-(family-name:--font-inter) text-base text-br-platinum placeholder:text-br-chrome/50 focus:border-br-teal focus:outline-none";

export default function MailingList({ id = "mailing-list" }: { id?: string }) {
  const [state, formAction, pending] = useActionState(joinMailingList, initialFormState);
  const done = Boolean(state.ok);

  return (
    <section id={id} aria-labelledby={`${id}-title`} className="relative px-6 py-20">
      <div className="mx-auto max-w-3xl text-center">
        <p className={`${mono} text-xs tracking-[0.3em] text-br-chrome/70`}>MAIL/LIST</p>
        <h2
          id={`${id}-title`}
          className="distressed mt-6 font-(family-name:--font-display) text-3xl uppercase text-br-platinum md:text-4xl"
        >
          Hear about new dates first
        </h2>
        <hr className="beam-line mx-auto mt-8 max-w-md" />
        <p className="mx-auto mt-8 max-w-xl font-(family-name:--font-inter) text-sm leading-relaxed text-br-chrome">
          Leave your email and Tommy will let you know when new gigs go up. Add your town and
          you&apos;ll hear when he&apos;s playing near you. Nothing else, and you can ask to come off
          the list at any time.
        </p>
        {done ? (
          <p role="status" className={`mt-10 inline-block border border-br-teal/50 px-6 py-4 ${mono} text-sm text-br-teal`}>
            {state.ok}
          </p>
        ) : (
          <form
            action={formAction}
            onSubmit={(event) => {
              event.preventDefault();
              const fd = new FormData(event.currentTarget);
              startTransition(() => formAction(fd));
            }}
            className="mx-auto mt-10 grid max-w-xl gap-3 text-left sm:grid-cols-[1.4fr_1fr_auto]"
          >
            <label className="block">
              <span className="sr-only">Email address</span>
              <input name="email" type="email" required placeholder="Email address" autoComplete="email" inputMode="email" className={input} />
            </label>
            <label className="block">
              <span className="sr-only">Town (optional)</span>
              <input name="town" placeholder="Town (optional)" autoComplete="address-level2" maxLength={80} className={input} />
            </label>
            {/* Hidden from people; bots fill it in. */}
            <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
              <label>
                Website
                <input name="website" tabIndex={-1} autoComplete="off" />
              </label>
            </div>
            <button
              type="submit"
              disabled={pending}
              className={`light-sweep min-h-12 bg-br-platinum px-7 ${mono} text-sm font-bold tracking-[0.1em] text-br-space transition-colors hover:bg-br-red hover:text-br-platinum disabled:opacity-60`}
            >
              {pending ? "SIGNING UP…" : "SIGN UP"}
            </button>
            {state.error ? (
              <p role="alert" className="font-(family-name:--font-inter) text-sm text-[#f08a7f] sm:col-span-3">
                {state.error}
              </p>
            ) : null}
          </form>
        )}
      </div>
    </section>
  );
}
