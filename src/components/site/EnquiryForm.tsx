"use client";

import { startTransition, useActionState, useState } from "react";
import { sendEnquiry } from "@/app/actions";
import { initialFormState } from "@/lib/form";

const mono = "font-(family-name:--font-space-mono)";
const input =
  "mt-2 block min-h-12 w-full border border-br-chrome/30 bg-br-space/70 px-4 py-3 font-(family-name:--font-inter) text-base text-br-platinum placeholder:text-br-chrome/40 focus:border-br-teal focus:outline-none [color-scheme:dark]";
const label = `block ${mono} text-[11px] tracking-[0.2em] text-br-chrome`;

export default function EnquiryForm({ email }: { email: string }) {
  const [state, formAction, pending] = useActionState(sendEnquiry, initialFormState);
  const [who, setWho] = useState<{ name: string; email: string } | null>(null);

  if (state.ok && who) {
    return (
      <div role="status" className="glass-panel rounded-2xl px-6 py-10 text-center md:px-10">
        <p className={`${mono} text-xs tracking-[0.3em] text-br-teal`}>ENQUIRY SENT</p>
        <p className="distressed mt-5 font-(family-name:--font-display) text-3xl uppercase text-br-platinum md:text-4xl">
          Thanks, {who.name.split(" ")[0]}
        </p>
        <p className="mx-auto mt-5 max-w-md font-(family-name:--font-inter) text-sm leading-relaxed text-br-chrome">
          Your enquiry is with Tommy. He&apos;ll reply to <span className="text-br-platinum">{who.email}</span>. If
          it&apos;s urgent, email{" "}
          <a href={`mailto:${email}`} className="text-br-teal underline-offset-4 hover:underline">
            {email}
          </a>{" "}
          too.
        </p>
      </div>
    );
  }

  return (
    <form
      action={formAction}
      onSubmit={(event) => {
        event.preventDefault();
        const fd = new FormData(event.currentTarget);
        setWho({ name: String(fd.get("name") ?? ""), email: String(fd.get("email") ?? "") });
        startTransition(() => formAction(fd));
      }}
      className="glass-panel grid gap-5 rounded-2xl p-5 sm:grid-cols-2 md:p-8"
    >
      <label className={label}>
        YOUR NAME
        <input name="name" required maxLength={120} autoComplete="name" className={input} />
      </label>
      <label className={label}>
        EMAIL
        <input name="email" type="email" required autoComplete="email" inputMode="email" className={input} />
      </label>
      <label className={label}>
        EVENT
        <input name="event" maxLength={160} placeholder="Name of the night or festival" className={input} />
      </label>
      <label className={label}>
        DATE
        <input name="eventDate" type="date" className={input} />
      </label>
      <label className={`${label} sm:col-span-2`}>
        VENUE OR TOWN
        <input name="place" maxLength={160} className={input} />
      </label>
      <label className={`${label} sm:col-span-2`}>
        MESSAGE
        <textarea
          name="message"
          rows={5}
          maxLength={4000}
          placeholder="Set length, slot, fee or anything else Tommy should know"
          className={input}
        />
      </label>
      <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label>
          Website
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      {state.error ? (
        <p role="alert" className="font-(family-name:--font-inter) text-sm text-[#f08a7f] sm:col-span-2">
          {state.error}
        </p>
      ) : null}
      <div className="flex flex-wrap items-center gap-4 sm:col-span-2">
        <button
          type="submit"
          disabled={pending}
          className={`light-sweep min-h-12 bg-br-platinum px-8 ${mono} text-sm font-bold tracking-[0.1em] text-br-space transition-colors hover:bg-br-red hover:text-br-platinum disabled:opacity-60`}
        >
          {pending ? "SENDING…" : "SEND ENQUIRY"}
        </button>
        <p className="font-(family-name:--font-inter) text-xs text-br-chrome">
          Or email{" "}
          <a href={`mailto:${email}`} className="text-br-teal underline-offset-4 hover:underline">
            {email}
          </a>
        </p>
      </div>
    </form>
  );
}
