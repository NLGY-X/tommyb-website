"use client";

import dynamic from "next/dynamic";

const StoreBannerCanvas = dynamic(() => import("./StoreBannerCanvas"), {
  ssr: false,
});

export default function StoreBanner() {
  return (
    <div className="glass-panel relative h-[40vh] min-h-[320px] overflow-hidden rounded-2xl">
      <div aria-hidden className="absolute inset-0">
        <StoreBannerCanvas />
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/70 to-transparent px-6 pb-5 pt-12 text-center">
        <p className="font-(family-name:--font-inter) text-xs uppercase tracking-[0.35em] text-br-chrome">
          Heavyweight vinyl and monitor headphones, rendered live
        </p>
      </div>
    </div>
  );
}
