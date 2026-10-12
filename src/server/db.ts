import { mkdirSync } from "node:fs";
import path from "node:path";
import { openDb, seed, type Db } from "@/lib/db";
import { SEED } from "@/data/content";

/*
 * One connection per server process. node:sqlite is synchronous and reads
 * take microseconds, so pages can query it directly on every request.
 */
const holder = globalThis as unknown as { __tommybDb?: Db };

/* DATA_DIR in Docker (/app/data); ./data next to package.json when run locally. */
export function dataDir(): string {
  const fromEnv = process.env.DATA_DIR;
  return fromEnv
    ? path.resolve(/*turbopackIgnore: true*/ fromEnv)
    : path.join(/*turbopackIgnore: true*/ process.cwd(), "data");
}

export function uploadsDir(): string {
  return path.join(dataDir(), "uploads");
}

export function db(): Db {
  if (!holder.__tommybDb) {
    const dir = dataDir();
    try {
      mkdirSync(path.join(dir, "uploads"), { recursive: true });
    } catch (error) {
      throw new Error(
        `Can't create the data folder at ${dir}. On the server, run "mkdir -p data" next to docker-compose.yml before starting.`,
        { cause: error },
      );
    }
    const connection = openDb(path.join(dir, "site.db"));
    seed(connection, SEED);
    holder.__tommybDb = connection;
  }
  return holder.__tommybDb;
}

export function siteUrl(): string {
  return (process.env.SITE_URL || "https://tommybmusic.co.uk").replace(/\/$/, "");
}
