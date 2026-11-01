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

const siteUrl = "https://luxafurniture.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Luxa Furniture | Luxury Beds, Sofas & Dining Furniture",
    template: "%s | Luxa Furniture",
  },
  description:
    "Discover premium handcrafted furniture at Luxa Furniture. Explore luxury dining tables, elegant sofas, bespoke beds, and contemporary home furniture collections.",
  keywords: [
    "Luxa Furniture",
    "luxury furniture",
    "dining tables",
    "sofas",
    "luxury beds",
    "home furniture",
    "modern furniture",
    "dining chairs",
  ],
  authors: [{ name: "Luxa Furniture" }],
  creator: "Luxa Furniture",
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: "Luxa Furniture",
    title: "Luxa Furniture | Luxury Beds, Sofas & Dining Furniture",
    description:
      "Discover premium handcrafted furniture at Luxa Furniture. Explore luxury dining tables, elegant sofas, bespoke beds, and contemporary home furniture collections.",
    locale: "en_PK",
    images: [
      {
        url: "/logo.png",
        width: 512,
        height: 512,
        alt: "Luxa Furniture Logo",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "Luxa Furniture | Luxury Beds, Sofas & Dining Furniture",
    description:
      "Discover premium handcrafted furniture at Luxa Furniture. Explore luxury dining tables, elegant sofas, bespoke beds, and contemporary home furniture collections.",
    images: ["/logo.png"],
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
