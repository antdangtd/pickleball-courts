// scr/app/login/page.tsx
// This file contains the login page component, which allows users to sign in to the application using their email and password.
'use client'

import { useState, useEffect } from 'react'
import { signIn, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from 'next/link'
import { toast } from "sonner"
import { Eye, EyeOff } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { data: session, status } = useSession()
  
  // Check if already authenticated
  useEffect(() => {
    console.log('Session status:', status, session)
    if (status === 'authenticated' && session) {
      console.log('Already authenticated, redirecting to dashboard')
      router.push('/dashboard')
    }
  }, [session, status, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      console.log('Attempting login with email:', email)
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password
      })

      console.log('Login result:', result)

      if (result?.error) {
        toast.error('Login Failed', {
          description: 'Invalid email or password'
        })
        setIsLoading(false)
      } else {
        toast.success('Login Successful', {
          description: 'Redirecting to dashboard...'
        })
        
        // Add a slight delay to ensure session is established
        setTimeout(() => {
          router.push('/dashboard')
          router.refresh() // Force a refresh to update session data
        }, 500)
      }
    } catch (error) {
      console.error('Login error:', error)
      toast.error('Login Error', {
        description: 'An unexpected error occurred'
      })
      setIsLoading(false)
    }
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  // Show loading state if checking session
  if (status === 'loading') {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">
        Login to Pickleball Courts
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="your.email@example.com"
            disabled={isLoading}
          />
        </div>

        <div className="relative">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
              className="pr-10"
              disabled={isLoading}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2"
              onClick={togglePasswordVisibility}
              disabled={isLoading}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5 text-gray-500" />
              ) : (
                <Eye className="h-5 w-5 text-gray-500" />
              )}
            </Button>
          </div>
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? 'Logging in...' : 'Login'}
        </Button>
      </form>

      <div className="text-center mt-4">
        <Link href="/register" className="text-sm text-blue-600 hover:underline">
          Don't have an account? Register
        </Link>
      </div>
    </div>
  )
}