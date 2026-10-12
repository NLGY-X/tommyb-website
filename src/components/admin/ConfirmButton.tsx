"use client";

import type { ReactNode } from "react";
import { buttonDanger, buttonSecondary } from "./ui";

/** A one-button form for delete and move actions. Deletes ask first. */
export default function ConfirmButton({
  action,
  fields,
  confirm,
  children,
  tone = "danger",
  className = "",
  label,
}: {
  action: (fd: FormData) => Promise<void>;
  fields: Record<string, string | number>;
  confirm?: string;
  children: ReactNode;
  tone?: "danger" | "plain";
  className?: string;
  label?: string;
}) {
  return (
    <form
      action={action}
      onSubmit={(event) => {
        if (confirm && !window.confirm(confirm)) {
          event.preventDefault();
        }
      }}
      className={className}
    >
      {Object.entries(fields).map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={value} />
      ))}
      <button type="submit" aria-label={label} className={`${tone === "danger" ? buttonDanger : buttonSecondary} w-full`}>
        {children}
      </button>
    </form>
  );
}
