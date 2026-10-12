import { randomBytes } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

export type UploadKind = "jpg" | "png" | "webp" | "pdf";

export const MIME: Record<UploadKind, string> = {
  jpg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  pdf: "application/pdf",
};

/** 15MB: a full-size phone photo or a long rider PDF fits; a video does not. */
export const MAX_UPLOAD_BYTES = 15 * 1024 * 1024;

const NAME = /^[a-z0-9]{16,40}\.(jpg|png|webp|pdf)$/;

/** Upload names are random and fixed-shape, so a path can never escape the folder. */
export function isSafeUploadName(name: string): boolean {
  return NAME.test(name);
}

/** Trusts the bytes, not the file name or the browser's claimed type. */
export function detectKind(buf: Uint8Array): UploadKind | null {
  if (buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "jpg";
  if (
    buf.length >= 8 &&
    buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47 &&
    buf[4] === 0x0d && buf[5] === 0x0a && buf[6] === 0x1a && buf[7] === 0x0a
  ) return "png";
  if (
    buf.length >= 12 &&
    ascii(buf, 0, 4) === "RIFF" && ascii(buf, 8, 12) === "WEBP"
  ) return "webp";
  if (buf.length >= 5 && ascii(buf, 0, 5) === "%PDF-") return "pdf";
  return null;
}

/**
 * iPhones save photos as HEIC (Android phones sometimes as HEIF). Browsers
 * other than Safari can't open them, so they can't be shrunk or shown on the
 * site. Spotting them by the ftyp box lets the error say what to do.
 */
export function isHeic(buf: Uint8Array): boolean {
  if (buf.length < 12 || ascii(buf, 4, 8) !== "ftyp") return false;
  return ["heic", "heix", "heim", "heis", "hevc", "hevx", "mif1", "msf1"].includes(ascii(buf, 8, 12));
}

export const HEIC_ERROR =
  "That's an iPhone HEIC photo, which websites can't show. Take a screenshot of it and upload the screenshot, " +
  "or set the camera to Most Compatible (Settings, Camera, Formats).";

function ascii(buf: Uint8Array, start: number, end: number): string {
  return String.fromCharCode(...buf.subarray(start, end));
}

/** Reads pixel size from the file header for JPEG, PNG and WebP. Null if it can't tell. */
export function imageSize(buf: Uint8Array): { width: number; height: number } | null {
  const kind = detectKind(buf);
  const view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
  if (kind === "png" && buf.length >= 24) {
    return { width: view.getUint32(16), height: view.getUint32(20) };
  }
  if (kind === "webp" && buf.length >= 30) {
    const chunk = ascii(buf, 12, 16);
    if (chunk === "VP8X") {
      const w = 1 + (buf[24] | (buf[25] << 8) | (buf[26] << 16));
      const h = 1 + (buf[27] | (buf[28] << 8) | (buf[29] << 16));
      return { width: w, height: h };
    }
    if (chunk === "VP8 ") {
      return { width: view.getUint16(26, true) & 0x3fff, height: view.getUint16(28, true) & 0x3fff };
    }
    if (chunk === "VP8L") {
      const bits = view.getUint32(21, true);
      return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 };
    }
    return null;
  }
  if (kind === "jpg") {
    let offset = 2;
    while (offset + 9 < buf.length) {
      if (buf[offset] !== 0xff) {
        offset++;
        continue;
      }
      const marker = buf[offset + 1];
      if (marker === 0xff) {
        offset++;
        continue;
      }
      const length = view.getUint16(offset + 2);
      /* SOF0 to SOF15, except DHT (C4), JPG (C8) and DAC (CC) */
      if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
        return { height: view.getUint16(offset + 5), width: view.getUint16(offset + 7) };
      }
      offset += 2 + length;
    }
  }
  return null;
}

export type SaveResult =
  | { ok: true; name: string; kind: UploadKind; bytes: number; width: number | null; height: number | null }
  | { ok: false; error: string };

/** Checks a file and writes it under a random name. Errors are written for Tommy to read. */
export async function saveUpload(
  dir: string,
  file: { size: number; arrayBuffer(): Promise<ArrayBuffer> },
  allowed: UploadKind[],
): Promise<SaveResult> {
  if (file.size === 0) {
    return { ok: false, error: "That file is empty." };
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return { ok: false, error: "That file is over 15MB. Try a smaller photo or PDF." };
  }
  const buf = new Uint8Array(await file.arrayBuffer());
  const kind = detectKind(buf);
  if (!kind && isHeic(buf) && allowed.includes("jpg")) {
    return { ok: false, error: HEIC_ERROR };
  }
  if (!kind || !allowed.includes(kind)) {
    const wanted = allowed.includes("pdf") && allowed.length === 1 ? "a PDF" : "a JPEG, PNG or WebP photo";
    return { ok: false, error: `That file type isn't supported. Please choose ${wanted}.` };
  }
  const size = kind === "pdf" ? null : imageSize(buf);
  const name = `${randomBytes(12).toString("hex")}.${kind}`;
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, name), buf);
  return { ok: true, name, kind, bytes: buf.length, width: size?.width ?? null, height: size?.height ?? null };
}

export async function removeUpload(dir: string, name: string | null | undefined): Promise<void> {
  if (!name || !isSafeUploadName(name)) {
    return;
  }
  await unlink(path.join(dir, name)).catch(() => {});
}
