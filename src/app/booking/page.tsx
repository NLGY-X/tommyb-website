import type { Metadata } from "next";
import { BOOKING_COPY, BOOKING_EMAIL, INFO_EMAIL } from "@/data/content";

export const metadata: Metadata = {
  title: "Booking",
  description:
    "Book Tommy B for club nights, festivals and underground events across the UK and Europe.",
};

export default function BookingPage() {
  return (
    <main className="relative pb-12 pt-32">
      <section className="section-fade px-6">
        <div className="mx-auto max-w-6xl text-center">
          <p className="font-(family-name:--font-space-mono) text-xs tracking-[0.3em] text-br-chrome/70">
            BKG/26 — BOOKINGS AND MANAGEMENT
          </p>
          <h1 className="distressed mx-auto mt-8 max-w-4xl font-(family-name:--font-display) text-[clamp(2.4rem,7vw,5.5rem)] uppercase leading-[1.05] tracking-tight text-br-platinum">
            Bring the Tempo Up
          </h1>
          <hr className="beam-line mx-auto mt-10 max-w-2xl" />
          <p className="mx-auto mt-10 max-w-xl font-(family-name:--font-inter) text-sm leading-relaxed text-br-chrome">
            {BOOKING_COPY}
          </p>
          <a
            href={`mailto:${BOOKING_EMAIL}`}
            className="light-sweep mt-10 inline-block bg-br-platinum px-10 py-4 font-(family-name:--font-space-mono) text-sm font-bold tracking-[0.15em] text-br-space transition-colors hover:bg-br-red hover:text-br-platinum"
          >
            {BOOKING_EMAIL}
          </a>
          <p className="mt-8 font-(family-name:--font-inter) text-xs text-br-chrome">
            Press and general enquiries:{" "}
            <a
              href={`mailto:${INFO_EMAIL}`}
              className="text-br-teal underline-offset-4 hover:underline"
            >
              {INFO_EMAIL}
            </a>
          </p>
        </div>
      </section>

    </main>
  );
}
