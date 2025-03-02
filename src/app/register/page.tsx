// src/app/register/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import Link from 'next/link'
import { toast } from "sonner"
import { Eye, EyeOff } from "lucide-react"

export default function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [skillLevel, setSkillLevel] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          password,
          skillLevel
        })
      })

      const data = await response.json()

      if (response.ok) {
        // Success toast
        toast.success("Account Created", {
          description: "Your account has been successfully created. Please log in."
        })
        
        // Redirect to login
        router.push('/login')
      } else {
        // Error toast
        toast.error("Registration Error", {
          description: data.error || "Failed to create account"
        })
      }
    } catch (error) {
      console.error('Registration Error:', error)
      toast.error("Registration Error", {
        description: "An unexpected error occurred"
      })
    }
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">
        Register for Pickleball Courts
      </h1>
      
      <form onSubmit={handleManualSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Your full name"
          />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="your.email@example.com"
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
              placeholder="Create a password"
              className="pr-10"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5 text-gray-500" />
              ) : (
                <Eye className="h-5 w-5 text-gray-500" />
              )}
            </Button>
          </div>
        </div>
        <div>
          <Label htmlFor="skillLevel">Skill Level</Label>
          <Select 
            value={skillLevel} 
            onValueChange={setSkillLevel}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Select your skill level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="BEGINNER">Beginner</SelectItem>
              <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
              <SelectItem value="ADVANCED">Advanced</SelectItem>
              <SelectItem value="PRO">Pro</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button type="submit" className="w-full">
          Create Account
        </Button>
      </form>

      <div className="text-center mt-4">
        <Link href="/login" className="text-sm text-blue-600 hover:underline">
          Already have an account? Login
        </Link>
      </div>
    </div>
  )
}