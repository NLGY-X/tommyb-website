import { test } from "node:test";
import assert from "node:assert/strict";
import { isSubmitToken, SubmitOnce } from "../src/lib/form.ts";

test("a double tap or a retry saves once", async () => {
  const once = new SubmitOnce<number>();
  let saves = 0;
  const save = async () => {
    saves++;
    await new Promise((r) => setTimeout(r, 10));
    return 41 + saves;
  };
  // two taps land while the first save is still running
  const [a, b] = await Promise.all([once.run("tok-aaaaaaaaaaaaaaaa", 0, save), once.run("tok-aaaaaaaaaaaaaaaa", 5, save)]);
  assert.equal(saves, 1);
  assert.equal(a, 42);
  assert.equal(b, 42);
  // a retry after the reply was lost
  assert.equal(await once.run("tok-aaaaaaaaaaaaaaaa", 60_000, save), 42);
  assert.equal(saves, 1);
  // a new form is a new gig
  assert.equal(await once.run("tok-bbbbbbbbbbbbbbbb", 60_000, save), 43);
  assert.equal(saves, 2);
});

test("a failed save is forgotten, and old tokens expire", async () => {
  const once = new SubmitOnce<number>(1000);
  await assert.rejects(once.run("tok-cccccccccccccccc", 0, async () => {
    throw new Error("disk full");
  }));
  await new Promise((r) => setImmediate(r));
  assert.equal(await once.run("tok-cccccccccccccccc", 10, async () => 7), 7);
  assert.equal(await once.run("tok-cccccccccccccccc", 500, async () => 8), 7);
  assert.equal(await once.run("tok-cccccccccccccccc", 2000, async () => 9), 9);
  once.forget("tok-cccccccccccccccc");
  assert.equal(await once.run("tok-cccccccccccccccc", 2001, async () => 10), 10);
});

test("submit tokens are short and plain", () => {
  assert.equal(isSubmitToken("3f1c2a9e-7b4d-4e0a-9c1b-2d3e4f5a6b7c"), true);
  assert.equal(isSubmitToken("short"), false);
  assert.equal(isSubmitToken("x".repeat(65)), false);
  assert.equal(isSubmitToken("../../etc/passwd-aaaaaaaa"), false);
});
