import Image from "next/image";
import { gigStart, isoWithOffset, placeLine } from "@/lib/gigs";
import type { Gig } from "@/lib/types";

/* Same order everywhere, so a date keeps its colour from home to the dates page. */
export const ACCENTS = ["#d43d2f", "#e07b24", "#2fa8a0"];

const mono = "font-(family-name:--font-space-mono)";

/** A ticket button only when there's a link; otherwise the status in words, never colour alone. */
export function GigAction({ gig, size = "sm" }: { gig: Gig; size?: "sm" | "lg" }) {
  const pad = size === "lg" ? "px-7 text-sm min-h-12" : "px-4 text-[11px] min-h-11 md:min-h-9";
  if (gig.status === "sold-out") {
    return (
      <span className={`inline-flex items-center border border-br-chrome/40 ${pad} ${mono} tracking-[0.2em] text-br-chrome`}>
        SOLD OUT
      </span>
    );
  }
  if (gig.ticketUrl) {
    return (
      <a
        href={gig.ticketUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={`light-sweep inline-flex items-center bg-br-platinum ${pad} ${mono} font-bold tracking-[0.2em] text-br-space transition-colors hover:bg-br-red hover:text-br-platinum`}
      >
        {gig.status === "free" ? "FREE TICKETS" : "TICKETS"}
        <span className="sr-only"> for {gig.name} (opens the ticket site)</span>
      </a>
    );
  }
  if (gig.status === "free") {
    return (
      <span className={`inline-flex items-center border border-br-teal/60 ${pad} ${mono} tracking-[0.2em] text-br-teal`}>
        FREE ENTRY
      </span>
    );
  }
  if (gig.status === "tba") {
    return (
      <span className={`inline-flex items-center border border-br-gold/60 ${pad} ${mono} tracking-[0.2em] text-br-gold`}>
        LOCATION TBA
      </span>
    );
  }
  return null;
}

export function CalendarLink({ gig, className = "" }: { gig: Gig; className?: string }) {
  return (
    <a
      href={`/events/${gig.id}/ics`}
      download
      className={`inline-flex min-h-11 items-center gap-1.5 ${mono} text-[11px] tracking-[0.2em] text-br-teal underline-offset-4 hover:underline md:min-h-9 ${className}`}
    >
      <span aria-hidden>+</span> CALENDAR
      <span className="sr-only"> (add {gig.name} to your calendar)</span>
    </a>
  );
}

export function Poster({
  gig,
  width,
  height,
  className = "",
  sizes,
}: {
  gig: Gig;
  width: number;
  height: number;
  className?: string;
  sizes?: string;
}) {
  if (!gig.poster) {
    return null;
  }
  return (
    <a
      href={`/uploads/${gig.poster}`}
      target="_blank"
      rel="noopener noreferrer"
      className={`block shrink-0 overflow-hidden bg-black ${className}`}
    >
      <Image
        src={`/uploads/${gig.poster}`}
        alt={`Poster for ${gig.name}`}
        width={width}
        height={height}
        sizes={sizes ?? `${width}px`}
        className="h-full w-full object-cover"
      />
    </a>
  );
}

/** schema.org MusicEvent, so a gig can show up in Google's event listings. */
export function GigJsonLd({ gigs, siteUrl }: { gigs: Gig[]; siteUrl: string }) {
  if (!gigs.length) {
    return null;
  }
  const data = gigs.map((gig) => {
    const start = gigStart(gig);
    const performer = { "@type": "Person", name: "Tommy B", url: siteUrl };
    return {
      "@context": "https://schema.org",
      "@type": "MusicEvent",
      name: `${gig.name}: Tommy B`,
      startDate: start ? isoWithOffset(start) : gig.date,
      eventStatus: "https://schema.org/EventScheduled",
      eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
      location: {
        "@type": "Place",
        name: gig.status === "tba" || !gig.venue ? gig.town : gig.venue,
        address: {
          "@type": "PostalAddress",
          addressLocality: gig.town,
          addressCountry: "GB",
        },
      },
      performer,
      organizer: { "@type": "Organization", name: gig.name },
      description: [placeLine(gig), gig.note].filter(Boolean).join(". "),
      url: `${siteUrl}/events`,
      ...(gig.poster ? { image: [`${siteUrl}/uploads/${gig.poster}`] } : {}),
      ...(gig.ticketUrl || gig.status === "sold-out" || gig.status === "free"
        ? {
            offers: {
              "@type": "Offer",
              url: gig.ticketUrl ?? `${siteUrl}/events`,
              availability:
                gig.status === "sold-out" ? "https://schema.org/SoldOut" : "https://schema.org/InStock",
              ...(gig.status === "free" ? { price: 0, priceCurrency: "GBP" } : {}),
            },
          }
        : {}),
    };
  });
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
