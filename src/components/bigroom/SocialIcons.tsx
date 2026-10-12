import type { LinkKey } from "@/lib/types";

/*
 * Simplified brand marks on a 24x24 grid in currentColor, so each picks up
 * its link's hover colour. Inline SVG: no icon library, no network request.
 */

export const SOCIAL_ORDER: LinkKey[] = [
  "soundcloud",
  "instagram",
  "facebook",
  "twitch",
  "spotify",
  "beatport",
  "bandcamp",
  "residentAdvisor",
];

type IconProps = { className?: string };

export function MailIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden className={className}>
      <rect x="2" y="4.5" width="20" height="15" rx="2" />
      <path d="m2.8 6 8.1 6.1a1.8 1.8 0 0 0 2.2 0L21.2 6" />
    </svg>
  );
}

const PATHS: Record<LinkKey, React.ReactNode> = {
  soundcloud: (
    <g fill="currentColor">
      <rect x="0.6" y="13.2" width="1.15" height="4.8" rx="0.57" />
      <rect x="2.5" y="11.4" width="1.15" height="6.6" rx="0.57" />
      <rect x="4.4" y="9.9" width="1.15" height="8.1" rx="0.57" />
      <rect x="6.3" y="11.1" width="1.15" height="6.9" rx="0.57" />
      <path d="M9.5 18V8.6a5.3 5.3 0 0 1 8.62 2.62A3.9 3.9 0 0 1 17.9 18H9.5Z" />
    </g>
  ),
  instagram: (
    <g fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.4" cy="6.6" r="0.6" fill="currentColor" stroke="none" />
    </g>
  ),
  facebook: (
    <path
      fill="currentColor"
      d="M13.4 21v-7.6h2.6l.4-3h-3V8.5c0-.9.3-1.5 1.5-1.5h1.6V4.3a21 21 0 0 0-2.3-.1c-2.3 0-3.9 1.4-3.9 4v2.2H7.7v3h2.6V21h3.1Z"
    />
  ),
  twitch: (
    <g fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round">
      <path d="M4.5 3h16v11l-4.5 4.5h-4L9 21.5v-3H4.5V3Z" />
      <path d="M11 7.5v4.5M15.5 7.5v4.5" strokeLinecap="round" />
    </g>
  ),
  spotify: (
    <g fill="none" stroke="currentColor" strokeLinecap="round">
      <circle cx="12" cy="12" r="9.5" strokeWidth="1.6" />
      <path d="M7 9.4c3.5-1 7.4-.7 10.3.9" strokeWidth="1.9" />
      <path d="M7.6 12.6c2.9-.8 5.9-.5 8.3.8" strokeWidth="1.7" />
      <path d="M8.2 15.5c2.3-.6 4.5-.4 6.4.6" strokeWidth="1.5" />
    </g>
  ),
  beatport: (
    <g fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 3v10.5" />
      <circle cx="12.2" cy="15.3" r="4.6" />
      <path d="M8 9.5 13 4.5" />
    </g>
  ),
  bandcamp: <path fill="currentColor" d="M7.6 6.5H22l-5.6 11H2l5.6-11Z" />,
  residentAdvisor: (
    <text
      x="12"
      y="16.2"
      textAnchor="middle"
      fontFamily="Arial, Helvetica, sans-serif"
      fontWeight="700"
      fontSize="10.5"
      fill="currentColor"
    >
      RA
    </text>
  ),
};

export function SocialIcon({ name, className }: IconProps & { name: LinkKey }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className}>
      {PATHS[name]}
    </svg>
  );
}
