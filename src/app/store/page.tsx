import type { Metadata } from "next";
import StoreHero from "@/components/bigroom/StoreHero";
import StoreView from "@/components/bigroom/StoreView";

export const metadata: Metadata = {
  title: "Official Store",
  description:
    "Tommy B official store. Releases on WAV, MP3 and vinyl, plus merch.",
};

export default function StorePage() {
  return (
    <main className="relative pb-24">
      <StoreHero />
      <div className="mt-12">
        <StoreView />
      </div>
    </main>
  );
}
