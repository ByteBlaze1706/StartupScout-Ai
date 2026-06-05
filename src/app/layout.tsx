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
  title: "StartupScout AI",
  description: "Validate startup ideas using AI-powered market research, competitor analysis, and strategic recommendations.",
  openGraph: {
    title: "StartupScout AI",
    description: "Validate startup ideas using AI-powered market research, competitor analysis, and strategic recommendations.",
    siteName: "StartupScout AI",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "StartupScout AI",
    description: "Validate startup ideas using AI-powered market research, competitor analysis, and strategic recommendations.",
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
