# Tommy B: Website, Handover Notes

The site is the Big Room concept taken forward as the single, final direction. The earlier two-variant showcase (with the Underground warehouse variant) was folded into one site: Big Room routes now live at the root and all Underground code has been removed.

## Run it

```bash
npm install
npm run dev
```

Open http://localhost:3000. `npm run build` and `npm run lint` both pass clean.

Requires Node 20 or newer (developed on Node 24).

## Routes

| Route | Purpose |
| --- | --- |
| `/` | Home |
| `/bio`, `/music`, `/events`, `/live`, `/store`, `/basket`, `/booking` | Inner pages |

Every route is statically prerendered. The root layout holds the nav, footer and `CartProvider`.

## The design

Festival headliner energy pulled straight out of the hero artwork. Warm near-black base with bone-white type, accented by the artwork's own cabinet and light-streak colours: dusty brick red, rust amber and muted teal. Archivo Black display type carries a distressed erosion mask like the artwork's TOMMY B lettering, Space Mono carries the record-sleeve vernacular (catalogue tags like `TB-01`, set times, data labels) and Inter is body text only. A fixed film-grain layer and faint warm haze sit behind every page; thin light-streak hairlines (red, amber, teal) divide sections. Buttons are solid bone poster style, turning brick red on hover. The homepage hero and the store header use supplied artwork; a chrome studio render is available for reuse (see Unused assets below).

The events page is a club-night timeline: a 21:00–05:00 axis with one coloured block per set, positioned by `setStart` and sized by `setHours` from `src/data/gigs.ts`. Ticketed sets get a waveform fill, sold-out and locked sets get a diagonal hatch. On mobile it collapses to stacked cards.

## Architecture

```
src/
  app/                      routes, one folder per page, root layout holds nav, footer and CartProvider
  components/
    bigroom/                site UI
    shared/                 SoundCloud embed, reduced motion hook, seeded RNG
    store/                  cart state, cart maths, checkout state machine
    three/                  procedural 3D gear library
    scenes/                 full 3D scenes composed from the gear library
  data/                     gigs, products, copy, shared types
```

Content is single sourced in `src/data/`.

## 3D

All 3D is procedural geometry written in code with react-three-fiber. There are no model files, no HDRIs, no textures and no third party assets, so there is nothing to license and nothing to break. `src/components/three/` holds a reusable library: speaker cabinets, speaker stacks, a turntable with tonearm and spinning vinyl, DJ headphones, a DJ booth with mixer and animated meters, laser rigs, haze and a product showcase.

Scenes are client only. Route components import them through `next/dynamic` with `ssr: false` so three.js never runs during the build.

Performance notes: particle counts are capped well under 1500 per scene, device pixel ratio is clamped to 1.75, shadow maps are 512 in busy scenes, and reflective floors run at 768. Under `prefers-reduced-motion` every scene switches to an on demand frame loop and freezes on a composed still, with strobe and sweep effects disabled entirely.

## Store and cart

The store is functional, not a mockup. Add to cart, quantity steppers clamped 1 to 9, line removal, live subtotal, a nav badge that updates everywhere, and a checkout flow with validation that ends in an order confirmation.

Cart state uses `useSyncExternalStore` over `localStorage` (key `tommyb-cart`), cross tab sync through the storage event, and defensive parsing that discards corrupt or unknown entries. There are no effects in the cart layer, so it is free of hydration mismatches.

What is deliberately not built: payment. Checkout is a demonstration flow that takes no money and sends no email, and the UI says so. Wiring a provider such as Stripe means replacing the `confirm` step in `src/components/store/CheckoutFlow.tsx`.

## Accessibility and quality

Reduced motion is respected across CSS animations and the 3D canvases. Decorative canvases are hidden from assistive technology. Every form input is labelled, the active nav item is marked with `aria-current`, and text contrast stays high against the dark background. Colour is never the only signal for gig status.

## Placeholder content to replace

- **Gigs** in `src/data/gigs.ts` are invented, including the secret rave entries that demonstrate a location unlock mechanic. Set times (`setStart`, `setHours`) drive the events timeline.
- **All products** in `src/data/products.ts` are placeholder, prices included. The merch line is invented, and the music prices/pack size were taken from the misattributed Bandcamp account described below — treat none of it as his real catalogue until confirmed.
- **Bio and contact content** in `src/data/content.ts` is real, sourced from the artist dossier (July 2026): Oxford based, Project Storm family, Wired To Respond 270K+ plays, tommybmusic@mail.com.
- **Twitch channel** is the placeholder `tommyb` in `src/data/content.ts` (`TWITCH_CHANNEL`). The `/live` embed also needs the production domain added to the `PARENTS` list in `src/app/live/page.tsx` at deploy time, or Twitch will refuse the embed.
- **Live-set copyright**: Twitch mutes archived recordings containing other artists' tracks, and repeat strikes can suspend the channel. Originals-heavy sets are safest; the `/live` page says so.
- **Facebook links** point at facebook.com until the real page URL is supplied. Search for `facebook.com` to find them all.
- **Bandcamp has been removed — do not restore it from an old commit.** The site previously linked `djtommyb72.bandcamp.com`, which belongs to a *different* artist called Tommy B. Every claim sourced from it (the 69-track back catalogue pack, the per-track prices) has been pulled with the link. Add a Bandcamp link back only once the real account is confirmed by the artist.
- **SoundCloud** (https://soundcloud.com/tommy-b-2) is Tommy's own account, confirmed by Dan on 12 Oct 2026, so the "270K+ plays" figure stands.

## Images

Artwork supplied by the client sits in `public/`. `tommy-b-stack.png` is the homepage hero. `store-image.png` is the store header and has been cropped from the original supplied file to remove an unusable text panel; the untouched original remains in the project root.

## Unused and available

Two 3D pieces are complete but currently not mounted, kept because they may be wanted elsewhere:

- `src/components/scenes/bigroom/StudioScene.tsx`, a chrome turntable product shot.
- `src/components/bigroom/StoreBanner.tsx` with `StoreBannerCanvas.tsx`, a rotating vinyl and headphones banner.

Either would suit a Music or Booking page header. Delete both if the artwork direction is final.

## Stack

Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4, react-three-fiber 9 with drei and postprocessing, fonts self hosted through `next/font`.
