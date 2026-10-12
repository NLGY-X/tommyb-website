/** What every form action hands back to the page. */
export interface FormState {
  ok?: string;
  error?: string;
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
