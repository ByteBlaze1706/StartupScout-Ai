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

export const metadata: Metadata = {
  metadataBase: process.env.VERCEL_URL 
    ? new URL(`https://${process.env.VERCEL_URL}`) 
    : new URL("http://localhost:3000"),
  title: {
    default: "StartupScout.AI — Validate Startup Ideas",
    template: "%s | StartupScout.AI",
  },
  description: "AI-powered startup validation and market intelligence platform.",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon.png", type: "image/png" }
    ],
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "StartupScout.AI",
    description: "AI-powered startup validation and market intelligence platform.",
    siteName: "StartupScout.AI",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "StartupScout.AI",
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "StartupScout.AI",
    description: "AI-powered startup validation and market intelligence platform.",
    images: ["/twitter-image.png"],
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
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
