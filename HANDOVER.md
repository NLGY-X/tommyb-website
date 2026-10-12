# Tommy B: website handover

Live at https://tommybmusic.co.uk. A Next.js 16 server (App Router, React 19, Tailwind 4) with its data in SQLite through Node's built-in `node:sqlite`. Tommy edits gigs, music, bio, links and the press kit himself at `/admin`, on his phone.

## Run it locally

```bash
npm install
ADMIN_PASSWORD=anything npm run dev     # PowerShell: $env:ADMIN_PASSWORD="anything"; npm run dev
```

Open http://localhost:3000 and http://localhost:3000/admin. The first request creates `./data/site.db` and `./data/uploads/`, seeded from `src/data/content.ts`. Both are git-ignored.

```bash
npm test         # node:test over src/lib: data layer, auth, past/upcoming split, .ics, uploads, SMTP
npm run lint
npm run build
```

Needs Node 24 or newer (`node:sqlite`). Node prints an ExperimentalWarning for SQLite; the Docker image silences it.

## Deploy

The VPS runs the app in Docker on `127.0.0.1:3001`, and Caddy proxies the domain to it. The database and uploads live in `./data` next to `docker-compose.yml`, outside the image, so rebuilding never touches them.

First time, on the VPS:

```bash
# Docker, if it isn't there yet
curl -fsSL https://get.docker.com | sudo sh && sudo usermod -aG docker $USER   # then log out and back in

git clone https://github.com/NLGY-X/tommyb-website.git ~/tommyb
cd ~/tommyb
cp .env.example .env && nano .env      # set ADMIN_PASSWORD (and SMTP_* if wanted)
mkdir -p data                          # as the ubuntu user (uid 1000), which the container runs as
docker compose up -d --build
curl -sI http://127.0.0.1:3001 | head -1   # expect HTTP/1.1 200 OK
```

Then point Caddy at it. In the Caddyfile, replace the static `root`/`file_server` lines for the site with:

```
tommybmusic.co.uk {
    reverse_proxy 127.0.0.1:3001
}
```

and `sudo systemctl reload caddy`. `/srv/tommyb` is no longer used.

Updating after a push:

```bash
cd ~/tommyb && git pull && docker compose up -d --build
```

Backup is the `data` folder. Stop the container for the few seconds the copy takes so SQLite's WAL file is settled:

```bash
cd ~/tommyb && docker compose stop && tar czf ~/tommyb-data-$(date +%F).tgz data && docker compose start
```

### Environment

| Variable | Needed | What it does |
| --- | --- | --- |
| `ADMIN_PASSWORD` | yes | The one admin password. Unset means nobody can sign in. Changing it signs every phone out. |
| `SITE_URL` | no | Defaults to `https://tommybmusic.co.uk`. Used in .ics files, JSON-LD, the sitemap and link previews. |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` | no | When `SMTP_HOST` is set, each booking enquiry is also emailed to the booking address (Reply-To is the promoter). Port 465 uses TLS, anything else STARTTLS; it refuses to send a password without TLS. For mail.com: `smtp.mail.com`, 587, full address and password. |
| `DATA_DIR` | no | Set to `/app/data` in the image. Locally it defaults to `./data`. |

**Booking enquiries always live in `/admin` under Messages**, whether or not email is set up. If an email fails to send, the enquiry is still saved and the error goes to `docker compose logs`.

## Pages

| Route | What it shows |
| --- | --- |
| `/` | Hero artwork; the next gig as a flyer strip with poster, tickets and add-to-calendar; the featured SoundCloud track; up to five more dates; credits; mailing list sign-up; booking call |
| `/events` | Upcoming gigs on the club-night timeline (21:00 to 05:00, a marker at the start time), stacked cards on a phone, posters, a ticket button only when there's a link, `.ics` per gig, MusicEvent JSON-LD; then the mailing list and the past gigs archive by year |
| `/events/[id]/ics` | One gig as a calendar file. Early-hours starts (before 07:00) land on the morning after the night's date. |
| `/booking` | Press kit: booking copy and email, credits, short bio, downloadable press photos, top three mixes, tech rider (text and/or PDF), coming-up and past gigs, enquiry form with a thank-you |
| `/music` | Featured track, the mix list, the SoundCloud profile player |
| `/bio` | Tagline, bio, profile facts, the first press photo if there is one |
| `/live` | Twitch player and chat. 404 until a Twitch link is set; the nav link appears with it. |
| `/uploads/[name]` | Tommy's uploads from the data folder. `?download=name` makes the browser save it. |
| `/admin` | Sign in, then: Add a gig, Gigs, Messages (with a "new" count), Music, About, Links, Press kit, Sign out |

A gig moves from upcoming to past at 6am London time the morning after its date, on its own. Public pages render on every request (a SQLite read is microseconds), so there is no cache to go stale; admin saves also call `revalidatePath` so the browser's router cache refreshes.

## The admin

Built for a phone: 17px inputs (no iOS zoom), 56px buttons, plain labels.

- **Sign-in**: compared in constant time against `ADMIN_PASSWORD`. Five wrong tries locks that address for 15 minutes, with a ceiling of 50 failures across all addresses. Success sets an httpOnly, Secure, SameSite=Lax cookie on `/admin` for a year, signed with HMAC-SHA256 using a random per-install secret (stored in the DB) mixed with the password.
- **Gigs**: date (native picker), optional start time, name of the night, venue (blank for a secret location), town, status (Tickets on sale, Free entry, Sold out, Location TBA), optional ticket link, optional poster, note. Edit, delete, duplicate (copies everything except the date, poster included).
- **Photos** are shrunk in the browser before upload (posters to 1600px, press photos to 3000px, JPEG), which saves mobile data and drops the GPS location phones store in photos. The server checks file type by its bytes and caps files at 15MB. Uploads display through Next's image optimiser (sharp ships with Next).
- **Music**: paste a SoundCloud link for the home page, keep an ordered mix list. `on.soundcloud.com` share links are followed to the full address at save time, because the embed can't read them.
- **Messages**: booking enquiries and mailing list sign-ups, newest first, CSV export of each. The site doesn't send emails to the list; Tommy exports it and emails from his own account.

Both public forms have a hidden honeypot field and allow five submissions per address per ten minutes.

## Code map

```
src/
  lib/          plain Node modules shared by the app and the tests (no Next imports, ".ts" imports)
                db.ts (schema, migrations, queries), gigs.ts (London time, past/upcoming),
                ics.ts, auth.ts, uploads.ts, links.ts, csv.ts, smtp.ts, form.ts, types.ts
  server/       Next-side glue: db() connection, session cookies, page data helpers
  app/(site)/   public pages, nav and footer layout, link-preview images
  app/admin/    admin pages and all admin server actions (actions.ts)
  app/actions.ts  public enquiry and mailing list actions
  components/   bigroom/ (nav, footer, hero, Twitch), site/ (gig pieces, forms), admin/, three/ (unused 3D)
  data/content.ts  first-run seed copy and the credits strip
tests/          node:test files
```

Schema changes go at the end of `MIGRATIONS` in `src/lib/db.ts`; each runs once, tracked by SQLite's `user_version`.

## Design

Warm near-black, bone-white type, and the hero artwork's brick red, rust amber and muted teal. Archivo Black display type with a distressed erosion mask, Space Mono for record-sleeve labels, Inter for body. Film grain, haze and red-amber-teal hairlines. The next-gig flyer has a hazard-tape edge in the three colours and a tilted poster.

The admin uses the same palette without grain or distressed type.

## Performance

- **Nothing 3D is mounted on any page.** The procedural three.js library (`src/components/three/`, `StudioScene`, `StoreBanner`) ships no bytes because nothing imports it. Delete it if the artwork direction is final; three, drei and postprocessing could then come out of `package.json`.
- The hero is one `<img>` with pre-sized WebP files (`public/hero-640.webp` 43KB, `-1024` 94KB, `-1667` 189KB) instead of the 2.3MB PNG. It doesn't use the image optimiser: during local testing one optimiser job for the hero (w=1920) hung and the desktop hero stayed blank until a restart, which isn't a risk worth taking on the main image.
- On a phone the hero sits still; the slow zoom runs from 768px up. Reduced motion stops the zoom, the ticker and the fades.
- Link previews are static JPEGs of about 110KB each (`opengraph-image.jpg` in each route folder), made from the hero artwork with the page name in the site fonts. Swap any of them for another 1200x630 JPEG with the same name.

## Facts and placeholders

- Bio, tagline and SoundCloud (https://soundcloud.com/tommy-b-2, confirmed as his on 12 Oct 2026) are real, from the July 2026 artist dossier. The credits strip (270K+ plays on Wired To Respond, Boomtown Imagination Stage, Illusive Festival three times, Project Storm) restates the bio and lives in `src/data/content.ts`.
- No gigs, press photos, rider, mixes or other social links exist yet. Each section stays hidden, or shows an honest empty state, until Tommy adds them in `/admin`.
- **Bandcamp: don't restore the old link.** `djtommyb72.bandcamp.com` belongs to a different artist called Tommy B. Add Tommy's own in `/admin` once he confirms it.
- Twitch can mute archived streams that contain other artists' tracks.

Original artwork files sit in the project root (`tommy-b-stack.png`, `store-image.png`). Fonts load through `next/font`.
