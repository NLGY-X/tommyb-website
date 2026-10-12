import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  createSessionToken,
  LoginLimiter,
  SESSION_COOKIE,
  SESSION_DAYS,
  sessionKey,
  verifySessionToken,
} from "@/lib/auth";
import { getSecret } from "@/lib/db";
import { db } from "@/server/db";

const holder = globalThis as unknown as { __tommybLogin?: LoginLimiter };
export const loginLimiter = (holder.__tommybLogin ??= new LoginLimiter());

function key(): Buffer | null {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) {
    return null;
  }
  return sessionKey(getSecret(db()), password);
}

export async function isAdmin(): Promise<boolean> {
  /* Read the cookie first: it also tells Next this page can't be prerendered. */
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const k = key();
  if (!k) {
    return false;
  }
  return verifySessionToken(k, token, new Date());
}

/** Every admin page and action calls this first. */
export async function requireAdmin(): Promise<void> {
  if (!(await isAdmin())) {
    redirect("/admin/login");
  }
}

export async function startSession(): Promise<void> {
  const k = key();
  if (!k) {
    return;
  }
  (await cookies()).set(SESSION_COOKIE, createSessionToken(k, new Date()), {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/admin",
    maxAge: SESSION_DAYS * 86_400,
  });
}

export async function endSession(): Promise<void> {
  (await cookies()).set(SESSION_COOKIE, "", { path: "/admin", maxAge: 0, httpOnly: true, secure: true });
}

/**
 * The visitor's address. Caddy sets X-Forwarded-For; the right-most entry is
 * the one the proxy saw, so a client can't spoof its way past the limits by
 * sending its own header.
 */
export async function clientAddress(): Promise<string> {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for");
  if (forwarded) {
    const parts = forwarded.split(",").map((p) => p.trim()).filter(Boolean);
    if (parts.length) return parts[parts.length - 1];
  }
  return h.get("x-real-ip") ?? "local";
}
