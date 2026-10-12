/** What every form action hands back to the page. */
export interface FormState {
  ok?: string;
  error?: string;
  /** The input the error is about, so the form can take Tommy straight to it. */
  field?: string;
  /** Bumps on every reply, so the same message twice still shows. */
  at?: number;
}

export const initialFormState: FormState = {};

export function text(fd: FormData, name: string, max = 2000): string {
  const value = fd.get(name);
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export function fileFrom(fd: FormData, name: string): File | null {
  const value = fd.get(name);
  return value && typeof value === "object" && "size" in value && value.size > 0 ? (value as File) : null;
}

export function filesFrom(fd: FormData, name: string): File[] {
  return fd
    .getAll(name)
    .filter((v): v is File => typeof v === "object" && v !== null && "size" in v && v.size > 0);
}

export function isIsoDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const d = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === value;
}

export function isTime(value: string): boolean {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
}

/** The random token each add form carries, so the server can tell a retry from a new gig. */
export function isSubmitToken(value: string): boolean {
  return /^[a-z0-9-]{16,64}$/i.test(value);
}

/**
 * Runs each submission's save once. A double tap, or a retry after the phone
 * lost signal before the reply came back, sends the same token again and
 * gets the first save's result instead of a second gig. A save that throws
 * is forgotten, so trying again really does try again.
 */
export class SubmitOnce<T> {
  private runs = new Map<string, { at: number; result: Promise<T> }>();
  private readonly ttlMs: number;

  constructor(ttlMs = 60 * 60_000) {
    this.ttlMs = ttlMs;
  }

  run(token: string, now: number, work: () => Promise<T>): Promise<T> {
    for (const [key, entry] of this.runs) {
      if (now - entry.at >= this.ttlMs) this.runs.delete(key);
    }
    const known = this.runs.get(token);
    if (known) {
      return known.result;
    }
    const result = work();
    this.runs.set(token, { at: now, result });
    result.catch(() => this.runs.delete(token));
    return result;
  }

  /** For a save that answered "no" without saving anything. */
  forget(token: string): void {
    this.runs.delete(token);
  }
}
