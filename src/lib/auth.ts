import { createHash, createHmac, timingSafeEqual } from "node:crypto";

export const SESSION_COOKIE = "tb_admin";
export const SESSION_DAYS = 365;

function sha256(value: string): Buffer {
  return createHash("sha256").update(value, "utf8").digest();
}

/**
 * Constant-time password check. Both sides are hashed first so the compare
 * always runs over 32 bytes and the length of the real password never leaks.
 * An unset password never matches, so a missing env var locks the admin
 * rather than opening it.
 */
export function passwordMatches(input: string, expected: string | undefined): boolean {
  if (!expected) {
    return false;
  }
  return timingSafeEqual(sha256(input), sha256(expected));
}

/**
 * The signing key mixes the per-install secret with the password, so changing
 * ADMIN_PASSWORD signs every phone out.
 */
export function sessionKey(secret: string, password: string): Buffer {
  return createHmac("sha256", secret).update(`tommyb-admin:${password}`).digest();
}

function sign(key: Buffer, expires: number): string {
  return createHmac("sha256", key).update(`admin|${expires}`).digest("base64url");
}

/** "<expiry seconds>.<signature>" */
export function createSessionToken(key: Buffer, now: Date, days = SESSION_DAYS): string {
  const expires = Math.floor(now.getTime() / 1000) + days * 86_400;
  return `${expires}.${sign(key, expires)}`;
}

export function verifySessionToken(key: Buffer, token: string | undefined, now: Date): boolean {
  if (!token) {
    return false;
  }
  const match = /^(\d{1,12})\.([A-Za-z0-9_-]{43})$/.exec(token);
  if (!match) {
    return false;
  }
  const expires = Number(match[1]);
  if (expires <= Math.floor(now.getTime() / 1000)) {
    return false;
  }
  const expected = Buffer.from(sign(key, expires));
  const given = Buffer.from(match[2]);
  return expected.length === given.length && timingSafeEqual(expected, given);
}

/**
 * Counts failed sign-ins per address in a sliding window. Five wrong
 * passwords locks that address out for the rest of the window, and a global
 * ceiling slows anyone spreading guesses over many addresses.
 */
export class LoginLimiter {
  private failures = new Map<string, number[]>();
  private all: number[] = [];
  private readonly perAddress: number;
  private readonly overall: number;
  private readonly windowMs: number;

  constructor(perAddress = 5, overall = 50, windowMs = 15 * 60_000) {
    this.perAddress = perAddress;
    this.overall = overall;
    this.windowMs = windowMs;
  }

  private recent(list: number[], now: number): number[] {
    return list.filter((t) => now - t < this.windowMs);
  }

  /** Seconds until another attempt is allowed, or 0 if it is allowed now. */
  retryAfter(address: string, now: number): number {
    const mine = this.recent(this.failures.get(address) ?? [], now);
    this.all = this.recent(this.all, now);
    let blockedBy: number | null = null;
    if (mine.length >= this.perAddress) {
      blockedBy = mine[mine.length - this.perAddress];
    } else if (this.all.length >= this.overall) {
      blockedBy = this.all[this.all.length - this.overall];
    }
    if (blockedBy === null) {
      return 0;
    }
    return Math.max(1, Math.ceil((blockedBy + this.windowMs - now) / 1000));
  }

  fail(address: string, now: number): void {
    const mine = this.recent(this.failures.get(address) ?? [], now);
    mine.push(now);
    this.failures.set(address, mine);
    this.all.push(now);
    if (this.failures.size > 5000) {
      for (const [key, list] of this.failures) {
        if (this.recent(list, now).length === 0) this.failures.delete(key);
      }
    }
  }

  succeed(address: string): void {
    this.failures.delete(address);
  }
}

/**
 * A simple fixed-window counter for the public forms, so one address cannot
 * fill the enquiries or the mailing list with junk.
 */
export class FormLimiter {
  private hits = new Map<string, number[]>();
  private readonly max: number;
  private readonly windowMs: number;

  constructor(max = 5, windowMs = 10 * 60_000) {
    this.max = max;
    this.windowMs = windowMs;
  }

  allow(address: string, now: number): boolean {
    const list = (this.hits.get(address) ?? []).filter((t) => now - t < this.windowMs);
    if (list.length >= this.max) {
      this.hits.set(address, list);
      return false;
    }
    list.push(now);
    this.hits.set(address, list);
    if (this.hits.size > 5000) {
      this.hits.clear();
    }
    return true;
  }
}
