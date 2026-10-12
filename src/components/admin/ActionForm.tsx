"use client";

import { unstable_rethrow } from "next/navigation";
import { startTransition, useActionState, useEffect, useRef, useState, type ReactNode } from "react";
import { initialFormState, type FormState } from "@/lib/form";
import { resizing } from "./PhotoInput";
import { buttonPrimary } from "./ui";

interface ActionFormProps {
  action: (state: FormState, fd: FormData) => Promise<FormState>;
  children: ReactNode;
  submitLabel: string;
  pendingLabel?: string;
  /** Clear the fields after a successful save, for "add another" forms. */
  resetOnSuccess?: boolean;
  /** Keep the save button pinned to the bottom of the screen, for long forms. */
  stickySubmit?: boolean;
  className?: string;
}

const LOST_SIGNAL =
  "The phone lost its connection before the site answered. Everything you typed is still here: check your signal and tap the button again.";

/*
 * Every admin form goes through here: one big save button, a clear message
 * after, and the fields keep what was typed if something needs fixing.
 * Submitting through onSubmit (rather than letting React reset the form)
 * is what keeps the typing when the server says no.
 *
 * On a phone the signal drops. A failed request comes back as a message
 * next to the button instead of an error page that throws the typing away,
 * and a second tap while a save is running is ignored.
 */
export default function ActionForm({
  action,
  children,
  submitLabel,
  pendingLabel = "Saving…",
  resetOnSuccess,
  stickySubmit,
  className = "space-y-6",
}: ActionFormProps) {
  const [state, formAction, pending] = useActionState(async (prev: FormState, fd: FormData) => {
    try {
      return await action(prev, fd);
    } catch (error) {
      /* A redirect after a save is how success looks; let Next follow it. */
      unstable_rethrow(error);
      return { error: LOST_SIGNAL, at: Date.now() };
    }
  }, initialFormState);
  const [preparing, setPreparing] = useState(false);
  const busy = useRef(false);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    busy.current = false;
    if (state.ok && resetOnSuccess) {
      formRef.current?.reset();
    }
    /* Take Tommy to the field the message is about. */
    if (state.error && state.field) {
      const found = formRef.current?.elements.namedItem(state.field);
      const field = found instanceof RadioNodeList ? (found[0] as HTMLInputElement | undefined) : found;
      if (field instanceof HTMLElement) {
        field.setAttribute("aria-invalid", "true");
        field.focus({ preventScroll: true });
        (field.closest("label, fieldset") ?? field).scrollIntoView({ block: "center", behavior: "smooth" });
        if (field instanceof HTMLInputElement && ["text", "password", "url", "email"].includes(field.type)) {
          field.select();
        }
      }
    }
  }, [state, resetOnSuccess]);

  const messages = (
    <>
      {state.error ? (
        <p key={state.at} role="alert" className="rounded-xl border border-br-red/60 bg-br-red/10 px-4 py-3 text-base text-br-platinum">
          {state.error}
        </p>
      ) : null}
      {state.ok ? (
        <p key={state.at} role="status" className="rounded-xl border border-br-teal/60 bg-br-teal/10 px-4 py-3 text-base text-br-platinum">
          {state.ok}
        </p>
      ) : null}
    </>
  );
  const button = (
    <button type="submit" disabled={pending || preparing} className={buttonPrimary}>
      {preparing ? "Preparing photos…" : pending ? pendingLabel : submitLabel}
    </button>
  );

  return (
    <form
      ref={formRef}
      action={formAction}
      className={className}
      onInput={(event) => (event.target as HTMLElement).removeAttribute?.("aria-invalid")}
      onSubmit={async (event) => {
        event.preventDefault();
        if (busy.current) {
          return;
        }
        busy.current = true;
        const form = event.currentTarget;
        const jobs = Array.from(form.querySelectorAll<HTMLInputElement>("input[type=file]"))
          .map((input) => resizing.get(input))
          .filter(Boolean);
        if (jobs.length) {
          setPreparing(true);
          await Promise.all(jobs);
          setPreparing(false);
        }
        const fd = new FormData(form);
        startTransition(() => formAction(fd));
      }}
    >
      {children}
      {stickySubmit ? (
        <div className="sticky bottom-0 z-10 -mx-4 space-y-3 border-t border-white/10 bg-br-space/95 px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 backdrop-blur">
          {messages}
          {button}
        </div>
      ) : (
        <>
          {messages}
          {button}
        </>
      )}
    </form>
  );
}
