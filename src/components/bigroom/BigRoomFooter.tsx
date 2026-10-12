import Link from "next/link";
import type { Links } from "@/lib/types";
import { SOCIAL_ORDER, SocialIcon, MailIcon } from "./SocialIcons";
import { LINK_INFO } from "@/lib/links";

/* Each mark lights up in its own brand colour on hover. */
const HOVER: Record<keyof Links, string> = {
  soundcloud: "hover:border-[#ff5500]/60 hover:text-[#ff5500]",
  instagram: "hover:border-[#e1306c]/60 hover:text-[#e1306c]",
  facebook: "hover:border-[#1877f2]/60 hover:text-[#4a90f5]",
  twitch: "hover:border-[#9146ff]/60 hover:text-[#a970ff]",
  bandcamp: "hover:border-[#1da0c3]/60 hover:text-[#1da0c3]",
  spotify: "hover:border-[#1ed760]/60 hover:text-[#1ed760]",
  beatport: "hover:border-[#01ff95]/60 hover:text-[#01ff95]",
  residentAdvisor: "hover:border-br-platinum/60 hover:text-br-platinum",
};

export default function BigRoomFooter({ links, email }: { links: Links; email: string }) {
  const filled = SOCIAL_ORDER.filter((key) => links[key]);
  const year = new Date().getFullYear();

  return (
    <footer className="gold-hairline relative z-10 px-6 pb-[calc(3rem+env(safe-area-inset-bottom))] pt-14">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-7 text-center">
        <Link
          href="/"
          className="flex min-h-11 items-center font-(family-name:--font-display) text-base tracking-[0.3em] text-br-platinum/90 transition-colors hover:text-br-platinum md:min-h-0"
        >
          TOMMY B
        </Link>

        <ul className="flex flex-wrap items-center justify-center gap-3">
          {filled.map((key) => (
            <li key={key}>
              <a
                href={links[key]}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex h-12 w-12 items-center justify-center rounded-full border border-br-chrome/25 text-br-chrome transition-colors duration-300 hover:bg-white/5 ${HOVER[key]}`}
              >
                <SocialIcon name={key} className="h-[19px] w-[19px]" />
                <span className="sr-only">Tommy B on {LINK_INFO[key].label}</span>
              </a>
            </li>
          ))}
          {email ? (
            <li>
              <a
                href={`mailto:${email}`}
                className="flex h-12 w-12 items-center justify-center rounded-full border border-br-chrome/25 text-br-chrome transition-colors duration-300 hover:border-br-teal/60 hover:bg-white/5 hover:text-br-teal"
              >
                <MailIcon className="h-[19px] w-[19px]" />
                <span className="sr-only">Email {email}</span>
              </a>
            </li>
          ) : null}
        </ul>

        <hr className="beam-line w-full max-w-xs opacity-60" />

        <p className="max-w-md font-(family-name:--font-inter) text-xs leading-relaxed text-br-chrome/60">
          © Tommy B {year}.{email ? <> Bookings: {email}</> : null}
        </p>
      </div>
    </footer>
  );
}
