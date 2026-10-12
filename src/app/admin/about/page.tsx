import type { Metadata } from "next";
import ActionForm from "@/components/admin/ActionForm";
import { AdminTop, Field, inputClass } from "@/components/admin/ui";
import { siteSettings } from "@/server/data";
import { requireAdmin } from "@/server/session";
import { saveAbout } from "../actions";

export const metadata: Metadata = { title: "About" };
export const dynamic = "force-dynamic";

export default async function AboutAdminPage() {
  await requireAdmin();
  const settings = siteSettings();
  return (
    <>
      <AdminTop title="About" />
      <main className="mx-auto max-w-2xl px-4 pt-6">
        <ActionForm action={saveAbout} submitLabel="Save">
          <Field label="Tagline" hint="One short line under the big artwork on the home page.">
            <input name="tagline" maxLength={120} defaultValue={settings.tagline} className={inputClass} />
          </Field>
          <Field label="Bio" hint="Shown on the artist page. Leave an empty line between paragraphs.">
            <textarea
              name="bio"
              rows={16}
              defaultValue={settings.bio.join("\n\n")}
              className={`${inputClass} leading-relaxed`}
            />
          </Field>
        </ActionForm>
      </main>
    </>
  );
}
