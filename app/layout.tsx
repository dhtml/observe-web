import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@shared/ui/Navbar";
import { Footer } from "@shared/ui/Footer";
import { ThemeProvider } from "@shared/ui/ThemeProvider";
import { Chatbot } from "@shared/ui/Chatbot";
import { GoogleAnalytics } from "@shared/ui/GoogleAnalytics";
import { AuthProvider } from "@shared/hooks/useAuth";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: { default: "Observe — Africoders", template: "%s | Africoders Observe" },
  description: "Self-hosted observability: errors, logs, metrics and alerts",
  metadataBase: new URL("https://observe.africoders.com"),
  icons: { icon: "/favicon.svg" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

const navLinks = [
  { href: "/projects", label: "Projects" },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased bg-gray-950 text-gray-100`} suppressHydrationWarning>
        <GoogleAnalytics module="observe" />
        <AuthProvider>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
            <Navbar appName="Observe" links={navLinks} accent="cyan" />
            <main className="min-h-screen">{children}</main>
            <Footer />
          </ThemeProvider>
          <Chatbot />
        </AuthProvider>
      </body>
    </html>
  );
}
