import { readFile } from "node:fs/promises";
import path from "node:path";
import { isSafeUploadName, MIME, type UploadKind } from "@/lib/uploads";
import { uploadsDir } from "@/server/db";

/*
 * Serves Tommy's uploads from the data volume. Names are random and never
 * reused, so they can be cached for a year. ?download=1 asks the browser
 * to save the file, which is what the press kit buttons use.
 */
export async function GET(request: Request, { params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  if (!isSafeUploadName(name)) {
    return new Response("Not found", { status: 404 });
  }
  let body: Buffer;
  try {
    body = await readFile(path.join(uploadsDir(), name));
  } catch {
    return new Response("Not found", { status: 404 });
  }
  const kind = name.split(".").pop() as UploadKind;
  const url = new URL(request.url);
  const download = url.searchParams.get("download");
  const headers: Record<string, string> = {
    "Content-Type": MIME[kind],
    "Content-Length": String(body.length),
    "Cache-Control": "public, max-age=31536000, immutable",
    "X-Content-Type-Options": "nosniff",
  };
  if (download) {
    const base = download.replace(/[^a-z0-9-]/gi, "").slice(0, 40) || "tommy-b";
    headers["Content-Disposition"] = `attachment; filename="${base}.${kind}"`;
  }
  return new Response(new Uint8Array(body), { headers });
}
