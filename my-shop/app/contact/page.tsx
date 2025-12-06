export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Contact Us</h1>
          <p className="text-xl text-gray-600">Get in touch with our support team</p>
        </div>
        <div className="mt-12 max-w-2xl mx-auto">
          <div className="bg-white p-8 rounded-lg shadow-sm">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Customer Support</h3>
                <p className="text-gray-600">Phone: +92-300-0000000</p>
                <p className="text-gray-600">Email: support@eshop-pk.com</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Business Hours</h3>
                <p className="text-gray-600">Monday - Saturday: 9:00 AM - 9:00 PM</p>
                <p className="text-gray-600">Sunday: 10:00 AM - 6:00 PM</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Address</h3>
                <p className="text-gray-600">123 Business District, Karachi, Pakistan</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
