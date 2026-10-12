/*
 * CSV for Excel, Numbers and Google Sheets. Cells that start with = + - @
 * are prefixed with an apostrophe, so a sign-up typed as a formula can't run
 * when the file is opened.
 */
function cell(value: string | number): string {
  let text = String(value);
  if (/^[=+\-@\t\r]/.test(text)) {
    text = `'${text}`;
  }
  if (/[",\r\n]/.test(text)) {
    text = `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

export function toCsv(headers: string[], rows: (string | number)[][]): string {
  /* The BOM makes Excel read the file as UTF-8, so accented names survive. */
  return "﻿" + [headers, ...rows].map((r) => r.map(cell).join(",")).join("\r\n") + "\r\n";
}
