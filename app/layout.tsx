import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Navbar } from "@shared/ui/Navbar";
import { Footer } from "@shared/ui/Footer";
import { ThemeProvider } from "@shared/ui/ThemeProvider";
import { Chatbot } from "@shared/ui/Chatbot";
import { GoogleAnalytics } from "@shared/ui/GoogleAnalytics";
import { AuthProvider } from "@shared/hooks/useAuth";
import { ServiceWorkerRegistrar } from "./sw-register";
import { getUrl } from "@shared/utils/domains";

const siteUrl = "https://observe.africoders.com";

export const metadata: Metadata = {
  title: { default: "Observe — Open-Source Error Tracking & Performance Monitoring", template: "%s | Africoders Observe" },
  description:
    "Open-source error tracking, performance monitoring, and logging for your applications. Capture errors, trace transactions, visualise metrics, and get real-time alerts. A self-hosted Sentry alternative by Africoders.",
  metadataBase: new URL(siteUrl),
  applicationName: "Africoders Observe",
  keywords: [
    "error tracking",
    "performance monitoring",
    "observability",
    "logging",
    "APM",
    "sentry alternative",
    "open source",
    "africoders",
    "stack traces",
    "transaction tracing",
    "real-time alerts",
  ],
  authors: [{ name: "Africoders", url: "https://africoders.com" }],
  creator: "Africoders",
  publisher: "Africoders",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.json",
  openGraph: {
    type: "website",
    siteName: "Africoders Observe",
    title: "Observe — Open-Source Error Tracking & Performance Monitoring",
    description:
      "Capture errors with full stack traces, trace transactions end-to-end, monitor performance, and get real-time alerts. Self-hosted and open-source.",
    url: siteUrl,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Observe — Open-Source Error Tracking & Performance Monitoring",
    description:
      "Capture errors with full stack traces, trace transactions end-to-end, monitor performance, and get real-time alerts.",
    creator: "@africoders",
  },
  robots: { index: true, follow: true },
  alternates: { canonical: siteUrl },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#22c55e",
};

const navLinks = [
  { href: "/", label: "Projects" },
  { href: `${getUrl("portal")}/docs`, label: "Docs" },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased bg-gray-950 text-gray-100" suppressHydrationWarning>
        <GoogleAnalytics module="observe" />
        <AuthProvider>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
            <Navbar
              appName="Observe"
              links={navLinks}
              loginHref={`${getUrl("identity")}/login?redirect_url=${getUrl("observe")}`}
            />
            <main className="min-h-screen">{children}</main>
            <Footer />
          </ThemeProvider>
          <Chatbot />
        </AuthProvider>
        <ServiceWorkerRegistrar />
      </body>
    </html>
  );
}
