'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Upload, X, Plus, Edit, Trash2 } from 'lucide-react'

const CATEGORIES = [
  'Smartphones', 'Laptops', 'Tablets', 'Headphones', 'Gaming', 'Wearables',
  'Cameras', 'Accessories', 'Home Appliances', 'TV & Audio', 'Other'
]

export default function AdminDashboard() {
  const [session, setSession] = useState<any>(null)
  const [orders, setOrders] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  // Product form state
  const [productForm, setProductForm] = useState({
    title: '',
    price: '',
    description: '',
    category: '',
    stock_quantity: '',
    specifications: ''
  })
  const [selectedImages, setSelectedImages] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])

  useEffect(() => {
    checkAuth()
    fetchOrders()
    fetchProducts()
  }, [])

  async function checkAuth() {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      router.push('/login')
    } else {
      setSession(session)
    }
  }

  async function fetchOrders() {
    const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false })
    if (data) setOrders(data)
  }

  async function fetchProducts() {
    const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false })
    if (data) setProducts(data)
  }

  // Copy Address Helper
  const copyDetails = (order: any) => {
    const text = `Name: ${order.customer_name}\nPhone: ${order.phone}\nAddress: ${order.address}, ${order.city}`
    navigator.clipboard.writeText(text)
    toast({
      title: "Details Copied!",
      description: "Order details copied to clipboard for Markaz.",
    })
  }

  // Image handling
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length + selectedImages.length > 5) {
      toast({
        title: "Too many images",
        description: "Maximum 5 images allowed per product.",
        variant: "destructive",
      })
      return
    }

    setSelectedImages(prev => [...prev, ...files])

    // Create previews
    files.forEach(file => {
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreviews(prev => [...prev, e.target?.result as string])
      }
      reader.readAsDataURL(file)
    })
  }

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index))
    setImagePreviews(prev => prev.filter((_, i) => i !== index))
  }

  // Upload images to Supabase Storage
  async function uploadImages(): Promise<string[]> {
    const uploadedUrls: string[] = []

    for (const file of selectedImages) {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `products/${fileName}`

      const { error } = await supabase.storage
        .from('images')
        .upload(filePath, file)

      if (error) {
        console.error('Error uploading image:', error)
        continue
      }

      const { data } = supabase.storage
        .from('images')
        .getPublicUrl(filePath)

      if (data?.publicUrl) {
        uploadedUrls.push(data.publicUrl)
      }
    }

    return uploadedUrls
  }

  // Add new product
  async function handleAddProduct(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      // Upload images first
      const imageUrls = await uploadImages()

      if (imageUrls.length === 0) {
        toast({
          title: "No images uploaded",
          description: "Please select at least one image for the product.",
          variant: "destructive",
        })
        setLoading(false)
        return
      }

      // Parse specifications
      let specs = {}
      try {
        specs = JSON.parse(productForm.specifications || '{}')
      } catch {
        specs = {}
      }

      const { error } = await supabase.from('products').insert([{
        title: productForm.title,
        price: parseFloat(productForm.price),
        image_urls: imageUrls,
        description: productForm.description,
        category: productForm.category,
        stock_quantity: parseInt(productForm.stock_quantity) || 10,
        specifications: specs,
        rating: 4.5,
        review_count: 0,
        is_active: true
      }])

      if (error) throw error

      toast({
        title: "Product Added!",
        description: "New product has been successfully added.",
      })

      // Reset form
      setProductForm({
        title: '',
        price: '',
        description: '',
        category: '',
        stock_quantity: '',
        specifications: ''
      })
      setSelectedImages([])
      setImagePreviews([])

      // Refresh products
      fetchProducts()

    } catch (error) {
      console.error('Error adding product:', error)
      toast({
        title: "Error",
        description: "Failed to add product. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Delete product
  async function deleteProduct(productId: number) {
    if (!confirm('Are you sure you want to delete this product?')) return

    try {
      const { error } = await supabase.from('products').delete().eq('id', productId)
      if (error) throw error

      toast({
        title: "Product Deleted",
        description: "Product has been removed successfully.",
      })

      fetchProducts()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete product.",
        variant: "destructive",
      })
    }
  }

  // Toggle product active status
  async function toggleProductStatus(productId: number, currentStatus: boolean) {
    try {
      const { error } = await supabase
        .from('products')
        .update({ is_active: !currentStatus })
        .eq('id', productId)

      if (error) throw error

      toast({
        title: "Status Updated",
        description: `Product ${!currentStatus ? 'activated' : 'deactivated'}.`,
      })

      fetchProducts()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update product status.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <Button
            onClick={() => supabase.auth.signOut().then(() => router.push('/login'))}
            variant="destructive"
          >
            Logout
          </Button>
        </div>

        <Tabs defaultValue="orders" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="orders">Orders ({orders.length})</TabsTrigger>
            <TabsTrigger value="products">Products ({products.length})</TabsTrigger>
          </TabsList>

          {/* Orders Tab */}
          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>Order Management</CardTitle>
                <CardDescription>View and manage customer orders</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {orders.map((order) => (
                        <tr key={order.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(order.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{order.customer_name}</div>
                            <div className="text-sm text-gray-500">{order.phone}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{order.product_title}</div>
                            <div className="text-sm font-bold text-green-600">Rs. {order.product_price}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge variant={order.status === 'Pending' ? 'secondary' : 'default'}>
                              {order.status}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <Button
                              onClick={() => copyDetails(order)}
                              variant="outline"
                              size="sm"
                            >
                              Copy Details
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products" className="space-y-6">
            {/* Add Product Form */}
            <Card>
              <CardHeader>
                <CardTitle>Add New Product</CardTitle>
                <CardDescription>Upload product details and images</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddProduct} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Product Title *
                        </label>
                        <Input
                          required
                          placeholder="Enter product title"
                          value={productForm.title}
                          onChange={(e) => setProductForm({...productForm, title: e.target.value})}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Price (PKR) *
                        </label>
                        <Input
                          required
                          type="number"
                          placeholder="0"
                          value={productForm.price}
                          onChange={(e) => setProductForm({...productForm, price: e.target.value})}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Category *
                        </label>
                        <Select value={productForm.category} onValueChange={(value) => setProductForm({...productForm, category: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {CATEGORIES.map((cat) => (
                              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Stock Quantity
                        </label>
                        <Input
                          type="number"
                          placeholder="10"
                          value={productForm.stock_quantity}
                          onChange={(e) => setProductForm({...productForm, stock_quantity: e.target.value})}
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Description
                        </label>
                        <Textarea
                          placeholder="Product description..."
                          value={productForm.description}
                          onChange={(e) => setProductForm({...productForm, description: e.target.value})}
                          rows={4}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Specifications (JSON)
                        </label>
                        <Textarea
                          placeholder='{"Storage": "256GB", "Color": "Black"}'
                          value={productForm.specifications}
                          onChange={(e) => setProductForm({...productForm, specifications: e.target.value})}
                          rows={3}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Image Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Product Images * (Max 5)
                    </label>
                    <div className="flex flex-wrap gap-4 mb-4">
                      {imagePreviews.map((preview, index) => (
                        <div key={index} className="relative">
                          <img
                            src={preview}
                            alt={`Preview ${index + 1}`}
                            className="w-20 h-20 object-cover rounded-lg border"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute -top-2 -right-2 w-6 h-6 p-0"
                            onClick={() => removeImage(index)}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                      {selectedImages.length < 5 && (
                        <label className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-gray-400 transition-colors">
                          <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleImageSelect}
                            className="hidden"
                          />
                          <Plus className="w-6 h-6 text-gray-400" />
                        </label>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">
                      {selectedImages.length}/5 images selected
                    </p>
                  </div>

                  <Button type="submit" disabled={loading} className="w-full">
                    {loading ? 'Adding Product...' : 'Add Product'}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Products List */}
            <Card>
              <CardHeader>
                <CardTitle>Product Management</CardTitle>
                <CardDescription>View and manage your products</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <div key={product.id} className="border rounded-lg p-4 space-y-3">
                      <div className="aspect-square relative overflow-hidden rounded-lg bg-gray-100">
                        <img
                          src={product.image_urls?.[0] || '/placeholder-product.svg'}
                          alt={product.title}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div>
                        <h3 className="font-semibold text-gray-900 truncate">{product.title}</h3>
                        <p className="text-sm text-gray-600">Rs. {product.price}</p>
                        <p className="text-xs text-gray-500">Stock: {product.stock_quantity}</p>
                      </div>

                      <div className="flex items-center justify-between">
                        <Badge variant={product.is_active ? 'default' : 'secondary'}>
                          {product.is_active ? 'Active' : 'Inactive'}
                        </Badge>

                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleProductStatus(product.id, product.is_active)}
                          >
                            {product.is_active ? 'Deactivate' : 'Activate'}
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => deleteProduct(product.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
