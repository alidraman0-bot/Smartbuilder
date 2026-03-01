import type { Metadata } from "next";
// import { Geist, Geist_Mono } from "next/font/google"; // Using Google Fonts via globals.css
import "./globals.css";
import DashboardWrapper from "@/components/DashboardWrapper";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  title: "Smartbuilder | Autonomous Startup Generation",
  description: "Generate, build, and deploy startups autonomously using FSM-driven orchestration and multi-provider AI.",
  keywords: ["startup generation", "autonomous building", "AI orchestration", "FSM", "MVP builder"],
  authors: [{ name: "Smartbuilder Team" }],
  openGraph: {
    title: "Smartbuilder | Autonomous Startup Generation",
    description: "The primary dashboard for autonomous startup building.",
    url: "https://smartbuilder.ai",
    siteName: "Smartbuilder",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Smartbuilder Dashboard Preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Smartbuilder | Autonomous Startup Generation",
    description: "The primary dashboard for autonomous startup building.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

import Script from "next/script";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased bg-black selection:bg-indigo-500/30">
        <Script src="https://js.paystack.co/v1/inline.js" strategy="lazyOnload" />
        <DashboardWrapper>
          {children}
        </DashboardWrapper>
      </body>
    </html>
  );
}
