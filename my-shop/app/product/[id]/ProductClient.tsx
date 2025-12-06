// app/product/[id]/ProductClient.tsx
'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { 
  Truck, 
  Shield, 
  CheckCircle, 
  Star, 
  Phone,
  Package,
  Clock,
  ArrowLeft,
  Share2,
  Heart
} from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { supabase } from '@/lib/supabase'
import RelatedProducts from './RelatedProducts'

const formatPKR = (amount: number) => 
  new Intl.NumberFormat('en-PK', { 
    style: 'currency', 
    currency: 'PKR', 
    maximumFractionDigits: 0 
  }).format(amount)

interface ProductClientProps {
  product: {
    id: number
    title: string
    price: number
    image_url: string
    description: string
    category: string
    rating: number
    review_count: number
    specifications: Record<string, string>
    stock_quantity: number
  }
}

const PAKISTAN_CITIES = [
  'Lahore', 'Karachi', 'Islamabad', 'Rawalpindi', 
  'Faisalabad', 'Multan', 'Hyderabad', 'Gujranwala',
  'Peshawar', 'Quetta', 'Sargodha', 'Sialkot',
  'Bahawalpur', 'Sukkur', 'Larkana', 'Sheikhupura'
]

export default function ProductClient({ product }: ProductClientProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [selectedImage, setSelectedImage] = useState(0)
  const [isFavorite, setIsFavorite] = useState(false)
  
  const [form, setForm] = useState({
    name: '',
    phone: '',
    city: 'Lahore',
    address: '',
    quantity: 1,
  })

  const productImages = [
    product.image_url,
    ...(Array.isArray(product.specifications?.additional_images) 
      ? product.specifications.additional_images 
      : [])
  ]

  async function handleOrder(e: FormEvent) {
    e.preventDefault()
    setLoading(true)

    // Enhanced phone validation
    const phoneRegex = /^(03[0-9]{9}|^\+923[0-9]{9})$/
    if (!phoneRegex.test(form.phone)) {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a valid Pakistani mobile number starting with 03",
        variant: "destructive",
      })
      setLoading(false)
      return
    }

    try {
      const { error } = await supabase.from('orders').insert([{
        customer_name: form.name,
        phone: form.phone,
        city: form.city,
        address: form.address,
        product_id: product.id,
        product_title: product.title,
        product_price: product.price,
        quantity: form.quantity,
        total_amount: product.price * form.quantity,
        status: 'Pending',
      }])

      if (error) throw error

      toast({
        title: "🎉 Order Placed Successfully!",
        description: "We'll call you within 24 hours to confirm your order.",
        duration: 5000,
      })

      // Reset form
      setForm({
        name: '',
        phone: '',
        city: 'Lahore',
        address: '',
        quantity: 1,
      })

      // Track conversion
      if (window.gtag) {
        window.gtag('event', 'purchase', {
          transaction_id: Date.now().toString(),
          value: product.price * form.quantity,
          currency: 'PKR',
          items: [{
            item_id: product.id.toString(),
            item_name: product.title,
            price: product.price,
            quantity: form.quantity,
          }]
        })
      }

      // Redirect after delay
      setTimeout(() => router.push('/order-success'), 2000)

    } catch (error) {
      toast({
        title: "Order Failed",
        description: "Please try again or contact support",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  function shareProduct() {
    if (navigator.share) {
      navigator.share({
        title: product.title,
        text: `Check out ${product.title} on E-Shop Pakistan for only ${formatPKR(product.price)}`,
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast({
        title: "Link Copied!",
        description: "Product link copied to clipboard",
      })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Breadcrumb */}
      <nav className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center text-sm text-gray-600">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="mr-2"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
            <span className="mx-2">/</span>
            <span className="text-gray-900 font-medium">{product.category}</span>
            <span className="mx-2">/</span>
            <span className="text-emerald-600 font-semibold truncate">{product.title}</span>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* Left Column - Images */}
          <div className="space-y-6">
            {/* Main Image */}
            <div className="relative aspect-square bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl overflow-hidden border border-gray-200 shadow-lg">
              <Image
                src={productImages[selectedImage] && productImages[selectedImage].startsWith('http') ? productImages[selectedImage] : '/placeholder-product.svg'}
                alt={product.title}
                fill
                unoptimized
                className="object-cover"
                priority
                loading="eager"
                sizes="(max-width: 768px) 100vw, 50vw"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/placeholder-product.svg';
                }}
              />
              
              {/* Stock Status */}
              <div className="absolute top-4 left-4">
                <div className={`px-4 py-2 rounded-full text-sm font-semibold shadow-lg ${
                  product.stock_quantity > 10 
                    ? 'bg-emerald-500 text-white'
                    : product.stock_quantity > 0
                    ? 'bg-amber-500 text-white'
                    : 'bg-red-500 text-white'
                }`}>
                  {product.stock_quantity > 10 
                    ? 'In Stock'
                    : product.stock_quantity > 0
                    ? `Low Stock (${product.stock_quantity} left)`
                    : 'Out of Stock'
                  }
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="absolute top-4 right-4 flex space-x-2">
                <Button
                  variant="secondary"
                  size="icon"
                  onClick={() => setIsFavorite(!isFavorite)}
                  className="bg-white/80 backdrop-blur-sm hover:bg-white"
                >
                  <Heart className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
                </Button>
                <Button
                  variant="secondary"
                  size="icon"
                  onClick={shareProduct}
                  className="bg-white/80 backdrop-blur-sm hover:bg-white"
                >
                  <Share2 className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Thumbnail Gallery */}
            {productImages.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {productImages.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`relative aspect-square rounded-xl overflow-hidden border-2 ${
                      selectedImage === index 
                        ? 'border-emerald-500 ring-2 ring-emerald-200'
                        : 'border-gray-200'
                    } transition-all`}
                  >
                    <Image
                      src={img}
                      alt={`${product.title} view ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Product Features */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl border border-emerald-100">
                <div className="flex items-center space-x-3">
                  <Truck className="w-8 h-8 text-emerald-600" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Free Delivery</h4>
                    <p className="text-sm text-gray-600">3-7 days across Pakistan</p>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl border border-blue-100">
                <div className="flex items-center space-x-3">
                  <Shield className="w-8 h-8 text-blue-600" />
                  <div>
                    <h4 className="font-semibold text-gray-900">7-Day Warranty</h4>
                    <p className="text-sm text-gray-600">Check before paying</p>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-100">
                <div className="flex items-center space-x-3">
                  <Package className="w-8 h-8 text-amber-600" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Original Packaging</h4>
                    <p className="text-sm text-gray-600">Sealed & Authentic</p>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border border-purple-100">
                <div className="flex items-center space-x-3">
                  <Clock className="w-8 h-8 text-purple-600" />
                  <div>
                    <h4 className="font-semibold text-gray-900">24/7 Support</h4>
                    <p className="text-sm text-gray-600">Call or WhatsApp</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Product Info & Order Form */}
          <div className="space-y-8">
            {/* Product Header */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-sm font-medium">
                    {product.category}
                  </span>
                  <div className="flex items-center">
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
                    <span className="ml-2 text-sm text-gray-600">
                      ({product.review_count} reviews)
                    </span>
                  </div>
                </div>
              </div>
              
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                {product.title}
              </h1>
              
              <p className="text-gray-600 text-lg mb-6 leading-relaxed">
                {product.description}
              </p>
              
              {/* Price */}
              <div className="flex items-baseline space-x-4 mb-6">
                <span className="text-4xl font-bold text-gray-900">
                  {formatPKR(product.price)}
                </span>
                {product.price < 5000 && (
                  <>
                    <span className="text-xl text-gray-400 line-through">
                      {formatPKR(product.price * 1.5)}
                    </span>
                    <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-bold">
                      Save {formatPKR(product.price * 0.5)}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Specifications */}
            {product.specifications && Object.keys(product.specifications).length > 0 && (
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Specifications</h3>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(product.specifications).map(([key, value]) => (
                    <div key={key} className="flex justify-between py-2 border-b border-gray-200 last:border-0">
                      <span className="text-gray-600">{key}:</span>
                      <span className="font-medium text-gray-900">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Order Form */}
            <form onSubmit={handleOrder} className="space-y-6 bg-white rounded-2xl p-8 border border-gray-200 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Order Now</h3>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center border border-gray-300 rounded-lg">
                    <button
                      type="button"
                      onClick={() => setForm({...form, quantity: Math.max(1, form.quantity - 1)})}
                      className="px-4 py-2 text-gray-600 hover:bg-gray-100"
                    >
                      -
                    </button>
                    <span className="px-4 py-2 font-medium">{form.quantity}</span>
                    <button
                      type="button"
                      onClick={() => setForm({...form, quantity: form.quantity + 1})}
                      className="px-4 py-2 text-gray-600 hover:bg-gray-100"
                    >
                      +
                    </button>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Total</p>
                    <p className="text-2xl font-bold text-emerald-600">
                      {formatPKR(product.price * form.quantity)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    required
                    placeholder="Enter your full name"
                    value={form.name}
                    onChange={(e) => setForm({...form, name: e.target.value})}
                    className="h-12 text-base"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <Input
                      required
                      type="tel"
                      placeholder="03001234567"
                      value={form.phone}
                      onChange={(e) => setForm({...form, phone: e.target.value})}
                      className="h-12 text-base"
                    />
                    <p className="text-xs text-gray-500 mt-1">Enter 11-digit number starting with 03</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City <span className="text-red-500">*</span>
                    </label>
                    <Select
                      value={form.city}
                      onValueChange={(value) => setForm({...form, city: value})}
                    >
                      <SelectTrigger className="h-12 text-base" suppressHydrationWarning>
                        <SelectValue placeholder="Select city" />
                      </SelectTrigger>
                      <SelectContent>
                        {PAKISTAN_CITIES.map((city) => (
                          <SelectItem key={city} value={city}>
                            {city}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Complete Address <span className="text-red-500">*</span>
                  </label>
                  <Textarea
                    required
                    placeholder="House #, Street, Area, Landmark..."
                    value={form.address}
                    onChange={(e) => setForm({...form, address: e.target.value})}
                    rows={3}
                    className="resize-none text-base"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading || product.stock_quantity === 0}
                size="lg"
                className="w-full h-14 text-base font-bold bg-gradient-to-r from-gray-900 to-black hover:from-emerald-700 hover:to-green-800"
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : product.stock_quantity === 0 ? (
                  "Out of Stock"
                ) : (
                  `Confirm Order - Cash on Delivery`
                )}
              </Button>

              <p className="text-center text-sm text-gray-500">
                By placing order, you agree to our{" "}
                <a href="/terms" className="text-emerald-600 hover:underline">
                  Terms & Conditions
                </a>
              </p>
            </form>

            {/* WhatsApp Order Button */}
            <a
              href={`https://wa.me/923000000000?text=I want to order ${encodeURIComponent(product.title)} - ${formatPKR(product.price)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <Button
                variant="outline"
                size="lg"
                className="w-full h-14 text-base font-medium bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 hover:bg-green-100 hover:border-green-300"
              >
                <Phone className="w-5 h-5 mr-2 text-green-600" />
                Order via WhatsApp (Fast Response)
              </Button>
            </a>
          </div>
        </div>

        {/* Related Products Section */}
        <RelatedProducts currentProductId={product.id} category={product.category} />
      </div>
    </div>
  )
}