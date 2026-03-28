import type { Metadata } from "next";
import { IBM_Plex_Sans_KR, Space_Mono } from "next/font/google";
import "./globals.css";

const bodyFont = IBM_Plex_Sans_KR({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const displayFont = Space_Mono({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "링크드인 이니셜라이저 | LinkedIn Initializr",
  description:
    "짧고 평범한 경험을 밈톤, 링크드인톤, 이력서톤으로 재구성해주는 AI 커리어 부스터.",
  openGraph: {
    title: "링크드인 이니셜라이저 | LinkedIn Initializr",
    description:
      "짧고 평범한 경험을 밈톤, 링크드인톤, 이력서톤으로 재구성해주는 AI 커리어 부스터.",
    url: "https://linkedin-initializr.vercel.app",
    siteName: "LinkedIn Initializr",
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "링크드인 이니셜라이저 | LinkedIn Initializr",
    description:
      "짧고 평범한 경험을 밈톤, 링크드인톤, 이력서톤으로 재구성해주는 AI 커리어 부스터.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${bodyFont.variable} ${displayFont.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
