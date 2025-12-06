'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Star, ArrowRight } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { supabase } from '@/lib/supabase'

const formatPKR = (amount: number) =>
  new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    maximumFractionDigits: 0
  }).format(amount)

interface RelatedProduct {
  id: number
  title: string
  price: number
  image_urls: string[]
  rating: number
  review_count: number
  stock_quantity: number
}

interface RelatedProductsProps {
  currentProductId: number
  category: string
}

export default function RelatedProducts({ currentProductId, category }: RelatedProductsProps) {
  const router = useRouter()
  const [products, setProducts] = useState<RelatedProduct[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchRelatedProducts() {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('id, title, price, image_urls, rating, review_count, stock_quantity')
          .eq('category', category)
          .neq('id', currentProductId)
          .eq('is_active', true)
          .limit(4)

        if (error) throw error
        setProducts(data || [])
      } catch (error) {
        console.error('Error fetching related products:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchRelatedProducts()
  }, [currentProductId, category])

  if (loading) {
    return (
      <div className="mt-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">Related Products</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-4 border border-gray-200 animate-pulse">
              <div className="aspect-square bg-gray-200 rounded-xl mb-4"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (products.length === 0) {
    return null
  }

  return (
    <div className="mt-16">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Related Products</h2>
        <Button
          variant="outline"
          onClick={() => router.push(`/categories/${category.toLowerCase().replace(/\s+/g, '-')}`)}
          className="flex items-center"
        >
          View All
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <div
            key={product.id}
            onClick={() => router.push(`/product/${product.id}`)}
            className="bg-white rounded-2xl p-4 border border-gray-200 hover:border-emerald-300 hover:shadow-lg transition-all cursor-pointer group"
          >
            <div className="relative aspect-square mb-4 overflow-hidden rounded-xl bg-gradient-to-br from-gray-50 to-gray-100">
              <Image
                src={product.image_url && product.image_url.startsWith('http') ? product.image_url : '/placeholder-product.svg'}
                alt={product.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/placeholder-product.svg';
                }}
              />

              {/* Stock Status */}
              <div className="absolute top-2 left-2">
                <div className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  product.stock_quantity > 0
                    ? 'bg-emerald-500 text-white'
                    : 'bg-red-500 text-white'
                }`}>
                  {product.stock_quantity > 0 ? 'In Stock' : 'Out of Stock'}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-emerald-600 transition-colors">
                {product.title}
              </h3>

              <div className="flex items-center space-x-2">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3 h-3 ${
                        i < Math.floor(product.rating)
                          ? "text-amber-500 fill-amber-500"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs text-gray-500">
                  ({product.review_count})
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-gray-900">
                  {formatPKR(product.price)}
                </span>
                <Button
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700"
                  onClick={(e) => {
                    e.stopPropagation()
                    router.push(`/product/${product.id}`)
                  }}
                >
                  View
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
