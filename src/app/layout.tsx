import type { Metadata, Viewport } from "next";
import { Space_Mono, Archivo_Black, Inter } from "next/font/google";
import BigRoomNav from "@/components/bigroom/BigRoomNav";
import BigRoomFooter from "@/components/bigroom/BigRoomFooter";
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

export const metadata: Metadata = {
  title: {
    default: "Tommy B | Hard Trance DJ and Producer",
    template: "%s | Tommy B",
  },
  description:
    "Tommy B. Hard trance DJ and producer. 140 BPM and rising. Bookings, releases and upcoming dates.",
};

/* Paints mobile browser chrome the same near-black as the page. */
export const viewport: Viewport = {
  themeColor: "#070708",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${spaceMono.variable} ${display.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-black">
        <div className="theme-bigroom relative flex min-h-screen flex-1 flex-col overflow-x-hidden bg-br-space text-br-platinum">
          <div aria-hidden className="ambient-haze" />
          <div aria-hidden className="grain" />
          <BigRoomNav />
          <div className="relative z-10 flex flex-1 flex-col">{children}</div>
          <BigRoomFooter />
        </div>
      </body>
    </html>
  );
}
