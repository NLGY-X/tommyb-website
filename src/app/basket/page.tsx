import type { Metadata } from "next";
import BasketView from "@/components/bigroom/BasketView";

export const metadata: Metadata = {
  title: "Your Cart",
  description: "Review your Tommy B order and check out.",
};

export default function BasketPage() {
  return (
    <main className="relative px-6 pb-24 pt-32">
      <BasketView />
    </main>
  );
}
