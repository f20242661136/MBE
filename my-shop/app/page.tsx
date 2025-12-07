// app/page.tsx
import HomeClient from '@/components/HomeClient'

export default function Home() {
  return <HomeClient />
}
export const metadata = {
  title: "Molvi Business — Trusted E-Shop in Pakistan | Premium Products & COD",
  description:
    "Shop premium products across Pakistan — cash on delivery, free delivery, and a 7-day checking warranty.",
  keywords: [
    "Molvi Business",
    "Online Shopping Pakistan",
    "Pakistan E-Commerce",
    "Cash on Delivery Pakistan",
  ],
  openGraph: {
    title: "Molvi Business — Best Online Store in Pakistan",
    description:
      "Premium products, Pakistan-wide delivery, COD available.",
    url: "https://molvibusiness.shop",
    siteName: "Molvi Business",
    locale: "en_PK",
    type: "website",
  },
};
