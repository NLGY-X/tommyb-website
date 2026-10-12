"use server";

import { after } from "next/server";
import { FormLimiter } from "@/lib/auth";
import { addEnquiry, addSubscriber, getSettings } from "@/lib/db";
import { isIsoDate, text, type FormState } from "@/lib/form";
import { isEmail } from "@/lib/links";
import { sendMail, smtpFromEnv } from "@/lib/smtp";
import { BOOKING_EMAIL } from "@/data/content";
import { db } from "@/server/db";
import { clientAddress } from "@/server/session";

const holder = globalThis as unknown as { __tommybForms?: FormLimiter };
const limiter = (holder.__tommybForms ??= new FormLimiter(5, 10 * 60_000));

function fail(error: string): FormState {
  return { error, at: Date.now() };
}

/*
 * Both forms carry a hidden "website" field. People never see it; form-filling
 * bots usually fill it in. Those get a normal-looking reply and nothing saved.
 */
function isBot(fd: FormData): boolean {
  return text(fd, "website") !== "";
}

export async function joinMailingList(_prev: FormState, fd: FormData): Promise<FormState> {
  const email = text(fd, "email", 254).toLowerCase();
  const town = text(fd, "town", 80);
  if (!isEmail(email)) return fail("That email address doesn't look right.");
  if (isBot(fd)) return { ok: "You're on the list.", at: Date.now() };
  if (!limiter.allow(await clientAddress(), Date.now())) {
    return fail("Too many sign-ups from here. Try again in a few minutes.");
  }
  const { created } = addSubscriber(db(), email, town);
  return {
    ok: created
      ? "You're on the list. You'll get an email when new dates go up."
      : "You're already on the list.",
    at: Date.now(),
  };
}

export async function sendEnquiry(_prev: FormState, fd: FormData): Promise<FormState> {
  const enquiry = {
    name: text(fd, "name", 120),
    email: text(fd, "email", 254),
    event: text(fd, "event", 160),
    eventDate: text(fd, "eventDate", 10),
    place: text(fd, "place", 160),
    message: text(fd, "message", 4000),
  };
  if (!enquiry.name) return fail("Add your name.");
  if (!isEmail(enquiry.email)) return fail("Add an email address Tommy can reply to.");
  if (enquiry.eventDate && !isIsoDate(enquiry.eventDate)) return fail("The date doesn't look right.");
  if (!enquiry.message && !enquiry.event) return fail("Tell Tommy a little about the booking.");
  if (isBot(fd)) return { ok: "sent", at: Date.now() };
  if (!limiter.allow(await clientAddress(), Date.now())) {
    return fail("Too many messages from here. Try again in a few minutes, or email directly.");
  }

  addEnquiry(db(), enquiry);

  const smtp = smtpFromEnv(process.env);
  if (smtp) {
    const to = getSettings(db()).bookingEmail || BOOKING_EMAIL;
    const from = process.env.SMTP_FROM || process.env.SMTP_USER || to;
    /* After the reply is sent, so a slow mail server never holds up the thank-you. */
    after(async () => {
      try {
        await sendMail(smtp, {
          from,
          to,
          replyTo: enquiry.email,
          subject: `Booking enquiry: ${enquiry.event || enquiry.name}`,
          text: [
            `Name: ${enquiry.name}`,
            `Email: ${enquiry.email}`,
            `Event: ${enquiry.event || "-"}`,
            `Date: ${enquiry.eventDate || "-"}`,
            `Venue or town: ${enquiry.place || "-"}`,
            "",
            enquiry.message,
            "",
            "Reply to this email to answer them. It's also saved under Messages in /admin.",
          ].join("\n"),
        });
      } catch (error) {
        console.error("Enquiry email failed (the enquiry is saved in /admin):", error);
      }
    });
  }
  return { ok: "sent", at: Date.now() };
}
