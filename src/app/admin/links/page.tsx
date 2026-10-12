import type { Metadata } from "next";
import ActionForm from "@/components/admin/ActionForm";
import { AdminTop, Field, inputClass } from "@/components/admin/ui";
import { LINK_INFO } from "@/lib/links";
import { LINK_KEYS } from "@/lib/types";
import { siteSettings } from "@/server/data";
import { requireAdmin } from "@/server/session";
import { saveLinks } from "../actions";

export const metadata: Metadata = { title: "Links" };
export const dynamic = "force-dynamic";

export default async function LinksAdminPage() {
  await requireAdmin();
  const settings = siteSettings();
  return (
    <>
      <AdminTop title="Links" />
      <main className="mx-auto max-w-2xl px-4 pt-6">
        <p className="mb-6 text-base text-br-chrome">
          Paste the link to each profile. Leave a box empty and it won&apos;t show anywhere on the site.
          Adding Twitch also turns on a Live page.
        </p>
        <ActionForm action={saveLinks} submitLabel="Save links" stickySubmit>
          {LINK_KEYS.map((key) => (
            <Field key={key} label={LINK_INFO[key].label}>
              <input
                name={key}
                type="text"
                inputMode="url"
                autoCapitalize="off"
                autoCorrect="off"
                spellCheck={false}
                autoComplete="off"
                enterKeyHint="next"
                placeholder={LINK_INFO[key].example}
                defaultValue={settings.links[key]}
                className={inputClass}
              />
            </Field>
          ))}
          <Field label="Booking email" hint="Shown on the booking page. Booking enquiries are emailed here when email sending is set up.">
            <input
              name="bookingEmail"
              type="email"
              inputMode="email"
              autoCapitalize="off"
              autoComplete="email"
              enterKeyHint="done"
              defaultValue={settings.bookingEmail}
              className={inputClass}
            />
          </Field>
        </ActionForm>
      </main>
    </>
  );
}
