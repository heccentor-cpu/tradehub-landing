import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TradeHub Consulting",
  description: "Customs excellence and foreign-trade consulting.",
  metadataBase: new URL("https://tradehubconsulting.com"),
  openGraph: {
    title: "TradeHub Consulting",
    description: "Customs excellence and foreign-trade consulting.",
    url: "https://tradehubconsulting.com",
    siteName: "TradeHub Consulting",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "TradeHub Consulting" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TradeHub Consulting",
    description: "Customs excellence and foreign-trade consulting.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
