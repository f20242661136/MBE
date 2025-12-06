'use client'

import { useState, useEffect, useMemo } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Slider } from "@/components/ui/slider"
import {
  Search,
  Filter,
  Grid3X3,
  List,
  Star,
  Package,
  ChevronDown,
  X,
  SlidersHorizontal
} from 'lucide-react'

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
  category: string
  rating: number
  review_count: number
  stock_quantity: number
  is_featured?: boolean
  is_active: boolean
  created_at: string
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500000])
  const [sortBy, setSortBy] = useState<string>('newest')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showFilters, setShowFilters] = useState(false)
  const [categories, setCategories] = useState<string[]>([])

  useEffect(() => {
    fetchProducts()
    fetchCategories()
  }, [])

  async function fetchProducts() {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (error) throw error
      setProducts(data || [])
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  async function fetchCategories() {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('category')
        .not('category', 'is', null)

      if (error) throw error

      const uniqueCategories = [...new Set(data?.map(p => p.category) || [])]
      setCategories(uniqueCategories)
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const filteredAndSortedProducts = useMemo(() => {
    let filtered = products.filter(product => {
      const matchesSearch = product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          product.category.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory
      const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1]

      return matchesSearch && matchesCategory && matchesPrice
    })

    // Sort products
    const sorted = filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
        case 'oldest':
          return new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime()
        case 'price-low':
          return a.price - b.price
        case 'price-high':
          return b.price - a.price
        case 'rating':
          return b.rating - a.rating
        case 'name':
          return a.title.localeCompare(b.title)
        default:
          return 0
      }
    })

    return filtered
  }, [products, searchQuery, selectedCategory, priceRange, sortBy])

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedCategory('all')
    setPriceRange([0, 500000])
    setSortBy('newest')
  }

  const ProductCard = ({ product }: { product: Product }) => (
    <Link href={`/product/${product.id}`} className="group block">
      <Card className="h-full overflow-hidden hover:shadow-xl transition-all duration-300 border-0 shadow-lg hover:-translate-y-1">
        <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
          <Image
            src={product.image_urls && product.image_urls.length > 0 && product.image_urls[0].startsWith('http')
              ? product.image_urls[0]
              : '/placeholder-product.svg'}
            alt={product.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />

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

          {product.stock_quantity <= 5 && product.stock_quantity > 0 && (
            <div className="absolute bottom-4 left-4">
              <Badge variant="destructive" className="shadow-lg">
                Only {product.stock_quantity} left
              </Badge>
            </div>
          )}
        </div>

        <CardContent className="p-6">
          <div className="mb-2">
            <span className="text-sm font-medium text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
              {product.category}
            </span>
          </div>

          <h3 className="font-semibold text-gray-900 text-lg mb-2 line-clamp-2 group-hover:text-emerald-700 transition-colors">
            {product.title}
          </h3>

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

          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {formatPKR(product.price)}
              </p>
            </div>
            <Button size="sm" className="bg-gradient-to-r from-gray-900 to-black hover:from-emerald-600 hover:to-green-700">
              View Details
            </Button>
          </div>
        </CardContent>
      </Card>
    </Link>
  )

  const ProductListItem = ({ product }: { product: Product }) => (
    <Link href={`/product/${product.id}`} className="group block">
      <Card className="hover:shadow-xl transition-all duration-300 border-0 shadow-lg hover:-translate-y-1">
        <CardContent className="p-6">
          <div className="flex gap-6">
            <div className="relative w-32 h-32 flex-shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-gray-50 to-gray-100">
              <Image
                src={product.image_urls && product.image_urls.length > 0 && product.image_urls[0].startsWith('http')
                  ? product.image_urls[0]
                  : '/placeholder-product.svg'}
                alt={product.title}
                fill
                sizes="128px"
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <span className="text-sm font-medium text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                    {product.category}
                  </span>
                  {product.is_featured && (
                    <Badge className="ml-2 bg-gradient-to-r from-amber-500 to-orange-600 border-0">
                      Featured
                    </Badge>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">
                    {formatPKR(product.price)}
                  </p>
                </div>
              </div>

              <h3 className="font-semibold text-gray-900 text-xl mb-2 group-hover:text-emerald-700 transition-colors">
                {product.title}
              </h3>

              <div className="flex items-center mb-3">
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
                  ({product.review_count} reviews)
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span className="flex items-center">
                    <Package className="w-4 h-4 mr-1" />
                    {product.stock_quantity > 0 ? `${product.stock_quantity} in stock` : 'Out of stock'}
                  </span>
                </div>
                <Button className="bg-gradient-to-r from-gray-900 to-black hover:from-emerald-600 hover:to-green-700">
                  View Details
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              All <span className="bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">Products</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
              Discover our complete collection of premium products. Find exactly what you're looking for with advanced search and filtering.
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

      {/* Search and Filters */}
      <section className="py-8 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Sort */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
                <SelectItem value="name">Name A-Z</SelectItem>
              </SelectContent>
            </Select>

            {/* View Toggle */}
            <div className="flex border rounded-lg">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="rounded-r-none"
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="rounded-l-none"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>

            {/* Filters Toggle */}
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden"
            >
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              Filters
            </Button>
          </div>

          {/* Advanced Filters */}
          <div className={`mt-6 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <Card className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Price Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price Range: {formatPKR(priceRange[0])} - {formatPKR(priceRange[1])}
                  </label>
                  <Slider
                    value={priceRange}
                    onValueChange={(value) => setPriceRange(value as [number, number])}
                    max={500000}
                    min={0}
                    step={1000}
                    className="w-full"
                  />
                </div>

                {/* Clear Filters */}
                <div className="flex items-end">
                  <Button variant="outline" onClick={clearFilters} className="w-full">
                    <X className="w-4 h-4 mr-2" />
                    Clear Filters
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Results Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {filteredAndSortedProducts.length} Product{filteredAndSortedProducts.length !== 1 ? 's' : ''} Found
              </h2>
              {searchQuery && (
                <p className="text-gray-600 mt-1">
                  Showing results for "{searchQuery}"
                </p>
              )}
            </div>
          </div>

          {/* Products Grid/List */}
          {loading ? (
            <div className={`grid gap-6 ${
              viewMode === 'grid'
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                : 'grid-cols-1'
            }`}>
              {[...Array(12)].map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="aspect-square w-full" />
                  <CardContent className="p-6">
                    <Skeleton className="h-4 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2 mb-4" />
                    <Skeleton className="h-6 w-1/4" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredAndSortedProducts.length > 0 ? (
            <div className={`grid gap-6 ${
              viewMode === 'grid'
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                : 'grid-cols-1'
            }`}>
              {filteredAndSortedProducts.map((product) =>
                viewMode === 'grid' ? (
                  <ProductCard key={product.id} product={product} />
                ) : (
                  <ProductListItem key={product.id} product={product} />
                )
              )}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="mx-auto w-24 h-24 mb-4 text-gray-300">
                <Search className="w-full h-full" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-700 mb-2">
                No products found
              </h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                Try adjusting your search criteria or browse our categories to find what you're looking for.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button onClick={clearFilters} variant="outline">
                  Clear Filters
                </Button>
                <Link href="/categories">
                  <Button>
                    Browse Categories
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
