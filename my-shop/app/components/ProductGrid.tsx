'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Star } from 'lucide-react'
import { Badge } from "@/components/ui/badge"

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
  image_url: string
  category: string
  rating: number
  review_count: number
  is_featured?: boolean
}

interface ProductGridProps {
  products: Product[]
}

export default function ProductGrid({ products }: ProductGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
      {products.map((product) => (
        <Link
          href={`/product/${product.id}`}
          key={product.id}
          className="group block"
          aria-label={`View ${product.title} details`}
        >
          <article className="h-full flex flex-col bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-emerald-200">
            {/* Product Image */}
            <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
              <Image
                src={product.image_url && product.image_url.startsWith('http') ? product.image_url : '/placeholder-product.svg'}
                alt={product.title}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                priority={product.is_featured}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/placeholder-product.svg';
                }}
              />

              {/* Badges */}
              <div className="absolute top-4 left-4">
                <Badge className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 border-0 shadow-lg">
                  Free Delivery
                </Badge>
              </div>

              {product.is_featured && (
                <div className="absolute top-4 right-4">
                  <Badge className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 border-0 shadow-lg">
                    Featured
                  </Badge>
                </div>
              )}
            </div>

            {/* Product Content */}
            <div className="flex-1 p-6 flex flex-col">
              <div className="mb-2">
                <span className="text-sm font-medium text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                  {product.category}
                </span>
              </div>

              <h3 className="font-semibold text-gray-900 text-lg mb-2 line-clamp-2 group-hover:text-emerald-700 transition-colors">
                {product.title}
              </h3>

              {/* Rating */}
              <div className="flex items-center mb-4">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(product.rating)
                          ? "text-amber-500 fill-amber-500"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <span className="ml-2 text-sm text-gray-600">
                  ({product.review_count})
                </span>
              </div>

              {/* Price */}
              <div className="mt-auto">
                <div className="flex items-baseline justify-between">
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatPKR(product.price)}
                    </p>
                    {product.price < 10000 && (
                      <p className="text-sm text-gray-500 line-through">
                        {formatPKR(product.price * 1.3)}
                      </p>
                    )}
                  </div>
                  <div className="px-4 py-2 bg-gradient-to-r from-gray-900 to-black text-white rounded-full text-sm font-semibold group-hover:from-emerald-600 group-hover:to-green-700 transition-all duration-300 transform group-hover:scale-105">
                    View Details
                  </div>
                </div>
              </div>
            </div>
          </article>
        </Link>
      ))}
    </div>
  )
}
