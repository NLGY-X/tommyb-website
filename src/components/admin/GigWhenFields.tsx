"use client";

import { useState } from "react";
import { describeGigWhen } from "@/lib/gigs";
import { Field, inputClass } from "./ui";

/*
 * The date and start time, with the choice read back in words underneath.
 * A phone's picker shows dates in the phone's own order, so 03/04 could be
 * either month; "Friday 3 April 2026" can't be misread.
 */
export default function GigWhenFields({ date = "", startTime = "" }: { date?: string; startTime?: string }) {
  const [day, setDay] = useState(date);
  const [time, setTime] = useState(startTime);
  const when = describeGigWhen(day, time);

  return (
    <>
      <Field label="Date">
        <input
          name="date"
          type="date"
          required
          defaultValue={date}
          onChange={(event) => setDay(event.currentTarget.value)}
          className={`${inputClass} [color-scheme:dark]`}
        />
      </Field>

      <Field label="Start time (optional)" hint="After midnight? Keep the date of the night.">
        <input
          name="startTime"
          type="time"
          defaultValue={startTime}
          onChange={(event) => setTime(event.currentTarget.value)}
          className={`${inputClass} [color-scheme:dark]`}
        />
      </Field>

      {when ? (
        <p aria-live="polite" className="-mt-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-base text-br-platinum">
          {when}
        </p>
      ) : null}
    </>
  );
}
