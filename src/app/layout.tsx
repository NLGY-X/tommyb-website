import type { Metadata, Viewport } from "next";
import { Space_Mono, Archivo_Black, Inter } from "next/font/google";
import "./globals.css";

const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  weight: ["400", "700"],
  subsets: ["latin"],
});

const display = Archivo_Black({
  variable: "--font-display",
  weight: "400",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const SITE_URL = (process.env.SITE_URL || "https://tommybmusic.co.uk").replace(/\/$/, "");
const DESCRIPTION =
  "Tommy B, hard trance DJ and producer from Oxford. Upcoming dates, mixes and bookings.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Tommy B | Hard trance DJ and producer",
    template: "%s | Tommy B",
  },
  description: DESCRIPTION,
  openGraph: {
    siteName: "Tommy B",
    url: "/",
    locale: "en_GB",
    type: "website",
    title: "Tommy B | Hard trance DJ and producer",
    description: DESCRIPTION,
  },
  twitter: { card: "summary_large_image" },
};

/* Paints mobile browser chrome the same near-black as the page. */
export const viewport: Viewport = {
  themeColor: "#070708",
  colorScheme: "dark",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en-GB"
      className={`${spaceMono.variable} ${display.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-black">{children}</body>
    </html>
  );
}
