const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/**
 * next/image does not prepend `basePath` to `src` automatically, so every
 * absolute path into `public/` needs this when the app is served from a
 * sub-path (GitHub Pages). No-op when BASE_PATH is unset (local dev, root deploys).
 */
export function withBasePath(path: string): string {
  return `${BASE_PATH}${path}`;
}
