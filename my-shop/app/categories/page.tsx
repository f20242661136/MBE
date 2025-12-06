export default function CategoriesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Categories</h1>
          <p className="text-xl text-gray-600">Browse our product categories</p>
        </div>
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Placeholder categories */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900">Electronics</h3>
            <p className="text-gray-600 mt-2">Latest gadgets and electronics</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900">Fashion</h3>
            <p className="text-gray-600 mt-2">Trendy clothing and accessories</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900">Home & Garden</h3>
            <p className="text-gray-600 mt-2">Everything for your home</p>
          </div>
        </div>
      </div>
    </div>
  )
}
