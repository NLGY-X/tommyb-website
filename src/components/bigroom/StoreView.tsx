import { products } from "@/data/products";
import { SOUNDCLOUD_URL } from "@/data/content";
import ProductCard from "./ProductCard";

export default function StoreView() {
  return (
    <div className="mx-auto max-w-6xl px-6">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((product, index) => (
          <ProductCard
            key={product.id}
            product={product}
            catalogNo={`TB-${String(index + 1).padStart(2, "0")}`}
          />
        ))}
      </div>

      {/* Pointed at a Bandcamp account belonging to a different Tommy B until
          that was caught. Sending buyers to the wrong artist is worse than
          sending them nowhere, so it points at the confirmed SoundCloud. */}
      <p className="mt-8 font-(family-name:--font-space-mono) text-[10px] tracking-[0.2em] text-br-chrome/60">
        DEMO STOREFRONT. CHECKOUT IS A DEMONSTRATION FLOW, NO PAYMENT IS TAKEN
        AND NOTHING SHIPS. THE MUSIC IS UP NOW AT{" "}
        <a
          href={SOUNDCLOUD_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="text-br-teal underline-offset-4 hover:underline"
        >
          SOUNDCLOUD.COM/TOMMY-B-2
        </a>
        .
      </p>
    </div>
  );
}
