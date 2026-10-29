import type { Metadata } from "next";
import { Noto_Sans_Malayalam } from "next/font/google";
import "./globals.css";

const font = Noto_Sans_Malayalam({ subsets: ["malayalam", "latin"], display: "swap" });

export const metadata: Metadata = {
  // links and share images always point at the real domain, even when the page is opened on the *.vercel.app address
  metadataBase: new URL(process.env.SITE_URL ?? "http://localhost:3000"),
  title: { default: "Fatwa Islamonlive", template: "%s | Fatwa Islamonlive" },
  description: "The one and only comprehensive Fatwa portal in Malayalam",
  alternates: { canonical: "./", types: { "application/rss+xml": "/feed.xml" } },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ml">
      <body className={`${font.className} min-h-screen bg-[#f4f6f3] text-ink`}>{children}</body>
    </html>
  );
}
