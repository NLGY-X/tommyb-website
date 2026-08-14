import Link from "next/link";
import { INFO_EMAIL, SOUNDCLOUD_URL } from "@/data/content";

/*
 * Brand marks are inline SVG on a 24x24 grid, drawn in currentColor so each
 * one picks up its link's hover colour. No network request, no icon library.
 */

function SoundCloudIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
      {/* waveform bars, rising towards the cloud */}
      <rect x="0.6" y="13.2" width="1.15" height="4.8" rx="0.57" />
      <rect x="2.5" y="11.4" width="1.15" height="6.6" rx="0.57" />
      <rect x="4.4" y="9.9" width="1.15" height="8.1" rx="0.57" />
      <rect x="6.3" y="11.1" width="1.15" height="6.9" rx="0.57" />
      {/* cloud */}
      <path d="M9.5 18V8.6a5.3 5.3 0 0 1 8.62 2.62A3.9 3.9 0 0 1 17.9 18H9.5Z" />
    </svg>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function MailIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className}
    >
      <rect x="2" y="4.5" width="20" height="15" rx="2" />
      <path d="m2.8 6 8.1 6.1a1.8 1.8 0 0 0 2.2 0L21.2 6" />
    </svg>
  );
}

/* Each mark lights up in its own brand colour on hover; email takes the site teal. */
const SOCIALS = [
  {
    name: "SoundCloud",
    href: SOUNDCLOUD_URL,
    external: true,
    icon: SoundCloudIcon,
    hover: "hover:border-[#ff5500]/60 hover:text-[#ff5500]",
  },
  {
    name: "Facebook",
    href: "https://www.facebook.com",
    external: true,
    icon: FacebookIcon,
    hover: "hover:border-[#1877f2]/60 hover:text-[#1877f2]",
  },
  {
    name: "Press and booking enquiries by email",
    href: `mailto:${INFO_EMAIL}`,
    external: false,
    icon: MailIcon,
    hover: "hover:border-br-teal/60 hover:text-br-teal",
  },
];

export default function BigRoomFooter() {
  return (
    <footer className="gold-hairline px-6 pb-[calc(3rem+env(safe-area-inset-bottom))] pt-14">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-7 text-center">
        <Link
          href="/"
          className="flex min-h-11 items-center font-(family-name:--font-display) text-base tracking-[0.3em] text-br-platinum/90 transition-colors hover:text-br-platinum md:min-h-0"
        >
          TOMMY B
        </Link>

        <ul className="flex items-center gap-4">
          {SOCIALS.map((social) => {
            const Icon = social.icon;
            return (
              <li key={social.name}>
                <a
                  href={social.href}
                  {...(social.external
                    ? { target: "_blank", rel: "noopener noreferrer" }
                    : {})}
                  className={`flex h-12 w-12 items-center justify-center rounded-full border border-br-chrome/25 text-br-chrome transition-colors duration-300 hover:bg-white/5 ${social.hover}`}
                >
                  <Icon className="h-[19px] w-[19px]" />
                  <span className="sr-only">{social.name}</span>
                </a>
              </li>
            );
          })}
        </ul>

        <hr className="beam-line w-full max-w-xs opacity-60" />

        <p className="max-w-md font-(family-name:--font-inter) text-xs leading-relaxed text-br-chrome/50">
          Tommy B 2026. Concept showcase. Events, store and checkout are demo
          content. No payment is taken.
        </p>
      </div>
    </footer>
  );
}
