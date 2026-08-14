interface SoundCloudEmbedProps {
  url: string;
  height?: number;
  color?: string;
  title?: string;
}

export default function SoundCloudEmbed({
  url,
  height = 420,
  color = "ff5500",
  title = "Tommy B on SoundCloud",
}: SoundCloudEmbedProps) {
  const src = `https://w.soundcloud.com/player/?url=${encodeURIComponent(
    url,
  )}&color=%23${color}&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false`;

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
    />
  );
}
