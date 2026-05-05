import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
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
  title: "Trading Journal",
  description: "Day trading journal - track emotions, performance, and edge",
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
      <body className="min-h-full flex flex-col bg-[#0a0a0a] text-[#e5e5e5]">
        <nav className="border-b border-[#222] bg-[#111] px-6 py-3 flex items-center gap-6 text-sm shrink-0">
          <span className="font-semibold text-white tracking-tight mr-2">TJ</span>
          <Link href="/" className="text-[#aaa] hover:text-white transition-colors">
            Dashboard
          </Link>
          <Link href="/trades" className="text-[#aaa] hover:text-white transition-colors">
            Trades
          </Link>
          <Link
            href="/trades/new"
            className="ml-auto bg-[#2563eb] hover:bg-[#1d4ed8] text-white px-3 py-1.5 rounded text-xs font-medium transition-colors"
          >
            + Add Trade
          </Link>
          <Link href="/models" className="text-[#aaa] hover:text-white transition-colors">
            Models
          </Link>
          <Link href="/instruments" className="text-[#aaa] hover:text-white transition-colors">
            Instruments
          </Link>
        </nav>
        <main className="flex-1 px-6 py-6 max-w-7xl mx-auto w-full">{children}</main>
      </body>
    </html>
  );
}
