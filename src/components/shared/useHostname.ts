"use client";

import { useSyncExternalStore } from "react";

/* The hostname never changes for the life of the document. */
function subscribe() {
  return () => {};
}

/**
 * The current hostname, or "" while rendering on the server.
 *
 * Twitch refuses any embed whose `parent` does not match the domain it is
 * running on, so hardcoding a list means the player and chat work locally and
 * then silently fail on every deployed URL — preview builds included, where
 * the domain is generated and cannot be known in advance. Reading it at
 * runtime keeps the embeds working on localhost, preview and production
 * without a config change per environment.
 *
 * useSyncExternalStore rather than an effect: it gives a defined server
 * snapshot, so there is no hydration mismatch and no setState-in-effect.
 */
export function useHostname(): string {
  return useSyncExternalStore(
    subscribe,
    () => window.location.hostname,
    () => "",
  );
}
