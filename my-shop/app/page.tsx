'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

// Define the shape of your Product data
interface Product {
  id: number
  title: string
  price: number
  image_url: string
  description: string
}

export default function Home() {
  // Tell useState that 'products' is an array of 'Product' objects
  const [products, setProducts] = useState<Product[]>([])

  useEffect(() => {
    getProducts()
  }, [])

  async function getProducts() {
    const { data, error } = await supabase.from('products').select('*')
    
    if (error) {
      console.error('Error fetching products:', error)
    } else {
      // Cast the data to Product[]
      setProducts(data as any[]) 
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 p-4">
      <header className="flex justify-between items-center py-4 mb-8">
        <h1 className="text-2xl font-bold text-gray-900">My Shop (Pakistan)</h1>
        <Link href="/admin" className="text-sm text-blue-600 underline">Admin Login</Link>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
            <img src={product.image_url} alt={product.title} className="w-full h-48 object-cover" />
            <div className="p-4">
              <h2 className="text-lg font-semibold text-gray-800">{product.title}</h2>
              <p className="text-gray-600 mt-1">Rs. {product.price}</p>
              <Link href={`/product/${product.id}`}>
                <button className="mt-4 w-full bg-green-600 text-white py-2 rounded font-medium hover:bg-green-700">
                  Order Now
                </button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}