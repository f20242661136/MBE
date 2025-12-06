'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

interface Order {
  id: number
  created_at: string
  customer_name: string
  phone: string
  city: string
  address: string
  product_title: string
  product_price: number
  status: string
}

export default function AdminPage() {
  const [orders, setOrders] = useState<Order[]>([])

  useEffect(() => {
    fetchOrders()
  }, [])

  async function fetchOrders() {
    const { data } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (data) setOrders(data as any[])
  }

  async function updateStatus(id: number, newStatus: string) {
    await supabase.from('orders').update({ status: newStatus }).eq('id', id)
    fetchOrders()
  }

  const copyAddress = (order: Order) => {
    const fullText = `Name: ${order.customer_name}\nPhone: ${order.phone}\nAddress: ${order.address}, ${order.city}`
    navigator.clipboard.writeText(fullText)
    alert("Address Copied!")
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard (Orders)</h1>
      
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 text-left text-sm font-medium text-gray-500">Date</th>
              <th className="p-4 text-left text-sm font-medium text-gray-500">Customer</th>
              <th className="p-4 text-left text-sm font-medium text-gray-500">Product</th>
              <th className="p-4 text-left text-sm font-medium text-gray-500">Status</th>
              <th className="p-4 text-left text-sm font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {orders.map((order) => (
              <tr key={order.id}>
                <td className="p-4 text-sm text-gray-600">
                  {new Date(order.created_at).toLocaleDateString()}
                </td>
                <td className="p-4">
                  <div className="font-medium text-gray-900">{order.customer_name}</div>
                  <div className="text-gray-500 text-sm">{order.phone}</div>
                </td>
                <td className="p-4">
                  <div className="text-gray-900">{order.product_title}</div>
                  <div className="text-green-600 font-bold">Rs. {order.product_price}</div>
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold
                    ${order.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 
                      order.status === 'Confirmed' ? 'bg-blue-100 text-blue-800' : 
                      'bg-green-100 text-green-800'}`}>
                    {order.status}
                  </span>
                </td>
                <td className="p-4 flex gap-2">
                  <button 
                    onClick={() => copyAddress(order)}
                    className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm"
                  >
                    Copy Address
                  </button>
                  <select 
                    value={order.status} 
                    onChange={(e) => updateStatus(order.id, e.target.value)}
                    className="border rounded px-2 py-1 text-sm bg-white"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Ordered on Markaz">Markaz Ordered</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}