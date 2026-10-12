interface SoundCloudEmbedProps {
  url: string;
  height?: number;
  color?: string;
  title?: string;
  /** The big-artwork player. Suits a single featured track or set. */
  visual?: boolean;
}

/** A profile link (one path segment) plays as a list; a track or set link plays on its own. */
export function isProfileUrl(url: string): boolean {
  try {
    return new URL(url).pathname.split("/").filter(Boolean).length <= 1;
  } catch {
    return true;
  }
}

export default function SoundCloudEmbed({
  url,
  height = 420,
  color = "2fa8a0",
  title = "Tommy B on SoundCloud",
  visual = false,
}: SoundCloudEmbedProps) {
  const src = `https://w.soundcloud.com/player/?url=${encodeURIComponent(
    url,
  )}&color=%23${color}&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false${
    visual ? "&visual=true" : ""
  }`;

  return (
    <iframe
      title={title}
      width="100%"
      height={height}
      scrolling="no"
      frameBorder="no"
      allow="autoplay"
      src={src}
      loading="lazy"
      className="block"
    />
  );
}
