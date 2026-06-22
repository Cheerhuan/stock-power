import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://cheerhuan.github.io/stock-power"),
  title: "Stock Power AI",
  description: "AI 投資決策平台 — 搜尋即分析",
  robots: "index, follow",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-TW" className="dark">
      <body className="antialiased">{children}</body>
    </html>
  );
}
