import type { Metadata } from "next";
import { Geist, Geist_Mono, Playfair_Display } from "next/font/google";
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

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://luxafurniture.co.uk";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "LUXA FURNITURE | Luxury Beds, Sofas & Dining Furniture UK",
    template: "%s | LUXA FURNITURE",
  },
  description:
    "Discover premium beds, stylish sofas and elegant dining furniture at LUXA FURNITURE. Explore beautiful furniture collections for your home across the UK.",
  keywords: [
    "LUXA FURNITURE",
    "luxury beds UK",
    "premium sofas UK",
    "dining tables and chairs",
    "luxury bedroom furniture",
    "modern living room furniture",
    "sofa beds UK",
    "luxury furniture store UK",
    "British furniture",
  ],
  authors: [{ name: "LUXA FURNITURE" }],
  creator: "LUXA FURNITURE",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
  openGraph: {
    type: "website",
    locale: "en_GB",
    url: "/",
    siteName: "LUXA FURNITURE",
    title: "LUXA FURNITURE | Luxury Beds, Sofas & Dining Furniture UK",
    description:
      "Discover premium beds, stylish sofas and elegant dining furniture at LUXA FURNITURE. Explore beautiful furniture collections for your home across the UK.",
  },
  twitter: {
    card: "summary_large_image",
    title: "LUXA FURNITURE | Luxury Beds, Sofas & Dining Furniture UK",
    description:
      "Discover premium beds, stylish sofas and elegant dining furniture at LUXA FURNITURE. Explore beautiful furniture collections for your home across the UK.",
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
      lang="en-GB"
      className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
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
