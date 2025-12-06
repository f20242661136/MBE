import Link from 'next/link'
import { CheckCircle, ArrowRight, Home, ShoppingBag } from 'lucide-react'
import { Button } from "@/components/ui/button"

export default function OrderSuccessPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="mb-6">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Placed Successfully!</h1>
          <p className="text-gray-600">
            Thank you for shopping with us. We'll call you within 24 hours to confirm your order details.
          </p>
        </div>

        <div className="space-y-4 mb-8">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-semibold text-green-800 mb-2">What happens next?</h3>
            <ul className="text-sm text-green-700 space-y-1 text-left">
              <li>• Our team will verify your order details</li>
              <li>• We'll call you to confirm delivery address</li>
              <li>• Your order will be shipped within 2-3 days</li>
              <li>• Pay cash on delivery when you receive the product</li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/" className="flex-1">
            <Button className="w-full bg-gradient-to-r from-gray-900 to-black hover:from-emerald-700 hover:to-green-800">
              <Home className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <Link href="/products" className="flex-1">
            <Button variant="outline" className="w-full">
              <ShoppingBag className="w-4 h-4 mr-2" />
              Continue Shopping
            </Button>
          </Link>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Need help? <Link href="/contact" className="text-emerald-600 hover:underline">Contact our support team</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
