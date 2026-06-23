import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://stock-power-livid.vercel.app"),
  title: "Stock Power AI",
  description: "AI 投資決策平台 — 搜尋即分析",
  robots: "index, follow",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-TW" className="dark" style={{ overflowX: 'hidden' }}>
      <body className="antialiased">
        <div style={{ position: 'relative', zIndex: 2 }}>
          {children}
        </div>
      </body>
    </html>
  );
}
