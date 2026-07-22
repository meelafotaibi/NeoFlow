import type { Metadata, Viewport } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

const siteUrl = "https://neoflow-4df47.web.app";
const siteTitle = "NeoFlow - Personal Productivity & Financial Dashboard";
const siteDescription =
  "NeoFlow is an open-source, ultra-fast personal life operating system and executive productivity dashboard with C++ calculation engine, habit tracking, financial forecasting, and AI co-pilot strategy.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteTitle,
    template: "%s | NeoFlow Dashboard",
  },
  description: siteDescription,
  applicationName: "NeoFlow",
  authors: [{ name: "Meelaf Otaibi", url: "https://github.com/meelafotaibi" }],
  generator: "Next.js",
  keywords: [
    "NeoFlow",
    "Personal Dashboard",
    "Productivity Dashboard",
    "C++ Analytics Engine",
    "Financial Goals Tracker",
    "Savings Simulator",
    "Habit Tracker",
    "Task Priority Engine",
    "Life Operating System",
    "Next.js Productivity App",
    "Firebase Dashboard",
    "Open Source Dashboard",
  ],
  creator: "Meelaf Otaibi",
  publisher: "NeoFlow",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "J6CDVGqvcyKHbjyS0hYffxNkvoQm8Jop19pjygbvwUM",
  },
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    title: siteTitle,
    description: siteDescription,
    siteName: "NeoFlow",
    images: [
      {
        url: `${siteUrl}/icon.png?v=2`,
        width: 800,
        height: 800,
        alt: "NeoFlow Personal Productivity Dashboard Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
    images: [`${siteUrl}/icon.png?v=2`],
    creator: "@meelafotaibi",
  },
  icons: {
    icon: [
      { url: "/icon.png?v=2", type: "image/png" },
      { url: "/favicon.ico?v=2", type: "image/x-icon" },
      { url: "/icon-dark-32x32.png?v=2", media: "(prefers-color-scheme: dark)" },
      { url: "/icon-light-32x32.png?v=2", media: "(prefers-color-scheme: light)" },
    ],
    shortcut: "/favicon.ico?v=2",
    apple: "/apple-icon.png?v=2",
  },
};

export const viewport: Viewport = {
  themeColor: "#0B1220",
  width: "device-width",
  initialScale: 1,
};

const jsonLdData = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "NeoFlow",
  url: siteUrl,
  description: siteDescription,
  applicationCategory: "ProductivityApplication",
  operatingSystem: "All",
  author: {
    "@type": "Person",
    name: "Meelaf Otaibi",
    url: "https://github.com/meelafotaibi",
  },
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <meta name="google-site-verification" content="J6CDVGqvcyKHbjyS0hYffxNkvoQm8Jop19pjygbvwUM" />
        <link rel="icon" type="image/png" href="/icon.png?v=2" />
        <link rel="shortcut icon" href="/favicon.ico?v=2" />
        <link rel="apple-touch-icon" href="/apple-icon.png?v=2" />

        {/* Performance Preconnects for Lighthouse Optimization */}
        <link rel="preconnect" href="https://neoflow-4df47.firebaseapp.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://identitytoolkit.googleapis.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://securetoken.googleapis.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://neoflow-4df47.firebaseapp.com" />
        <link rel="dns-prefetch" href="https://identitytoolkit.googleapis.com" />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdData) }}
        />
      </head>
      <body
        className={`${inter.variable} ${geistMono.variable} font-sans antialiased bg-background`}
      >
        {children}
        {process.env.NODE_ENV === "production" && <Analytics />}
      </body>
    </html>
  );
}
