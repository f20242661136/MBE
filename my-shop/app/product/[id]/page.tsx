// app/product/[id]/page.tsx
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import Script from 'next/script'
import { supabase } from '@/lib/supabase'
import ProductClient from './ProductClient'
import ProductSkeleton from '@/components/ProductSkeleton'
import { Product } from '@/lib/types'

const formatPKR = (amount: number) => 
  new Intl.NumberFormat('en-PK', { 
    style: 'currency', 
    currency: 'PKR', 
    maximumFractionDigits: 0 
  }).format(amount)



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
      canonical: `https://molvibusiness.shop/product/${product.id}`,
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

  return product as Product | null
}

export default async function ProductPage({ params }: { params: { id: string } }) {
  const resolvedParams = await params;
  const product = await getProduct(resolvedParams.id)

  if (!product) {
    notFound()
  }

  const schema = {
    "@context": "https://schema.org/",
    "@type": "Product",
    name: product.title,
    image: product.image_urls, // array is OK
    description: product.description ?? `${product.title} available in Pakistan.`,
    sku: String(product.id),
    category: product.category,
    brand: {
      "@type": "Brand",
      name: "Molvi Business",
    },
    offers: {
      "@type": "Offer",
      url: `https://molvibusiness.shop/product/${product.id}`,
      priceCurrency: "PKR",
      price: product.price,
      availability:
        product.stock_quantity > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
    },
  };

  return (
    <>
      <Script
        id="product-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <Suspense fallback={<ProductSkeleton />}>
        <ProductClient product={product} />
      </Suspense>
    </>
  )
}