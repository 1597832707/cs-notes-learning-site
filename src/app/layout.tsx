import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { ProgressProvider } from "@/components/progress-provider";
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
  title: "CS-Notes Learning",
  description: "A daily learning site powered by local CS-Notes content.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
      <body>
        <ProgressProvider>
          <header className="border-b border-slate-200 bg-white/80 backdrop-blur">
            <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
              <Link className="text-lg font-bold text-slate-950" href="/">
                CS-Notes Learning
              </Link>
              <div className="flex gap-4 text-sm font-medium text-slate-600">
                <Link className="hover:text-cyan-700" href="/daily">
                  每日学习
                </Link>
                <Link className="hover:text-cyan-700" href="/notes">
                  课程目录
                </Link>
              </div>
            </nav>
          </header>
          {children}
        </ProgressProvider>
      </body>
    </html>
  );
}
