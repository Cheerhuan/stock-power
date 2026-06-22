import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://cheerhuan.github.io/stock-power"),
  title: "Stock Power AI — AI 投資決策平台",
  description: "專為台灣投資人打造的 AI 投資決策平台。AI 驅動的台股分析、即時市場追蹤、法人動向與投資機會發掘。",
  openGraph: {
    title: "Stock Power AI — AI 投資決策平台",
    description: "專為台灣投資人打造的 AI 投資決策平台。AI 驅動的台股分析、即時市場追蹤與投資機會發掘。",
    type: "website",
    siteName: "Stock Power AI",
    locale: "zh_TW",
    images: [{ url: "/stock-power/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Stock Power AI — AI 投資決策平台",
    description: "專為台灣投資人打造的 AI 投資決策平台",
  },
  robots: "index, follow",
  other: {
    "application/ld+json": JSON.stringify({
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: "Stock Power AI",
      applicationCategory: "FinanceApplication",
      operatingSystem: "Web",
      description: "AI 驅動的台股投資決策平台",
    }),
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-TW" className="dark">
      <head>
        <link rel="sitemap" type="application/xml" href="/stock-power/sitemap.xml" />
      </head>
      <body className="bg-[#080B11] text-[#E8E8ED] antialiased">{children}</body>
    </html>
  );
}
