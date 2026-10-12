import type { Metadata } from "next";
import ActionForm from "@/components/admin/ActionForm";
import ConfirmButton from "@/components/admin/ConfirmButton";
import { AdminTop, Card, Field, inputClass } from "@/components/admin/ui";
import { mixes, siteSettings } from "@/server/data";
import { requireAdmin } from "@/server/session";
import { addMix, deleteMix, moveMix, saveFeatured } from "../actions";

export const metadata: Metadata = { title: "Music" };
export const dynamic = "force-dynamic";

const urlInput = {
  type: "text",
  inputMode: "url",
  autoCapitalize: "off",
  autoCorrect: "off",
  spellCheck: false,
  autoComplete: "off",
  placeholder: "https://soundcloud.com/…",
} as const;

export default async function MusicAdminPage() {
  await requireAdmin();
  const settings = siteSettings();
  const list = mixes();

  return (
    <>
      <AdminTop title="Music" />
      <main className="mx-auto max-w-2xl space-y-6 px-4 pt-6">
        <Card>
          <h2 className="text-lg font-semibold">Featured on the home page</h2>
          <p className="mb-5 mt-1 text-base text-br-chrome">
            In SoundCloud, open the track or set, tap Share, then Copy link, and paste it here.
          </p>
          <ActionForm action={saveFeatured} submitLabel="Save featured track">
            <Field label="SoundCloud link">
              <input name="featuredTrack" defaultValue={settings.featuredTrack} className={inputClass} {...urlInput} />
            </Field>
          </ActionForm>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold">Mixes</h2>
          <p className="mb-5 mt-1 text-base text-br-chrome">
            These play on the music page. The top three also show on the booking page for promoters.
          </p>

          {list.length ? (
            <ol className="mb-6 space-y-3">
              {list.map((mix, index) => (
                <li key={mix.id} className="rounded-xl border border-white/10 p-3">
                  <p className="font-semibold">
                    {index + 1}. {mix.title}
                  </p>
                  <p className="truncate text-sm text-br-chrome">{mix.url.replace("https://soundcloud.com/", "")}</p>
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    <ConfirmButton action={moveMix} fields={{ id: mix.id, direction: "up" }} tone="plain" label={`Move ${mix.title} up`}>
                      Up
                    </ConfirmButton>
                    <ConfirmButton action={moveMix} fields={{ id: mix.id, direction: "down" }} tone="plain" label={`Move ${mix.title} down`}>
                      Down
                    </ConfirmButton>
                    <ConfirmButton action={deleteMix} fields={{ id: mix.id }} confirm={`Remove ${mix.title}?`}>
                      Remove
                    </ConfirmButton>
                  </div>
                </li>
              ))}
            </ol>
          ) : (
            <p className="mb-6 text-base text-br-chrome">No mixes yet.</p>
          )}

          <h3 className="mb-4 text-base font-semibold">Add a mix</h3>
          <ActionForm action={addMix} submitLabel="Add mix" pendingLabel="Adding…" resetOnSuccess>
            <Field label="SoundCloud link">
              <input name="url" required className={inputClass} {...urlInput} />
            </Field>
            <Field label="Title (optional)" hint="Leave blank to use the name from the link.">
              <input name="title" maxLength={120} className={inputClass} />
            </Field>
          </ActionForm>
        </Card>
      </main>
    </>
  );
}
