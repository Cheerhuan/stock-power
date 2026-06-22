import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Stock Power AI — Investment Intelligence Platform",
  description: "AI-Powered Investment Intelligence Platform. Analyze stocks, track markets, discover opportunities.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
