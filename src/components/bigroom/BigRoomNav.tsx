"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/bio", label: "Artist" },
  { href: "/music", label: "Music" },
  { href: "/events", label: "Dates" },
  { href: "/booking", label: "Booking" },
];

function isActive(pathname: string, href: string): boolean {
  if (href === "/") {
    return pathname === "/";
  }
  return pathname.startsWith(href);
}

export default function BigRoomNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [drawnFor, setDrawnFor] = useState(pathname);

  /*
   * The drawer is mobile-only, so any route change dismisses it — including a
   * browser back/forward, not just a tap on one of its own links. Adjusting
   * during render rather than in an effect avoids a second render pass.
   */
  if (pathname !== drawnFor) {
    setDrawnFor(pathname);
    setOpen(false);
  }

  /* While it is open: Escape closes, and the page behind must not scroll. */
  useEffect(() => {
    if (!open) {
      return;
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <header className="glass-panel fixed inset-x-0 top-0 z-50 rounded-none border-x-0 border-t-0 pt-[env(safe-area-inset-top)]">
      <div className="mx-auto flex max-w-7xl items-center gap-x-4 px-4 py-2.5 md:px-6 md:py-4">
        <Link
          href="/"
          className="flex min-h-11 shrink-0 items-center font-(family-name:--font-display) text-lg tracking-[0.2em] text-br-platinum md:min-h-0"
        >
          TOMMY B
        </Link>

        {/* Wide screens fit all the labels in a row; narrow ones use the drawer below. */}
        <nav className="hidden md:flex md:flex-1 md:items-center md:justify-center md:gap-7">
          {LINKS.map((link) => {
            const active = isActive(pathname, link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={`relative whitespace-nowrap pb-1 font-(family-name:--font-inter) text-sm transition-colors ${
                  active
                    ? "text-br-platinum"
                    : "text-br-chrome hover:text-br-platinum"
                }`}
              >
                {link.label}
                {active ? (
                  <span
                    aria-hidden
                    className="absolute inset-x-0 -bottom-0.5 h-px"
                    style={{
                      background:
                        "linear-gradient(90deg, #d43d2f, #e07b24, #2fa8a0)",
                      boxShadow: "0 0 8px rgba(224,123,36,0.8)",
                    }}
                  />
                ) : null}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-1 md:ml-0 md:gap-4">
          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((value) => !value)}
            className="-mr-2 flex h-11 w-11 items-center justify-center text-br-platinum md:hidden"
          >
            <span aria-hidden className="relative block h-3.5 w-5">
              <span
                className={`absolute left-0 block h-px w-full bg-current transition-all duration-200 ${
                  open ? "top-1/2 -translate-y-1/2 rotate-45" : "top-0"
                }`}
              />
              <span
                className={`absolute left-0 top-1/2 block h-px w-full -translate-y-1/2 bg-current transition-opacity duration-200 ${
                  open ? "opacity-0" : "opacity-100"
                }`}
              />
              <span
                className={`absolute left-0 block h-px w-full bg-current transition-all duration-200 ${
                  open ? "top-1/2 -translate-y-1/2 -rotate-45" : "bottom-0"
                }`}
              />
            </span>
          </button>
        </div>
      </div>

      {open ? (
        <div className="md:hidden">
          <nav
            id="mobile-menu"
            className="relative z-10 border-t border-br-chrome/15 bg-br-space/95 px-4 pb-[calc(0.5rem+env(safe-area-inset-bottom))] backdrop-blur-xl"
          >
            {LINKS.map((link) => {
              const active = isActive(pathname, link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={`flex min-h-12 items-center gap-3 border-b border-br-chrome/10 font-(family-name:--font-inter) text-base transition-colors last:border-b-0 ${
                    active ? "text-br-platinum" : "text-br-chrome"
                  }`}
                >
                  {link.label}
                  {active ? (
                    <span
                      aria-hidden
                      className="h-px w-6"
                      style={{
                        background:
                          "linear-gradient(90deg, #d43d2f, #e07b24, #2fa8a0)",
                        boxShadow: "0 0 8px rgba(224,123,36,0.8)",
                      }}
                    />
                  ) : null}
                </Link>
              );
            })}
          </nav>
          {/*
            Tapping the dimmed page below the drawer closes it. Pointer-only and
            hidden from assistive tech on purpose: the X button and Escape are
            the accessible routes out, and exposing this too would announce a
            second identical "Close menu" control.
          */}
          <div
            aria-hidden
            onClick={() => setOpen(false)}
            className="absolute inset-x-0 top-full h-screen bg-br-space/70"
          />
        </div>
      ) : null}
    </header>
  );
}
