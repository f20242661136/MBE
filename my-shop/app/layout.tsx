// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import { GoogleAnalytics } from "@next/third-parties/google";
import { Toaster } from "sonner";
import ErrorBoundary from "@/components/ErrorBoundary";



export const metadata: Metadata = {
  title: {
    default: "E-Shop Pakistan | Premium Products at Local Prices",
    template: "%s | E-Shop Pakistan",
  },
  description: "Shop trending products in Pakistan with cash on delivery, 7-day warranty, and free delivery nationwide.",
  keywords: ["e-commerce Pakistan", "online shopping", "cash on delivery", "free delivery", "Pakistan shopping"],
  authors: [{ name: "E-Shop Pakistan" }],
  creator: "E-Shop Pakistan",
  publisher: "E-Shop Pakistan",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://eshop-pk.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://eshop-pk.com",
    title: "E-Shop Pakistan | Premium Products at Local Prices",
    description: "Shop trending products in Pakistan with cash on delivery, 7-day warranty, and free delivery nationwide.",
    siteName: "E-Shop Pakistan",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "E-Shop Pakistan",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "E-Shop Pakistan | Premium Products at Local Prices",
    description: "Shop trending products in Pakistan with cash on delivery, 7-day warranty, and free delivery nationwide.",
    images: ["/twitter-image.png"],
    creator: "@eshop_pk",
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
    google: "google-site-verification-code",
    yandex: "yandex-verification-code",
    yahoo: "yahoo-verification-code",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta name="theme-color" content="#000000" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="canonical" href="https://eshop-pk.com" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "E-Shop Pakistan",
              "url": "https://eshop-pk.com",
              "logo": "https://eshop-pk.com/logo.png",
              "description": "Premium online shopping platform in Pakistan",
              "contactPoint": {
                "@type": "ContactPoint",
                "telephone": "+92-300-0000000",
                "contactType": "Customer Service",
                "areaServed": "PK",
                "availableLanguage": ["English", "Urdu"],
              },
              "sameAs": [
                "https://facebook.com/eshop-pk",
                "https://instagram.com/eshop-pk",
                "https://twitter.com/eshop_pk",
              ],
            }),
          }}
        />
      </head>
      <body className="font-sans antialiased">
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
        <Toaster />
        <GoogleAnalytics gaId="GA-XXXXXX-X" />
      </body>
    </html>
  );
}  