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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { X, Plus, Trash2, Edit, Download, Search, Filter } from 'lucide-react'

const CATEGORIES = [
  'Smartphones', 'Laptops', 'Tablets', 'Headphones', 'Gaming', 'Wearables',
  'Clothing & Shoes', 'Home & Kitchen', 'Books', 'Sports & Outdoors',
  'Beauty & Personal Care', 'Toys & Games', 'Furniture', 'Automotive'
]

// Admin email whitelist - only these users can access admin dashboard
const ADMIN_EMAILS = [
  'admin@eshoppakistan.com',
  'rashidali@example.com', // Add your admin emails here
  'f20242661136@gmail.com', // Your admin email
  // Add more admin emails as needed
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

  // New state for enhancements
  const [orderSearch, setOrderSearch] = useState('')
  const [orderStatusFilter, setOrderStatusFilter] = useState('All')
  const [editingProduct, setEditingProduct] = useState<any>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)

  useEffect(() => {
    checkAuth()
    fetchOrders()
    fetchProducts()
  }, [])

  async function checkAuth() {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      router.push('/login')
      return
    }

    // Check if user is admin
    const userEmail = session.user?.email
    if (!userEmail || !ADMIN_EMAILS.includes(userEmail)) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access the admin dashboard.",
        variant: "destructive",
      })
      await supabase.auth.signOut()
      router.push('/')
      return
    }

    setSession(session)
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

  // Update order status
  async function updateOrderStatus(orderId: number, newStatus: string) {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId)

      if (error) throw error

      toast({
        title: "Order Updated",
        description: `Order status changed to ${newStatus}.`,
      })

      fetchOrders()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update order status.",
        variant: "destructive",
      })
    }
  }

  // Edit product
  async function handleEditProduct(e: React.FormEvent) {
    e.preventDefault()
    if (!editingProduct) return

    setLoading(true)

    try {
      let imageUrls = editingProduct.image_urls || []

      // Upload new images if any
      if (selectedImages.length > 0) {
        const newImageUrls = await uploadImages()
        imageUrls = [...imageUrls, ...newImageUrls]
      }

      // Parse specifications
      let specs = {}
      try {
        specs = JSON.parse(editingProduct.specifications || '{}')
      } catch {
        specs = {}
      }

      const { error } = await supabase.from('products').update({
        title: editingProduct.title,
        price: parseFloat(editingProduct.price),
        image_urls: imageUrls,
        description: editingProduct.description,
        category: editingProduct.category,
        stock_quantity: parseInt(editingProduct.stock_quantity) || 10,
        specifications: specs,
      }).eq('id', editingProduct.id)

      if (error) throw error

      toast({
        title: "Product Updated!",
        description: "Product has been successfully updated.",
      })

      setEditDialogOpen(false)
      setEditingProduct(null)
      setSelectedImages([])
      setImagePreviews([])

      fetchProducts()

    } catch (error) {
      console.error('Error updating product:', error)
      toast({
        title: "Error",
        description: "Failed to update product. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Export orders to CSV
  function exportOrdersToCSV() {
    const headers = ['Date', 'Customer Name', 'Phone', 'Product', 'Price', 'Status', 'Address', 'City']
    const csvContent = [
      headers.join(','),
      ...orders.map(order => [
        new Date(order.created_at).toLocaleDateString(),
        `"${order.customer_name}"`,
        `"${order.phone}"`,
        `"${order.product_title}"`,
        order.product_price,
        order.status,
        `"${order.address}"`,
        `"${order.city}"`
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `orders_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast({
      title: "Export Complete",
      description: "Orders exported to CSV successfully.",
    })
  }

  // Export products to CSV
  function exportProductsToCSV() {
    const headers = ['Title', 'Price', 'Category', 'Stock', 'Status', 'Rating', 'Reviews']
    const csvContent = [
      headers.join(','),
      ...products.map(product => [
        `"${product.title}"`,
        product.price,
        `"${product.category}"`,
        product.stock_quantity,
        product.is_active ? 'Active' : 'Inactive',
        product.rating,
        product.review_count
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `products_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast({
      title: "Export Complete",
      description: "Products exported to CSV successfully.",
    })
  }

  // Open edit dialog
  function openEditDialog(product: any) {
    setEditingProduct({ ...product })
    setEditDialogOpen(true)
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
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Order Management</CardTitle>
                    <CardDescription>View and manage customer orders</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={exportOrdersToCSV} variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Export CSV
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Search and Filter */}
                <div className="flex gap-4 mb-6">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        placeholder="Search orders by customer name, phone, or product..."
                        value={orderSearch}
                        onChange={(e) => setOrderSearch(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select value={orderStatusFilter} onValueChange={setOrderStatusFilter}>
                    <SelectTrigger className="w-48">
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All Statuses</SelectItem>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="Processing">Processing</SelectItem>
                      <SelectItem value="Shipped">Shipped</SelectItem>
                      <SelectItem value="Delivered">Delivered</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {orders
                        .filter(order => {
                          const matchesSearch = orderSearch === '' ||
                            order.customer_name.toLowerCase().includes(orderSearch.toLowerCase()) ||
                            order.phone.includes(orderSearch) ||
                            order.product_title.toLowerCase().includes(orderSearch.toLowerCase())
                          const matchesFilter = orderStatusFilter === 'All' || order.status === orderStatusFilter
                          return matchesSearch && matchesFilter
                        })
                        .map((order) => (
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
                            <Select
                              value={order.status}
                              onValueChange={(value) => updateOrderStatus(order.id, value)}
                            >
                              <SelectTrigger className="w-32">
                                <Badge variant={order.status === 'Pending' ? 'secondary' : 'default'}>
                                  {order.status}
                                </Badge>
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Pending">Pending</SelectItem>
                                <SelectItem value="Processing">Processing</SelectItem>
                                <SelectItem value="Shipped">Shipped</SelectItem>
                                <SelectItem value="Delivered">Delivered</SelectItem>
                              </SelectContent>
                            </Select>
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
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Product Management</CardTitle>
                    <CardDescription>View and manage your products</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={exportProductsToCSV} variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Export CSV
                    </Button>
                  </div>
                </div>
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
                            onClick={() => openEditDialog(product)}
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Edit Product
                          </Button>
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

            {/* Edit Product Dialog */}
            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Edit Product</DialogTitle>
                  <DialogDescription>Update product details and images</DialogDescription>
                </DialogHeader>
                {editingProduct && (
                  <form onSubmit={handleEditProduct} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Product Title *
                          </label>
                          <Input
                            required
                            placeholder="Enter product title"
                            value={editingProduct.title || ''}
                            onChange={(e) => setEditingProduct({...editingProduct, title: e.target.value})}
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
                            value={editingProduct.price || ''}
                            onChange={(e) => setEditingProduct({...editingProduct, price: e.target.value})}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Category *
                          </label>
                          <Select value={editingProduct.category || ''} onValueChange={(value) => setEditingProduct({...editingProduct, category: value})}>
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
                            value={editingProduct.stock_quantity || ''}
                            onChange={(e) => setEditingProduct({...editingProduct, stock_quantity: e.target.value})}
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
                            value={editingProduct.description || ''}
                            onChange={(e) => setEditingProduct({...editingProduct, description: e.target.value})}
                            rows={4}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Specifications (JSON)
                          </label>
                          <Textarea
                            placeholder='{"Storage": "256GB", "Color": "Black"}'
                            value={editingProduct.specifications ? JSON.stringify(editingProduct.specifications, null, 2) : ''}
                            onChange={(e) => setEditingProduct({...editingProduct, specifications: e.target.value})}
                            rows={3}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Existing Images */}
                    {editingProduct.image_urls && editingProduct.image_urls.length > 0 && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Current Images
                        </label>
                        <div className="flex flex-wrap gap-4 mb-4">
                          {editingProduct.image_urls.map((url: string, index: number) => (
                            <div key={index} className="relative">
                              <img
                                src={url}
                                alt={`Current ${index + 1}`}
                                className="w-20 h-20 object-cover rounded-lg border"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Add New Images */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Add New Images (Optional)
                      </label>
                      <div className="flex flex-wrap gap-4 mb-4">
                        {imagePreviews.map((preview, index) => (
                          <div key={index} className="relative">
                            <img
                              src={preview}
                              alt={`New Preview ${index + 1}`}
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
                        {selectedImages.length}/5 new images selected
                      </p>
                    </div>

                    <div className="flex justify-end gap-4">
                      <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={loading}>
                        {loading ? 'Updating...' : 'Update Product'}
                      </Button>
                    </div>
                  </form>
                )}
              </DialogContent>
            </Dialog>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
