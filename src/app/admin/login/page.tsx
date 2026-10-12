import type { Metadata } from "next";
import { redirect } from "next/navigation";
import ActionForm from "@/components/admin/ActionForm";
import { AdminTop, Field, inputClass } from "@/components/admin/ui";
import { isAdmin } from "@/server/session";
import { signIn } from "../actions";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage() {
  if (await isAdmin()) {
    redirect("/admin");
  }
  return (
    <>
      <AdminTop title="Sign in" back={null} />
      <main className="mx-auto max-w-2xl px-4 pt-6">
        <ActionForm action={signIn} submitLabel="Sign in" pendingLabel="Signing in…">
          <Field label="Password">
            <input
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className={inputClass}
            />
          </Field>
          <p className="text-sm text-br-chrome">You stay signed in on this phone for a year.</p>
        </ActionForm>
      </main>
    </>
  );
}
