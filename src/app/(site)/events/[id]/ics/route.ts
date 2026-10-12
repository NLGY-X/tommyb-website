import { getGig } from "@/lib/db";
import { gigToIcs, icsFileName } from "@/lib/ics";
import { db, siteUrl } from "@/server/db";

/* /events/12/ics: one gig as a calendar file. Phones open it straight into the calendar app. */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const gig = /^\d+$/.test(id) ? getGig(db(), Number(id)) : null;
  if (!gig) {
    return new Response("Not found", { status: 404 });
  }
  return new Response(gigToIcs(gig, { siteUrl: siteUrl(), now: new Date() }), {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="${icsFileName(gig)}"`,
      "Cache-Control": "no-store",
    },
  });
}
