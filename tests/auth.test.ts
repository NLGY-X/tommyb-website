import { test } from "node:test";
import assert from "node:assert/strict";
import {
  createSessionToken,
  FormLimiter,
  LoginLimiter,
  passwordMatches,
  sessionKey,
  verifySessionToken,
} from "../src/lib/auth.ts";

test("password check", () => {
  assert.equal(passwordMatches("correct horse", "correct horse"), true);
  assert.equal(passwordMatches("correct hors", "correct horse"), false);
  assert.equal(passwordMatches("", "correct horse"), false);
  // an unset password locks the admin rather than opening it
  assert.equal(passwordMatches("", ""), false);
  assert.equal(passwordMatches("anything", undefined), false);
});

test("a signed session verifies until it expires a year later", () => {
  const key = sessionKey("install-secret", "pw");
  const now = new Date("2026-10-12T12:00:00Z");
  const token = createSessionToken(key, now);
  assert.equal(verifySessionToken(key, token, now), true);
  assert.equal(verifySessionToken(key, token, new Date("2027-10-11T12:00:00Z")), true);
  assert.equal(verifySessionToken(key, token, new Date("2027-10-12T12:00:01Z")), false);
});

test("tampered, malformed or foreign tokens are rejected", () => {
  const now = new Date("2026-10-12T12:00:00Z");
  const key = sessionKey("install-secret", "pw");
  const token = createSessionToken(key, now);
  const [exp, sig] = token.split(".");
  assert.equal(verifySessionToken(key, `${Number(exp) + 999999}.${sig}`, now), false);
  const flipped = sig.slice(0, -1) + (sig.endsWith("A") ? "B" : "A");
  assert.equal(verifySessionToken(key, `${exp}.${flipped}`, now), false);
  assert.equal(verifySessionToken(key, "garbage", now), false);
  assert.equal(verifySessionToken(key, undefined, now), false);
  // changing the password signs everyone out
  assert.equal(verifySessionToken(sessionKey("install-secret", "new pw"), token, now), false);
  // another install's secret doesn't work either
  assert.equal(verifySessionToken(sessionKey("other", "pw"), token, now), false);
});

test("five wrong passwords lock an address out for the window", () => {
  const limiter = new LoginLimiter(5, 50, 15 * 60_000);
  const t0 = 1_000_000;
  for (let i = 0; i < 5; i++) {
    assert.equal(limiter.retryAfter("1.2.3.4", t0 + i), 0);
    limiter.fail("1.2.3.4", t0 + i);
  }
  assert.ok(limiter.retryAfter("1.2.3.4", t0 + 10) > 0);
  // another address is unaffected
  assert.equal(limiter.retryAfter("5.6.7.8", t0 + 10), 0);
  // after the window it opens again
  assert.equal(limiter.retryAfter("1.2.3.4", t0 + 15 * 60_000 + 10), 0);
});

test("a successful sign-in clears the address's failures", () => {
  const limiter = new LoginLimiter(3);
  limiter.fail("a", 1);
  limiter.fail("a", 2);
  limiter.succeed("a");
  limiter.fail("a", 3);
  assert.equal(limiter.retryAfter("a", 4), 0);
});

test("the overall ceiling slows guesses spread over many addresses", () => {
  const limiter = new LoginLimiter(5, 10);
  for (let i = 0; i < 10; i++) limiter.fail(`10.0.0.${i}`, 100 + i);
  assert.ok(limiter.retryAfter("10.0.0.99", 200) > 0);
});

test("public form limiter", () => {
  const limiter = new FormLimiter(2, 1000);
  assert.equal(limiter.allow("x", 0), true);
  assert.equal(limiter.allow("x", 1), true);
  assert.equal(limiter.allow("x", 2), false);
  assert.equal(limiter.allow("x", 1500), true);
});
