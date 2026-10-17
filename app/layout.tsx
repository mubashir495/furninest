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

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://luxafurniture.co.uk";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "LUXA FURNITURE — Premium Furniture for Every UK Home",
    template: "%s | LUXA FURNITURE",
  },
  description:
    "Shop premium sofas, chairs, tables and furniture sets at LUXA FURNITURE. Quality craftsmanship, UK delivery.",
  keywords: ["LUXA FURNITURE", "UK furniture", "luxury sofas UK", "furniture", "sofa", "bed", "table", "home decor"],
  authors: [{ name: "LUXA FURNITURE" }],
  creator: "LUXA FURNITURE",
  openGraph: {
    type: "website",
    locale: "en_GB",
    url: "/",
    siteName: "LUXA FURNITURE",
    title: "LUXA FURNITURE — Premium Furniture for Every UK Home",
    description:
      "Shop premium sofas, chairs, tables and furniture sets at LUXA FURNITURE. Quality craftsmanship, UK delivery.",
  },
  twitter: {
    card: "summary_large_image",
    title: "LUXA FURNITURE — Premium Furniture for Every UK Home",
    description:
      "Shop premium sofas, chairs, tables and furniture sets at LUXA FURNITURE.",
    creator: "@LuxaFurniture",
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
