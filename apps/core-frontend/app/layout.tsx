import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Toaster } from "sonner";
import "./globals.css";
import Providers from "./providers";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "TrustMed - Secure Healthcare Records Management",
  description:
    "Decentralized health records powered by blockchain. Share your medical history securely with healthcare providers while maintaining complete control.",
  generator: "v0.app",
  icons: {
    icon: "/logo-white.png",
    shortcut: "/logo-white.png",
    apple: "/logo-white.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>
            {children}
            <Toaster
              richColors
              position="top-right"
              toastOptions={{ className: "text-sm sm:text-base" }}
            />
            <Analytics />
            <SpeedInsights />
          </Providers>
      </body>
    </html>
  );
}
