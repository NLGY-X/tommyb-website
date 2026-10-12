"use client";

import { useState } from "react";

/** ActionForm waits on these before it sends, so a half-shrunk photo never goes up. */
export const resizing = new WeakMap<HTMLInputElement, Promise<void>>();

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("decode"));
    img.src = URL.createObjectURL(file);
  });
}

function mb(bytes: number): string {
  return bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)}MB` : `${Math.round(bytes / 1024)}KB`;
}

/*
 * Phone photos are 3 to 12MB. Shrinking in the browser before upload saves
 * Tommy's mobile data, keeps the server free of image libraries and, because
 * the canvas re-encodes the picture, drops the GPS location a phone stores
 * inside it. If anything fails, the original goes up and the server checks it.
 */
async function shrink(file: File, maxEdge: number, quality: number): Promise<File> {
  if (!file.type.startsWith("image/") && !isHeicName(file)) {
    return file;
  }
  try {
    const img = await loadImage(file);
    const { naturalWidth: w, naturalHeight: h } = img;
    const scale = Math.min(1, maxEdge / Math.max(w, h));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(w * scale);
    canvas.height = Math.round(h * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    URL.revokeObjectURL(img.src);
    const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/jpeg", quality));
    if (!blob || (scale === 1 && blob.size > file.size && /jpeg|png|webp/.test(file.type))) {
      return file;
    }
    return new File([blob], `${file.name.replace(/\.[^.]+$/, "") || "photo"}.jpg`, { type: "image/jpeg" });
  } catch {
    if (isHeicName(file)) {
      throw new HeicError();
    }
    return file;
  }
}

class HeicError extends Error {}

/* Some Android file pickers report HEIC with an empty type, so check the name too. */
function isHeicName(file: File): boolean {
  return /image\/hei[cf]/.test(file.type) || /\.hei[cf]$/i.test(file.name);
}

/* Same words as the server's HEIC_ERROR in lib/uploads.ts. */
const HEIC_HELP =
  "That's an iPhone HEIC photo, which this browser can't open. Take a screenshot of it and choose the screenshot instead, " +
  "or set the camera to Most Compatible (Settings, Camera, Formats).";

interface PhotoInputProps {
  name: string;
  label: string;
  hint?: string;
  maxEdge: number;
  quality?: number;
  multiple?: boolean;
}

export default function PhotoInput({ name, label, hint, maxEdge, quality = 0.86, multiple }: PhotoInputProps) {
  const [previews, setPreviews] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const [problem, setProblem] = useState("");

  return (
    <div>
      <label className="block">
        <span className="mb-2 block text-[15px] font-semibold text-br-platinum">{label}</span>
        {hint ? <span className="-mt-1 mb-2 block text-sm text-br-chrome">{hint}</span> : null}
        <input
          type="file"
          name={name}
          /* Plain image/*: iOS then hands over a JPEG copy of a HEIC photo. */
          accept="image/*"
          multiple={multiple}
          className="block w-full rounded-xl border border-dashed border-white/25 bg-white/[0.03] p-4 text-base text-br-chrome file:mr-4 file:rounded-lg file:border-0 file:bg-br-platinum file:px-4 file:py-2.5 file:font-semibold file:text-br-space"
          onChange={(event) => {
            const input = event.currentTarget;
            const files = Array.from(input.files ?? []);
            setProblem("");
            if (!files.length) {
              setPreviews([]);
              setNote("");
              return;
            }
            setNote("Preparing…");
            const job = (async () => {
              let out: File[];
              try {
                out = await Promise.all(files.map((f) => shrink(f, maxEdge, quality)));
              } catch {
                /* Nothing useful would upload, so clear the choice and say why. */
                input.value = "";
                setPreviews([]);
                setNote("");
                setProblem(HEIC_HELP);
                return;
              }
              try {
                const dt = new DataTransfer();
                out.forEach((f) => dt.items.add(f));
                input.files = dt.files;
              } catch {
                /* Older browsers can't swap the files; the originals go up instead. */
              }
              setPreviews(out.map((f) => URL.createObjectURL(f)));
              const before = files.reduce((n, f) => n + f.size, 0);
              const after = out.reduce((n, f) => n + f.size, 0);
              setNote(after < before ? `Ready. Shrunk from ${mb(before)} to ${mb(after)}.` : `Ready (${mb(after)}).`);
            })();
            resizing.set(input, job);
          }}
        />
      </label>
      {note ? <p className="mt-2 text-sm text-br-teal">{note}</p> : null}
      {problem ? (
        <p role="alert" className="mt-2 rounded-xl border border-br-red/60 bg-br-red/10 px-4 py-3 text-base text-br-platinum">
          {problem}
        </p>
      ) : null}
      {previews.length ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {previews.map((src) => (
            // eslint-disable-next-line @next/next/no-img-element -- local blob preview
            <img key={src} src={src} alt="" className="h-24 w-24 rounded-lg object-cover" />
          ))}
        </div>
      ) : null}
    </div>
  );
}
