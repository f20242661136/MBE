export default function ProductsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">All Products</h1>
          <p className="text-xl text-gray-600">Browse our complete collection of products</p>
        </div>
        <div className="mt-12">
          <div className="bg-white p-8 rounded-lg shadow-sm text-center">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Products Coming Soon</h2>
            <p className="text-gray-600 mb-6">
              We're working hard to bring you the best products. Check back soon!
            </p>
            <div className="flex justify-center space-x-4">
              <a
                href="/categories"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Browse Categories
              </a>
              <a
                href="/"
                className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Back to Home
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
