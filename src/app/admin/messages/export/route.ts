import { toCsv } from "@/lib/csv";
import { listEnquiries, listSubscribers } from "@/lib/db";
import { db } from "@/server/db";
import { isAdmin } from "@/server/session";

/* /admin/messages/export?list=mailing or ?list=enquiries */
export async function GET(request: Request) {
  if (!(await isAdmin())) {
    return new Response("Sign in first", { status: 401 });
  }
  const list = new URL(request.url).searchParams.get("list");
  const date = new Date().toISOString().slice(0, 10);
  let csv: string;
  let name: string;
  if (list === "enquiries") {
    csv = toCsv(
      ["Received", "Name", "Email", "Event", "Date", "Venue or town", "Message"],
      listEnquiries(db()).map((e) => [e.createdAt, e.name, e.email, e.event, e.eventDate, e.place, e.message]),
    );
    name = `tommy-b-enquiries-${date}.csv`;
  } else {
    csv = toCsv(
      ["Email", "Town", "Signed up"],
      listSubscribers(db()).map((s) => [s.email, s.town, s.createdAt]),
    );
    name = `tommy-b-mailing-list-${date}.csv`;
  }
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${name}"`,
      "Cache-Control": "no-store",
    },
  });
}
