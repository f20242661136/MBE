export interface Product {
  id: number
  title: string
  price: number
  image_urls: string[]
  category: string
  rating: number
  review_count: number
  stock_quantity: number
  specifications?: Record<string, any>
  is_featured?: boolean
  is_active: boolean
  created_at: string
  description?: string
}

export interface RelatedProduct {
  id: number
  title: string
  price: number
  image_urls: string[]
  rating: number
  review_count: number
  stock_quantity: number
}

export interface Order {
  id: number
  customer_name: string
  phone: string
  city: string
  address: string
  product_id: number
  product_title: string
  product_price: number
  quantity: number
  total_amount: number
  status: string
  created_at: string
}

export interface Review {
  id: number
  product_id: number
  customer_name: string
  rating: number
  comment?: string
  verified_purchase: boolean
  created_at: string
}

export interface Category {
  name: string
  count: number
  image?: string
}
