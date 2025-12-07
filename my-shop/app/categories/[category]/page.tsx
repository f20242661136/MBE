import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import ProductGrid from '@/components/ProductGrid'

const formatCategoryName = (slug: string) => {
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

interface CategoryPageProps {
  params: Promise<{
    category: string
  }>
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const resolvedParams = await params
  const categoryName = formatCategoryName(resolvedParams.category)

  const { data: productsData, error: productsError } = await supabase
    .from('products')
    .select('*')
    .eq('category', categoryName)
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  if (productsError) {
    console.error('Error fetching products:', productsError)
    notFound()
  }

  // Fetch reviews for each product to calculate dynamic ratings
  const products = await Promise.all(
    (productsData || []).map(async (product) => {
      const { data: reviews, error: reviewsError } = await supabase
        .from('reviews')
        .select('rating')
        .eq('product_id', product.id)

      if (reviewsError) {
        console.error('Error fetching reviews for product', product.id, reviewsError)
        return { ...product, rating: product.rating, review_count: product.review_count }
      }

      const reviewCount = reviews?.length || 0
      const averageRating = reviewCount > 0
        ? reviews!.reduce((sum, review) => sum + review.rating, 0) / reviewCount
        : product.rating

      return {
        ...product,
        rating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
        review_count: reviewCount
      }
    })
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{categoryName}</h1>
          <p className="text-gray-600">
            Discover our collection of {categoryName.toLowerCase()} products
          </p>
        </div>

        {products && products.length > 0 ? (
          <ProductGrid products={products} />
        ) : (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-600">
              We're working on adding more {categoryName.toLowerCase()} products. Check back soon!
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export async function generateStaticParams() {
  const { data: categories } = await supabase
    .from('products')
    .select('category')
    .not('category', 'is', null)

  const uniqueCategories = [...new Set(categories?.map(p => p.category) || [])]

  return uniqueCategories.map((category) => ({
    category: category.toLowerCase().replace(/\s+/g, '-'),
  }))
}
