import { getGig } from "@/lib/db";
import { gigToIcs, icsFileName } from "@/lib/ics";
import { db, siteUrl } from "@/server/db";

/*
 * /events/12/ics: one gig as a calendar file. "inline" matters on iPhone:
 * Safari shows its Add to Calendar sheet for an inline text/calendar
 * response, but saves an "attachment" to the Files app instead. Android
 * and desktop browsers download it either way and open it in the calendar.
 */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const gig = /^\d+$/.test(id) ? getGig(db(), Number(id)) : null;
  if (!gig) {
    return new Response("Not found", { status: 404 });
  }
  return new Response(gigToIcs(gig, { siteUrl: siteUrl(), now: new Date() }), {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `inline; filename="${icsFileName(gig)}"`,
      "Cache-Control": "no-store",
    },
  });
}
