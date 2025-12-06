// app/product/[id]/page.tsx
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import ProductClient from './ProductClient'

const formatPKR = (amount: number) => 
  new Intl.NumberFormat('en-PK', { 
    style: 'currency', 
    currency: 'PKR', 
    maximumFractionDigits: 0 
  }).format(amount)

interface Product {
  id: number
  title: string
  price: number
  image_urls: string[]
  description: string
  category: string
  rating: number
  review_count: number
  specifications: Record<string, any>
  stock_quantity: number
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const resolvedParams = await params;
  const { data: product } = await supabase
    .from('products')
    .select('*')
    .eq('id', resolvedParams.id)
    .single()

  if (!product) {
    return {
      title: 'Product Not Found',
      description: 'The requested product could not be found.',
    }
  }

  return {
    title: `${product.title} | ${formatPKR(product.price)} | E-Shop Pakistan`,
    description: product.description || `Buy ${product.title} online in Pakistan. Price: ${formatPKR(product.price)}. Cash on delivery, free shipping, 7-day warranty.`,
    keywords: [
      product.title,
      'buy online Pakistan',
      'cash on delivery',
      product.category,
      ...(product.title.toLowerCase().split(' ') || [])
    ],
    openGraph: {
      title: `${product.title} | E-Shop Pakistan`,
      description: product.description || `Best price for ${product.title} in Pakistan`,
      images: product.image_urls && product.image_urls.length > 0 ? [product.image_urls[0]] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${product.title} | E-Shop Pakistan`,
      description: product.description || `Get ${product.title} at best price in Pakistan`,
      images: product.image_urls && product.image_urls.length > 0 ? [product.image_urls[0]] : [],
    },
    alternates: {
      canonical: `/product/${product.id}`,
    },
  }
}

export async function generateStaticParams() {
  const { data: products } = await supabase
    .from('products')
    .select('id')
    .eq('is_active', true)

  return products?.map((product) => ({
    id: product.id.toString(),
  })) || []
}

async function getProduct(id: string): Promise<Product | null> {
  const { data: product } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .eq('is_active', true)
    .single()

  return product
}

export default async function ProductPage({ params }: { params: { id: string } }) {
  const resolvedParams = await params;
  const product = await getProduct(resolvedParams.id)

  if (!product) {
    notFound()
  }

  // Generate structured data for product
  const productStructuredData = {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name: product.title,
    image: product.image_urls && product.image_urls.length > 0 ? product.image_urls[0] : '',
    description: product.description,
    sku: `PROD-${product.id}`,
    brand: {
      '@type': 'Brand',
      name: 'E-Shop Pakistan',
    },
    offers: {
      '@type': 'Offer',
      url: `https://eshop-pk.com/product/${product.id}`,
      priceCurrency: 'PKR',
      price: product.price,
      priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      availability: product.stock_quantity > 0 
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      shippingDetails: {
        '@type': 'OfferShippingDetails',
        shippingRate: {
          '@type': 'MonetaryAmount',
          value: 0,
          currency: 'PKR',
        },
        shippingDestination: {
          '@type': 'DefinedRegion',
          addressCountry: 'PK',
        },
        deliveryTime: {
          '@type': 'ShippingDeliveryTime',
          handlingTime: {
            minValue: 1,
            maxValue: 2,
          },
          transitTime: {
            minValue: 3,
            maxValue: 7,
          },
        },
      },
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: product.rating,
      reviewCount: product.review_count,
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productStructuredData),
        }}
      />
      <ProductClient product={product} />
    </>
  )
}