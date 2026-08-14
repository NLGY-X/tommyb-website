# Tommy B

Official website for Tommy B, hard trance DJ and producer. Next.js App Router, "Big Room" design: deep navy lit by chromatic light beams (pink, blue, green) taken from the client-supplied speaker-stack hero artwork (`public/tommy-b-stack.png`), oversized Orbitron display type and Space Mono record-sleeve details.

## Quick start

```bash
npm install
npm run dev
```

Then open http://localhost:3000. Requires Node 20 or newer.

## Pages

| Route | Purpose |
| --- | --- |
| `/` | Home: speaker-stack hero, next dates, latest SoundCloud, featured releases, booking CTA |
| `/bio` | Artist bio |
| `/music` | Releases and SoundCloud embeds |
| `/events` | Tour dates as a club-night timeline (21:00–05:00 axis, one block per set) |
| `/live` | Live sets: embedded Twitch player and chat |
| `/store` | Releases and merch |
| `/basket` | Basket and demo checkout |
| `/booking` | Booking details and Inner Circle signup |

Every route is statically prerendered.

## The store actually works

Add products to the basket, adjust quantities, remove lines, and complete a demo checkout that issues an order reference. The basket persists in localStorage (`tommyb-cart`). No payment is taken and the footer says so; wiring a real payment provider is the only missing piece (see the `confirm` step in `src/components/store/CheckoutFlow.tsx`).

## Shared content, edit once

- `src/data/gigs.ts` for the gig calendar (date, venue, city, status, set start and length)
- `src/data/products.ts` for the store (4 releases, 4 merch items)
- `src/data/content.ts` for bio, tagline and contact details
- `src/components/three/` is a reusable procedural 3D gear library: speaker cabinets and stacks, turntable, headphones, DJ booth with mixer, laser rigs, haze, vinyl. Two ready-made 3D pieces live there and in `src/components/bigroom/` for reuse as page headers (`StudioScene`, `StoreBanner`).

## Tech and quality

- Next.js 16 (App Router, TypeScript, Tailwind CSS 4), react-three-fiber 9, drei, postprocessing
- Live SoundCloud embeds from https://soundcloud.com/tommy-b-2
- `prefers-reduced-motion` respected across CSS animations and 3D canvases
- Mobile responsive throughout (the events timeline becomes stacked cards)
- `npm run build` and `npm run lint` pass clean

## Notes

Events, set times, prices and contact emails are placeholder content ready to be swapped for the real thing. Facebook links point at facebook.com until the real page URL is supplied.
