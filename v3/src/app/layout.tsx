import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Rafli Ahmad Fachrezi // Fullstack Developer & QA Automation Engineer",
  description: "Portfolio of Rafli Ahmad Fachrezi — Fullstack Developer & QA Automation Engineer specializing in modern web/mobile platforms, Three.js 3D experiences, and end-to-end automation testing.",
  keywords: ["Fullstack Developer", "QA Automation", "Next.js", "Three.js", "GSAP", "React", "TypeScript", "Python", "Playwright"],
  authors: [{ name: "Rafli Ahmad Fachrezi" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased dark`}>
      <body className="min-h-full flex flex-col bg-[#0e0d14] text-[#f8fafc] selection:bg-primary-container selection:text-on-primary-container">
        {children}
      </body>
    </html>
  );
}
