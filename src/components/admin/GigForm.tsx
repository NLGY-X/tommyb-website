import { randomUUID } from "node:crypto";
import Image from "next/image";
import { saveGig } from "@/app/admin/actions";
import type { Gig } from "@/lib/types";
import ActionForm from "./ActionForm";
import GigWhenFields from "./GigWhenFields";
import PhotoInput from "./PhotoInput";
import { Field, inputClass } from "./ui";

const STATUS_CHOICES = [
  { value: "tickets", label: "Tickets on sale" },
  { value: "free", label: "Free entry" },
  { value: "sold-out", label: "Sold out" },
  { value: "tba", label: "Location TBA" },
] as const;

/**
 * Add, edit and duplicate all use this. Only the date, the name, the town
 * and (unless the location is TBA) the venue are needed; the rest can wait.
 */
export default function GigForm({
  gig,
  mode,
}: {
  gig?: Partial<Gig>;
  mode: "add" | "edit" | "duplicate";
}) {
  const poster = gig?.poster ?? null;
  return (
    <ActionForm action={saveGig} submitLabel={mode === "edit" ? "Save changes" : "Save gig"} stickySubmit>
      {mode === "edit" && gig?.id ? <input type="hidden" name="id" value={gig.id} /> : null}
      {/* A double tap or a retry after lost signal sends this again, and the server saves once. */}
      {mode === "edit" ? null : <input type="hidden" name="submitToken" value={randomUUID()} />}
      {mode === "duplicate" && poster ? <input type="hidden" name="copyPoster" value={poster} /> : null}

      <GigWhenFields date={gig?.date ?? ""} startTime={gig?.startTime ?? ""} />

      <Field label="Name of the night">
        <input name="name" required maxLength={120} defaultValue={gig?.name ?? ""} autoCapitalize="words" autoComplete="off" enterKeyHint="next" className={inputClass} />
      </Field>

      <Field label="Venue" hint="Leave blank if the location is still secret.">
        <input name="venue" maxLength={120} defaultValue={gig?.venue ?? ""} autoCapitalize="words" autoComplete="off" enterKeyHint="next" className={inputClass} />
      </Field>

      <Field label="Town">
        <input name="town" required maxLength={80} defaultValue={gig?.town ?? ""} autoCapitalize="words" autoComplete="off" enterKeyHint="next" className={inputClass} />
      </Field>

      <fieldset>
        <legend className="mb-2 block text-[15px] font-semibold text-br-platinum">Status</legend>
        <div className="grid grid-cols-2 gap-2">
          {STATUS_CHOICES.map((choice) => (
            <label key={choice.value} className="relative">
              <input
                type="radio"
                name="status"
                value={choice.value}
                defaultChecked={(gig?.status ?? "tickets") === choice.value}
                className="peer sr-only"
              />
              <span className="flex min-h-14 cursor-pointer items-center justify-center rounded-xl border border-white/20 px-3 text-center text-base text-br-chrome transition-colors peer-checked:border-br-teal peer-checked:bg-br-teal/15 peer-checked:font-semibold peer-checked:text-br-platinum peer-focus-visible:ring-2 peer-focus-visible:ring-br-teal/50">
                {choice.label}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <Field label="Ticket link (optional)" hint="The ticket button only shows when this is filled in.">
        <input
          name="ticketUrl"
          type="text"
          inputMode="url"
          autoCapitalize="off"
          autoCorrect="off"
          autoComplete="off"
          spellCheck={false}
          enterKeyHint="next"
          placeholder="https://"
          defaultValue={gig?.ticketUrl ?? ""}
          className={inputClass}
        />
      </Field>

      {poster ? (
        <div className="flex items-center gap-4 rounded-xl border border-white/10 p-3">
          <Image
            src={`/uploads/${poster}`}
            alt="Current poster"
            width={72}
            height={96}
            className="h-24 w-[72px] rounded-md object-cover"
          />
          <label className="flex min-h-12 flex-1 items-center gap-3 text-base text-br-chrome">
            <input type="checkbox" name="removePoster" className="h-6 w-6 accent-br-red" />
            Remove this poster
          </label>
        </div>
      ) : null}

      <PhotoInput
        name="poster"
        label={poster ? "New poster (optional)" : "Poster (optional)"}
        hint="A photo or screenshot of the flyer."
        maxEdge={1600}
      />

      <Field label="Note (optional)" hint="For example: Over 18s. Or: B2B with a friend.">
        <textarea name="note" rows={3} maxLength={500} autoCapitalize="sentences" defaultValue={gig?.note ?? ""} className={inputClass} />
      </Field>
    </ActionForm>
  );
}
