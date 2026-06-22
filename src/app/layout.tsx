import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Stock Power - Taiwan Stock Analysis",
  description: "Conclusion-First Taiwan Stock Decision Support System",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-zinc-950 text-zinc-100">{children}</body>
    </html>
  );
}
