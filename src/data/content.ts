import type { SeedData } from "@/lib/types";

/*
 * Copy that was hardcoded before Tommy could edit the site. On first run it
 * is copied into the database (see SEED), and from then on /admin is where
 * it changes. Editing this file after that has no effect on the live site.
 */

export const SOUNDCLOUD_URL = "https://soundcloud.com/tommy-b-2";

/*
 * There is deliberately no Bandcamp link. The account previously linked here
 * (djtommyb72) belongs to a different artist of the same name. Add one in
 * /admin only once Tommy confirms his own account.
 */

export const BOOKING_EMAIL = "tommybmusic@mail.com";

export const TAGLINE = "Two decades of hard trance. Oxford, UK.";

export const BIO_PARAGRAPHS = [
  "Tommy B is an Oxford-based DJ and producer on the UK free party hard trance circuit. He started out as a drum and bass DJ before finding his passion for hard trance, the sound that has defined two decades of releases across a string of underground labels, from GBH Records and Unit One to Rapture and Free The Mind.",
  "He sits inside the Project Storm Recordings family, the label that has carried much of his later output. His 2016 single Wired To Respond remains his biggest record, with over 270,000 SoundCloud plays, and he is still moving: Forbidden, a collaboration with Logger and Critical Error, landed on Project Storm in February 2025, with Rescue Me (La'Da Da'Da) following in 2026.",
  "On the road he has played the Imagination Stage at Boomtown, three editions of Illusive Festival and counting, and holds down regular sets at Twisted Culture in Dunstable alongside Project Storm label nights on the free party circuit.",
];

export const SEED: SeedData = {
  tagline: TAGLINE,
  bio: BIO_PARAGRAPHS,
  bookingEmail: BOOKING_EMAIL,
  featuredTrack: SOUNDCLOUD_URL,
  links: { soundcloud: SOUNDCLOUD_URL },
};

/*
 * Facts from the artist dossier (July 2026), all stated in the bio above.
 * Shown as the credits strip on home and booking. Edit here if they change.
 */
export const CREDITS = [
  { value: "270K+", label: "SoundCloud plays on Wired To Respond" },
  { value: "Boomtown", label: "Imagination Stage" },
  { value: "3×", label: "Illusive Festival" },
  { value: "Project Storm", label: "Recordings family" },
];

export const BOOKING_COPY =
  "Tommy B is available for club nights, festivals and free parties across the UK and Europe. For rates and availability, send an enquiry below or email directly.";
