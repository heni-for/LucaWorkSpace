import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { Analytics, SpeedInsights } from "@/lib/analytics";
import { initSentry } from "@/lib/analytics";
import { AuthProvider } from "@/contexts/auth-context";

// Initialize Sentry
initSentry();

export const metadata: Metadata = {
  title: "LUCA Platform - The Most Powerful AI Assistant for Tunisian Professionals",
  description: "The world's first AI-powered productivity platform designed specifically for Tunisian professionals, supporting 1M+ users with enterprise-grade features.",
  keywords: "AI, productivity, Tunisia, Derja, voice assistant, email management, task management, calendar, notes, collaboration",
  authors: [{ name: "LUCA Platform Team" }],
  creator: "LUCA Platform",
  publisher: "LUCA Platform",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  openGraph: {
    title: "LUCA Platform - AI Assistant for Tunisian Professionals",
    description: "The most powerful AI-powered productivity platform for Tunisian professionals",
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    siteName: "LUCA Platform",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "LUCA Platform - AI Assistant for Tunisian Professionals",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "LUCA Platform - AI Assistant for Tunisian Professionals",
    description: "The most powerful AI-powered productivity platform for Tunisian professionals",
    images: ["/og-image.png"],
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
  verification: {
    google: "your-google-verification-code",
  },
  other: {
    "permissions-policy": "camera=(self), microphone=(self), display-capture=(self)",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="permissions-policy" content="camera=(self), microphone=(self), display-capture=(self)" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased" suppressHydrationWarning>
        <AuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Toaster />
            <Analytics />
            <SpeedInsights />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
