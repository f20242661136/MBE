'use client'

import { useEffect, useState, FormEvent } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, useParams } from 'next/navigation'
import { Phone, CheckCircle } from 'lucide-react'

// Define interfaces
interface Product {
  id: number
  title: string
  price: number
  image_url: string
  description: string
}

interface FormData {
  name: string
  phone: string
  city: string
  address: string
}

export default function ProductPage() {
  const params = useParams()                     // ✅ FIX
  const productId = params?.id as string         // ✅ FIX

  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const router = useRouter()

  const [formData, setFormData] = useState<FormData>({
    name: '',
    phone: '',
    city: 'Lahore',
    address: ''
  })

  const cities = ['Lahore', 'Karachi', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Multan', 'Peshawar', 'Quetta']

  useEffect(() => {
    async function getProduct() {
      if (!productId) return

      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single()

      if (data) setProduct(data as Product)
    }

    getProduct()
  }, [productId])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)

    if (!product) return

    if (!formData.phone.startsWith('03') || formData.phone.length !== 11) {
      alert('Please enter a valid Pakistani phone number (03XXXXXXXXX)')
      setLoading(false)
      return
    }

    const { error } = await supabase.from('orders').insert([
      {
        customer_name: formData.name,
        phone: formData.phone,
        city: formData.city,
        address: formData.address,
        product_title: product.title,
        product_price: product.price
      }
    ])

    if (!error) {
      setSubmitted(true)
    } else {
      alert('Error placing order. Please try again.')
    }

    setLoading(false)
  }

  if (!product) return <div className="p-10 text-center">Loading...</div>

  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-green-50 p-4">
        <CheckCircle size={64} className="text-green-600 mb-4" />
        <h1 className="text-2xl font-bold text-green-800">Order Placed Successfully!</h1>
        <p className="text-gray-600 mt-2 text-center">
          We will call you on <b>{formData.phone}</b> shortly to confirm.
        </p>
        <button onClick={() => router.push('/')} className="mt-8 text-blue-600 underline">
          Back to Home
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 flex justify-center items-center">
      <div className="bg-white max-w-4xl w-full rounded-xl shadow-lg overflow-hidden flex flex-col md:flex-row">

        {/* Left: Product Information */}
        <div className="md:w-1/2 p-6 border-r border-gray-100">
          <img
            src={product.image_url}
            alt={product.title}
            className="w-full h-64 object-cover rounded-lg mb-4"
          />
          <h1 className="text-2xl font-bold text-gray-900">{product.title}</h1>
          <p className="text-3xl font-bold text-green-600 mt-2">Rs. {product.price}</p>
          <p className="text-gray-500 mt-4">{product.description}</p>

          <div className="mt-6 flex items-center text-sm text-gray-500 bg-gray-100 p-2 rounded">
            <CheckCircle size={16} className="mr-2" /> Cash on Delivery Available
          </div>
        </div>

        {/* Right: Order Form */}
        <div className="md:w-1/2 p-8 bg-gray-50">
          <h2 className="text-xl font-bold mb-6 text-gray-800">Shipping Details</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Full Name</label>
              <input
                required
                type="text"
                className="w-full mt-1 p-2 border rounded-md  text-black"
                placeholder="Ali Khan"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Phone Number (03...)</label>
              <input
                required
                type="number"
                className="w-full mt-1 p-2 border rounded-md  text-black"
                placeholder="03001234567"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">City</label>
              <select
                className="w-full mt-1 p-2 border rounded-md bg-white"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              >
                {cities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Full Address</label>
              <textarea
                required
                className="w-full mt-1 p-2 border rounded-md  text-black"
                placeholder="House #, Street, Area..."
                
                rows={3}
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              ></textarea>
            </div>

            <button
              disabled={loading}
              type="submit"
              className="w-full bg-black text-white py-3 rounded-md font-bold text-lg hover:bg-gray-800 transition flex justify-center items-center"
            >
              {loading ? 'Processing...' : 'Confirm Order (COD)'}
            </button>
          </form>
        </div>
      
      </div>
    </div>
  )
}
