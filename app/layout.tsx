import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://furninest-pi.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "FurniNest — Modern Furniture for Every Home",
    template: "%s | FurniNest",
  },
  description:
    "Shop premium sofas, beds, tables and decor at FurniNest. Fast delivery, quality craftsmanship.",
  keywords: ["furniture", "sofa", "bed", "table", "home decor", "FurniNest"],
  authors: [{ name: "FurniNest" }],
  creator: "FurniNest",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "FurniNest",
    title: "FurniNest — Modern Furniture for Every Home",
    description:
      "Shop premium sofas, beds, tables and decor at FurniNest. Fast delivery, quality craftsmanship.",
  },
  twitter: {
    card: "summary_large_image",
    title: "FurniNest — Modern Furniture for Every Home",
    description:
      "Shop premium sofas, beds, tables and decor at FurniNest.",
    creator: "@FurniNest",
  },
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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
          <AuthProvider>
            {children}
            <Toaster position="top-center" richColors closeButton />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
