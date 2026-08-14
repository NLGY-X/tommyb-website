"use client";

import { useHostname } from "@/components/shared/useHostname";

/*
 * The chat embed needs the live hostname in its `parent` param, so the src is
 * built on the client. Rendering nothing until then is deliberate: pointing
 * the iframe at a URL with the wrong parent makes Twitch serve a refusal page
 * that then has to be replaced, which flashes.
 */
export default function TwitchChat({ channel }: { channel: string }) {
  const hostname = useHostname();

  if (!hostname) {
    return null;
  }

  const src = `https://www.twitch.tv/embed/${channel}/chat?parent=${hostname}&darkpopout`;

  return (
    <div className="twitch-chat-tint flex flex-1">
      <iframe
        src={src}
        title="Twitch chat"
        className="h-full min-h-[420px] w-full border-0"
      />
    </div>
  );
}
