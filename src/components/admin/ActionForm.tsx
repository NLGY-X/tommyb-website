"use client";

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
  className?: string;
}

/*
 * Every admin form goes through here: one big save button, a clear message
 * after, and the fields keep what was typed if something needs fixing.
 * Submitting through onSubmit (rather than letting React reset the form)
 * is what keeps the typing when the server says no.
 */
export default function ActionForm({
  action,
  children,
  submitLabel,
  pendingLabel = "Saving…",
  resetOnSuccess,
  className = "space-y-6",
}: ActionFormProps) {
  const [state, formAction, pending] = useActionState(action, initialFormState);
  const [preparing, setPreparing] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok && resetOnSuccess) {
      formRef.current?.reset();
    }
  }, [state, resetOnSuccess]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className={className}
      onSubmit={async (event) => {
        event.preventDefault();
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
      <button type="submit" disabled={pending || preparing} className={buttonPrimary}>
        {preparing ? "Preparing photos…" : pending ? pendingLabel : submitLabel}
      </button>
    </form>
  );
}
