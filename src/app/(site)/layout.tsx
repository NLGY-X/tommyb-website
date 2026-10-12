import BigRoomNav from "@/components/bigroom/BigRoomNav";
import BigRoomFooter from "@/components/bigroom/BigRoomFooter";
import { siteSettings } from "@/server/data";

/*
 * Every public page reads the database, so render on each request. A SQLite
 * read is microseconds, and it means a gig rolls into "Past" the morning
 * after without anyone pressing anything.
 */
export const dynamic = "force-dynamic";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  const settings = siteSettings();
  return (
    <div className="theme-bigroom relative flex min-h-screen flex-1 flex-col overflow-x-hidden bg-br-space text-br-platinum">
      <div aria-hidden className="ambient-haze" />
      <div aria-hidden className="grain" />
      <BigRoomNav showLive={Boolean(settings.twitch)} />
      <div className="relative z-10 flex flex-1 flex-col">{children}</div>
      <BigRoomFooter links={settings.links} email={settings.bookingEmail} />
    </div>
  );
}
