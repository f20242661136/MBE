// app/page.tsx
'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import Image from 'next/image'
import { 
  Star, 
  Truck, 
  Shield, 
  CheckCircle, 
  ArrowRight,
  Sparkles 
} from 'lucide-react'
import { Skeleton } from "@/components/ui/skeleton"
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

export default function Home() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProducts()
  }, [])

  async function fetchProducts() {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('id', { ascending: false })
        .limit(12)
      
      if (error) throw error
      setProducts(data || [])
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const features = [
    { icon: Truck, title: "Free Delivery", desc: "Across Pakistan" },
    { icon: Shield, title: "7-Day Warranty", desc: "Check before paying" },
    { icon: CheckCircle, title: "100% Authentic", desc: "Original products" },
    { icon: Sparkles, title: "Premium Quality", desc: "Best in market" },
  ]

  return (
    <>
      {/* Hero Section with SEO-friendly content */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-10" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="text-center">
            <Badge className="mb-6 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 border-0">
              <Sparkles className="w-4 h-4 mr-2" />
              #1 Trusted E-Shop in Pakistan
            </Badge>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
              Premium Products,{" "}
              <span className="bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
                Pakistani Prices
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto mb-8 leading-relaxed">
              Discover the best trending items with <strong>cash on delivery</strong>,{" "}
              <strong>7-day checking warranty</strong>, and <strong>free nationwide delivery</strong>.
              Shop with confidence across Pakistan.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="#products" 
                className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold bg-gradient-to-r from-green-500 to-emerald-600 rounded-full hover:from-green-600 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                Start Shopping
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <Link 
                href="/categories" 
                className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold bg-white/10 backdrop-blur-sm rounded-full hover:bg-white/20 transition-all duration-300 border border-white/20"
              >
                Browse Categories
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Features */}
      <section className="py-12 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="group p-6 bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-green-200"
              >
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl group-hover:scale-110 transition-transform duration-300">
                    <feature.icon className="w-8 h-8 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">{feature.title}</h3>
                    <p className="text-gray-600 text-sm">{feature.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section id="products" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Latest Arrivals
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Explore our collection of premium products, carefully selected for quality and value
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="space-y-4">
                  <Skeleton className="h-64 w-full rounded-2xl" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          ) : (
            <>
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
                            target.src = '/placeholder-product.jpg';
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

              {products.length === 0 && (
                <div className="text-center py-12">
                  <div className="mx-auto w-24 h-24 mb-4 text-gray-300">
                    <Sparkles className="w-full h-full" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">
                    No products available
                  </h3>
                  <p className="text-gray-500">
                    Check back soon for new arrivals!
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-emerald-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Ready to Shop with Confidence?
          </h2>
          <p className="text-gray-600 text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied customers across Pakistan who trust us for premium products and exceptional service.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/products"
              className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold bg-gradient-to-r from-gray-900 to-black text-white rounded-full hover:from-emerald-700 hover:to-green-800 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Browse All Products
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold bg-white text-gray-900 rounded-full hover:bg-gray-50 transition-all duration-300 shadow-lg hover:shadow-xl border border-gray-200"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}