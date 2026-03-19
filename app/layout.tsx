import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Observe — Africoders",
  description: "Self-hosted observability: errors, logs, metrics and alerts",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-gray-950 text-gray-100 antialiased">{children}</body>
    </html>
  );
}
