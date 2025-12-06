'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const router = useRouter()

  async function handleLogin() {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (!error) router.push('/admin')
    else alert(error.message)
  }

  return (
    <div className="h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm p-8 bg-white rounded-xl shadow border">
        <h1 className="text-2xl font-bold mb-6 text-center">Admin Access</h1>
        <div className="space-y-4">
          <Input placeholder="Email" onChange={e => setEmail(e.target.value)} />
          <Input type="password" placeholder="Password" onChange={e => setPassword(e.target.value)} />
          <Button onClick={handleLogin} className="w-full">Login</Button>
        </div>
      </div>
    </div>
  )
}