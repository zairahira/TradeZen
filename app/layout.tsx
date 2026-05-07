import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import AddTradeButton from "@/components/AddTradeButton";
import Providers from "@/components/Providers";
import ThemeToggle from "@/components/ThemeToggle";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TradeZen",
  description: "TradeZen - track emotions, performance, and edge",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col bg-canvas text-ink">
        <Providers>
          <nav className="border-b border-line bg-card px-6 py-3 flex items-center gap-6 text-sm shrink-0">
            <span className="font-semibold text-ink tracking-tight mr-2">TradeZen</span>
            <Link href="/" className="text-ink-2 hover:text-ink transition-colors">
              Dashboard
            </Link>
            <Link href="/trades" className="text-ink-2 hover:text-ink transition-colors">
              Trades
            </Link>
            <Link href="/settings" className="text-ink-2 hover:text-ink transition-colors">
              Settings
            </Link>
            <AddTradeButton />
            <ThemeToggle />
          </nav>
          <main className="flex-1 px-6 py-6 max-w-7xl mx-auto w-full">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
