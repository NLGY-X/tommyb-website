"use client";

import Image from "next/image";
import Link from "next/link";
import { withBasePath } from "@/components/shared/basePath";
import { useCart } from "@/components/store/CartContext";

/*
 * Full bleed store header. The artwork sits behind the glass nav and blends
 * into the page below, with the title and cart anchored to the product grid
 * width so the whole page reads on one vertical rhythm.
 */
export default function StoreHero() {
  const { count } = useCart();

  return (
    <section className="relative pt-20 md:pt-0">
      {/*
        Source is 1600x563, so the full-height band is back — at 440px the
        image still downscales on any viewport past ~1250px rather than
        stretching. Framing sits left of centre because the neon sign is the
        hero moment and centre-cropping loses it on a phone.
      */}
      <div className="relative h-[210px] w-full overflow-hidden sm:h-[320px] lg:h-[440px]">
        <Image
          src={withBasePath("/store-shop.jpg")}
          alt="The Tommy B record shop: a neon TOMMY B Records and Merch sign above crates of vinyl, with branded caps and hoodies on the racks"
          fill
          loading="eager"
          fetchPriority="high"
          sizes="100vw"
          quality={85}
          className="object-cover object-[28%_center]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black/75 to-transparent sm:h-28"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-br-space via-br-space/85 to-transparent sm:h-40 lg:h-48"
        />
      </div>

      {/* The title reads over the foot of the frame, where the crates and rug
          sit dark under the scrim — well clear of the neon up in the corner. */}
      <div className="absolute inset-x-0 bottom-0">
        <div className="mx-auto flex max-w-6xl flex-wrap items-end justify-between gap-4 px-6 pb-6">
          <h1 className="font-(family-name:--font-display) text-3xl text-br-platinum drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)] md:text-5xl">
            Official Store
          </h1>
          <Link
            href="/basket"
            className="glass-panel light-sweep inline-flex min-h-11 items-center rounded-full px-5 font-(family-name:--font-inter) text-sm text-br-platinum transition-colors hover:text-br-teal md:min-h-0 md:py-2.5"
          >
            Cart ({count})
          </Link>
        </div>
      </div>
    </section>
  );
}
