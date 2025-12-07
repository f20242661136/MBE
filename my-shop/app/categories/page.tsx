import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight, Smartphone, Laptop, Tablet, Headphones, Gamepad2, Watch, Camera, Zap, Home, Tv, MoreHorizontal } from 'lucide-react'

// Force dynamic rendering to avoid build-time Supabase calls
export const dynamic = 'force-dynamic'

const CATEGORIES = [
  {
    name: 'Smartphones',
    slug: 'smartphones',
    icon: Smartphone,
    description: 'Latest mobile phones and accessories',
    color: 'from-blue-500 to-cyan-600'
  },
  {
    name: 'Laptops',
    slug: 'laptops',
    icon: Laptop,
    description: 'Powerful laptops for work and gaming',
    color: 'from-purple-500 to-pink-600'
  },
  {
    name: 'Tablets',
    slug: 'tablets',
    icon: Tablet,
    description: 'iPads, Android tablets and e-readers',
    color: 'from-green-500 to-emerald-600'
  },
  {
    name: 'Headphones',
    slug: 'headphones',
    icon: Headphones,
    description: 'Wireless and wired audio solutions',
    color: 'from-red-500 to-pink-600'
  },
  {
    name: 'Gaming',
    slug: 'gaming',
    icon: Gamepad2,
    description: 'Consoles, games and gaming accessories',
    color: 'from-indigo-500 to-purple-600'
  },
  {
    name: 'Wearables',
    slug: 'wearables',
    icon: Watch,
    description: 'Smartwatches and fitness trackers',
    color: 'from-orange-500 to-red-600'
  },
  {
    name: 'Clothing & Shoes',
    slug: 'clothing-shoes',
    icon: MoreHorizontal,
    description: 'Fashion, apparel and footwear',
    color: 'from-pink-500 to-rose-600'
  },
  {
    name: 'Home & Kitchen',
    slug: 'home-kitchen',
    icon: Home,
    description: 'Kitchen appliances and home essentials',
    color: 'from-yellow-500 to-orange-600'
  },
  {
    name: 'Books',
    slug: 'books',
    icon: MoreHorizontal,
    description: 'Books, novels and educational materials',
    color: 'from-amber-500 to-yellow-600'
  },
  {
    name: 'Sports & Outdoors',
    slug: 'sports-outdoors',
    icon: MoreHorizontal,
    description: 'Sports equipment and outdoor gear',
    color: 'from-lime-500 to-green-600'
  },
  {
    name: 'Beauty & Personal Care',
    slug: 'beauty-personal-care',
    icon: MoreHorizontal,
    description: 'Skincare, cosmetics and personal care',
    color: 'from-fuchsia-500 to-pink-600'
  },
  {
    name: 'Toys & Games',
    slug: 'toys-games',
    icon: MoreHorizontal,
    description: 'Toys, games and entertainment',
    color: 'from-violet-500 to-purple-600'
  },
  {
    name: 'Furniture',
    slug: 'furniture',
    icon: MoreHorizontal,
    description: 'Home and office furniture',
    color: 'from-stone-500 to-gray-600'
  },
  {
    name: 'Automotive',
    slug: 'automotive',
    icon: MoreHorizontal,
    description: 'Car accessories and automotive products',
    color: 'from-slate-500 to-gray-600'
  }
]

export default async function CategoriesPage() {
  // Get product counts for each category
  const categoryCounts: Record<string, number> = {}

  for (const category of CATEGORIES) {
    const { count } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('category', category.name)
      .eq('is_active', true)

    categoryCounts[category.name] = count || 0
  }

  // Get featured products for each category
  const featuredProducts: Record<string, any[]> = {}

  for (const category of CATEGORIES.slice(0, 6)) { // Only get featured for first 6 categories
    const { data } = await supabase
      .from('products')
      .select('id, title, image_urls, price')
      .eq('category', category.name)
      .eq('is_active', true)
      .eq('is_featured', true)
      .limit(3)

    featuredProducts[category.name] = data || []
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Shop by <span className="bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">Category</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
              Discover our curated collection of premium products across all categories.
              Find exactly what you're looking for with our easy-to-browse categories.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                Free Delivery
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                7-Day Warranty
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                Cash on Delivery
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Browse Categories</h2>
            <p className="text-gray-600 text-lg">Explore products by category</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {CATEGORIES.map((category) => {
              const IconComponent = category.icon
              const productCount = categoryCounts[category.name] || 0

              return (
                <Link
                  key={category.name}
                  href={`/categories/${category.slug}`}
                  className="group block"
                >
                  <Card className="h-full hover:shadow-xl transition-all duration-300 border-0 shadow-lg hover:-translate-y-1">
                    <CardHeader className="text-center pb-4">
                      <div className={`w-16 h-16 bg-gradient-to-br ${category.color} rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                        <IconComponent className="w-8 h-8 text-white" />
                      </div>
                      <CardTitle className="text-xl group-hover:text-emerald-700 transition-colors">
                        {category.name}
                      </CardTitle>
                      <CardDescription className="text-sm">
                        {category.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                          {productCount} products
                        </Badge>
                        <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* Featured Products by Category */}
      {Object.keys(featuredProducts).length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Products</h2>
              <p className="text-gray-600 text-lg">Handpicked products from each category</p>
            </div>

            <div className="space-y-12">
              {CATEGORIES.slice(0, 6).map((category) => {
                const products = featuredProducts[category.name] || []
                if (products.length === 0) return null

                const IconComponent = category.icon

                return (
                  <div key={category.name} className="bg-white rounded-3xl p-8 shadow-lg">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 bg-gradient-to-br ${category.color} rounded-xl flex items-center justify-center`}>
                          <IconComponent className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-gray-900">{category.name}</h3>
                          <p className="text-gray-600">{category.description}</p>
                        </div>
                      </div>
                      <Link href={`/categories/${category.slug}`}>
                        <Button variant="outline" className="hover:bg-emerald-50 hover:border-emerald-200">
                          View All
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {products.map((product) => (
                        <Link
                          key={product.id}
                          href={`/product/${product.id}`}
                          className="group block"
                        >
                          <div className="bg-gray-50 rounded-2xl p-4 hover:shadow-lg transition-all duration-300">
                            <div className="aspect-square relative overflow-hidden rounded-xl mb-4 bg-white">
                              <img
                                src={product.image_urls?.[0] || '/placeholder-product.svg'}
                                alt={product.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            </div>
                            <h4 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-emerald-700 transition-colors">
                              {product.title}
                            </h4>
                            <p className="text-lg font-bold text-emerald-600">
                              Rs. {product.price.toLocaleString()}
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-emerald-600 to-green-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Can't Find What You're Looking For?
          </h2>
          <p className="text-emerald-100 text-lg mb-8 max-w-2xl mx-auto">
            Browse all our products or contact our support team for personalized recommendations.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/products">
              <Button size="lg" variant="secondary" className="bg-white text-emerald-700 hover:bg-gray-50">
                Browse All Products
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-emerald-700">
                Contact Support
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
