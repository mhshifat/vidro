import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

import { TRPCProvider } from "@/trpc/provider";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://vidro.dev";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: "Vidro — AI-Powered Screen Recording & Bug Reporting",
    template: "%s | Vidro",
  },
  description:
    "Record bugs in seconds with AI-powered screen recording, screenshot annotations, and 18 AI models. The open-source alternative to Jam and Loom.",
  keywords: [
    "bug reporting",
    "screen recording",
    "screenshot tool",
    "AI bug reports",
    "QA tool",
    "chrome extension",
    "open source",
    "Jam alternative",
    "Loom alternative",
    "video bug report",
    "annotation tool",
  ],
  authors: [{ name: "Vidro" }],
  creator: "Vidro",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: APP_URL,
    siteName: "Vidro",
    title: "Vidro — AI-Powered Screen Recording & Bug Reporting",
    description:
      "Record bugs in seconds with AI-powered screen recording, screenshot annotations, and 18 AI models. The open-source alternative to Jam and Loom.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Vidro — AI-Powered Bug Reporting" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Vidro — AI-Powered Screen Recording & Bug Reporting",
    description:
      "Record bugs in seconds with AI-powered screen recording, screenshot annotations, and 18 AI models.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: [
      { rel: "icon", url: "/icons/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { rel: "icon", url: "/icons/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { rel: "icon", url: "/favicon.ico", sizes: "any", type: "image/x-icon" },
      { rel: "apple-touch-icon", url: "/icons/apple-icon-180x180.png", sizes: "180x180", type: "image/png" },
      { rel: "apple-touch-icon", url: "/icons/apple-icon-120x120.png", sizes: "120x120", type: "image/png" },
      { rel: "apple-touch-icon", url: "/icons/apple-icon-152x152.png", sizes: "152x152", type: "image/png" },
      { rel: "apple-touch-icon", url: "/icons/apple-icon-144x144.png", sizes: "144x144", type: "image/png" },
      { rel: "apple-touch-icon", url: "/icons/apple-icon-76x76.png", sizes: "76x76", type: "image/png" },
      { rel: "apple-touch-icon", url: "/icons/apple-icon-72x72.png", sizes: "72x72", type: "image/png" },
      { rel: "apple-touch-icon", url: "/icons/apple-icon-60x60.png", sizes: "60x60", type: "image/png" },
      { rel: "apple-touch-icon", url: "/icons/apple-icon-57x57.png", sizes: "57x57", type: "image/png" },
      { rel: "icon", url: "/icon.svg", sizes: "any", type: "image/svg+xml" },
    ],
    shortcut: "/icon.svg",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <TRPCProvider>{children}</TRPCProvider>
      </body>
    </html>
  );
}
