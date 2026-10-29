import type { Metadata, Viewport } from "next";
import { Anek_Malayalam, Noto_Serif_Malayalam } from "next/font/google";
import "./globals.css";

// Every page reads D1 per request (no build-time database, admin edits show instantly)
export const dynamic = "force-dynamic";

// bold display and interface type (Malayalam + Latin) and a serif for long reading
const sans = Anek_Malayalam({ subsets: ["malayalam", "latin"], variable: "--font-anek", display: "swap" });
const serif = Noto_Serif_Malayalam({ subsets: ["malayalam", "latin"], variable: "--font-notoserif", display: "swap", preload: false });

export const metadata: Metadata = {
  // links and share images always point at the real domain, even when the page is opened on the *.vercel.app address
  metadataBase: new URL(process.env.SITE_URL ?? "http://localhost:3000"),
  title: { default: "Fatwa Islamonlive", template: "%s | Fatwa Islamonlive" },
  description: "The one and only comprehensive Fatwa portal in Malayalam",
  alternates: { canonical: "./", types: { "application/rss+xml": "/feed.xml" } },
};

export const viewport: Viewport = { themeColor: "#0b3a2c" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ml">
      <body className={`${sans.variable} ${serif.variable} min-h-screen font-sans`}>{children}</body>
    </html>
  );
}
