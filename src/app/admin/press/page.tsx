import type { Metadata } from "next";
import Image from "next/image";
import ActionForm from "@/components/admin/ActionForm";
import ConfirmButton from "@/components/admin/ConfirmButton";
import PhotoInput from "@/components/admin/PhotoInput";
import { AdminTop, Card, Field, inputClass } from "@/components/admin/ui";
import { pressPhotos, siteSettings } from "@/server/data";
import { requireAdmin } from "@/server/session";
import { deletePressPhoto, saveRider, saveShortBio, uploadPressPhotos } from "../actions";

export const metadata: Metadata = { title: "Press kit" };
export const dynamic = "force-dynamic";

export default async function PressAdminPage() {
  await requireAdmin();
  const settings = siteSettings();
  const photos = pressPhotos();

  return (
    <>
      <AdminTop title="Press kit" />
      <main className="mx-auto max-w-2xl space-y-6 px-4 pt-6">
        <p className="text-base text-br-chrome">
          Everything here goes on the booking page, for promoters to download.
        </p>

        <Card>
          <h2 className="mb-5 text-lg font-semibold">Press photos</h2>
          {photos.length ? (
            <ul className="mb-6 grid grid-cols-2 gap-3">
              {photos.map((photo) => (
                <li key={photo.id} className="space-y-2">
                  <Image
                    src={`/uploads/${photo.file}`}
                    alt={photo.caption || "Press photo"}
                    width={320}
                    height={320}
                    className="aspect-square w-full rounded-lg object-cover"
                  />
                  {photo.caption ? <p className="text-sm text-br-chrome">{photo.caption}</p> : null}
                  <ConfirmButton action={deletePressPhoto} fields={{ id: photo.id }} confirm="Remove this photo from the press kit?">
                    Remove
                  </ConfirmButton>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mb-6 text-base text-br-chrome">No press photos yet.</p>
          )}
          <ActionForm action={uploadPressPhotos} submitLabel="Upload photos" pendingLabel="Uploading…" resetOnSuccess>
            <PhotoInput
              name="photos"
              label="Add photos"
              hint="You can pick several at once. They're kept big enough for print."
              maxEdge={3000}
              quality={0.9}
              multiple
            />
            <Field label="Photo credit (optional)" hint="For example: Photo by Sam Smith.">
              <input name="caption" maxLength={200} className={inputClass} />
            </Field>
          </ActionForm>
        </Card>

        <Card>
          <h2 className="mb-5 text-lg font-semibold">Short bio for promoters</h2>
          <ActionForm action={saveShortBio} submitLabel="Save short bio">
            <Field label="Short bio" hint="A few lines a promoter can paste into an event listing. Leave empty to use the first paragraph of your bio.">
              <textarea name="shortBio" rows={6} defaultValue={settings.shortBio} className={inputClass} />
            </Field>
          </ActionForm>
        </Card>

        <Card>
          <h2 className="mb-5 text-lg font-semibold">Tech rider</h2>
          <ActionForm action={saveRider} submitLabel="Save tech rider">
            <Field label="Rider as text" hint="For example: 3 x CDJ-3000, DJM-900NXS2, booth monitors.">
              <textarea name="riderText" rows={6} defaultValue={settings.riderText} className={inputClass} />
            </Field>
            {settings.riderPdf ? (
              <div className="rounded-xl border border-white/10 p-4">
                <a href={`/uploads/${settings.riderPdf}`} className="text-base text-br-teal underline underline-offset-4" target="_blank" rel="noreferrer">
                  Open the current rider PDF
                </a>
                <label className="mt-3 flex min-h-12 items-center gap-3 text-base text-br-chrome">
                  <input type="checkbox" name="removePdf" className="h-6 w-6 accent-br-red" />
                  Remove the PDF
                </label>
              </div>
            ) : null}
            <Field label={settings.riderPdf ? "Replace the PDF (optional)" : "Or upload a PDF (optional)"}>
              <input
                type="file"
                name="pdf"
                accept="application/pdf,.pdf"
                className="block w-full rounded-xl border border-dashed border-white/25 bg-white/[0.03] p-4 text-base text-br-chrome file:mr-4 file:rounded-lg file:border-0 file:bg-br-platinum file:px-4 file:py-2.5 file:font-semibold file:text-br-space"
              />
            </Field>
          </ActionForm>
        </Card>
      </main>
    </>
  );
}
