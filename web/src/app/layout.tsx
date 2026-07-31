import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.nomadsshorts.com"),
  title: {
    default: "Nomads Shorts — Vertical clips from your travel vlogs, in minutes",
    template: "%s · Nomads Shorts",
  },
  description:
    "Built for travel creators. Paste a YouTube URL — get 5–10 vertical short clips ready to post on Reels, Shorts and TikTok. No editor to learn.",
  openGraph: {
    title: "Nomads Shorts — Vertical clips from your travel vlogs, in minutes",
    description:
      "Paste a YouTube URL. AI picks the best moments, reframes them for vertical. Ready to post in minutes.",
    url: "https://www.nomadsshorts.com",
    siteName: "Nomads Shorts",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Nomads Shorts",
    description:
      "Paste a YouTube URL. Get 5–10 vertical shorts ready to post. Made for travel creators.",
  },
  verification: {
    google: "XG8evNn5fYZ5--hmafDVtYBcOgmbBQuBnxVkYOhOs8Q",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background">
        {children}
        <Toaster />
        <Analytics />
      </body>
    </html>
  );
}
