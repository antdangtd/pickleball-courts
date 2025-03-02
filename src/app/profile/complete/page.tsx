//src/app/profile/complete/page.tsx
// This file contains the profile completion page component. The component includes a form for users to enter their skill level to complete their profile. The component also includes a button to submit the form.

// src/app/profile/complete/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface ProfileData {
  name: string
  email: string
  username: string
  bio: string
  skillLevel: string
  phone: string
  address: string
  image: string
}

export default function CompleteProfilePage() {
  const { data: session, update } = useSession()
  const [profileData, setProfileData] = useState<ProfileData>({
    name: session?.user?.name || '',
    email: session?.user?.email || '',
    username: '',
    bio: '',
    skillLevel: session?.user?.skillLevel || 'BEGINNER',
    phone: '',
    address: '',
    image: session?.user?.image || ''
  })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const router = useRouter()

  // Fetch existing profile data on component mount
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const response = await fetch('/api/profile')
        if (response.ok) {
          const data = await response.json()
          setProfileData(prevData => ({
            ...prevData,
            ...data,
            skillLevel: data.skill_level || prevData.skillLevel
          }))
        }
      } catch (error) {
        console.error('Failed to fetch profile data', error)
      }
    }

    if (session?.user?.email) {
      fetchProfileData()
    }
  }, [session])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      // Handle file upload if a file is selected
      let imageUrl = profileData.image
      if (selectedFile) {
        const formData = new FormData()
        formData.append('file', selectedFile)
        
        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        })

        if (uploadResponse.ok) {
          const uploadResult = await uploadResponse.json()
          imageUrl = uploadResult.url
        }
      }

      // Prepare data for update
      const updateData = {
        ...profileData,
        image: imageUrl,
        skillLevel: profileData.skillLevel
      }

      // Update profile
      const response = await fetch('/api/profile/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData)
      })

      const result = await response.json()

      if (response.ok) {
        // Update session if name or email changes
        await update({
          name: updateData.name,
          email: updateData.email,
          image: updateData.image
        })

        toast.success('Profile Updated', {
          description: 'Your profile has been successfully updated'
        })
        router.push('/dashboard')
      } else {
        toast.error('Update Failed', {
          description: result.error || 'Could not update profile'
        })
      }
    } catch (error) {
      console.error('Profile update error:', error)
      toast.error('Update Failed', {
        description: 'An unexpected error occurred'
      })
    }
  }

  return (
    <div className="container mx-auto max-w-xl py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-center">Complete Your Profile</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Profile Photo Upload */}
          <div className="flex flex-col items-center mb-6">
            <Avatar className="w-24 h-24 mb-4">
              <AvatarImage 
                src={selectedFile 
                  ? URL.createObjectURL(selectedFile) 
                  : (profileData.image || '/default-avatar.png')
                } 
                alt="Profile Photo" 
              />
              <AvatarFallback>
                {profileData.name?.charAt(0) || ''}
              </AvatarFallback>
            </Avatar>
            <input 
              type="file" 
              accept="image/*"
              onChange={handleFileChange}
              className="mt-2"
            />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <Label>Name</Label>
              <Input
                name="name"
                value={profileData.name}
                onChange={handleInputChange}
                placeholder="Your full name"
                required
              />
            </div>

            {/* Email */}
            <div>
              <Label>Email</Label>
              <Input
                name="email"
                type="email"
                value={profileData.email}
                onChange={handleInputChange}
                placeholder="Your email address"
                required
              />
            </div>

            {/* Username */}
            <div>
              <Label>Username</Label>
              <Input
                name="username"
                value={profileData.username}
                onChange={handleInputChange}
                placeholder="Choose a unique username"
              />
            </div>

            {/* Bio */}
            <div>
              <Label>Bio</Label>
              <Textarea
                name="bio"
                value={profileData.bio}
                onChange={handleInputChange}
                placeholder="Tell us a bit about yourself"
                rows={4}
              />
            </div>

            {/* Skill Level */}
            <div>
              <Label>Skill Level</Label>
              <Select 
                value={profileData.skillLevel} 
                onValueChange={(value) => setProfileData(prev => ({
                  ...prev,
                  skillLevel: value
                }))}
                disabled
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

            {/* Phone */}
            <div>
              <Label>Phone Number</Label>
              <Input
                name="phone"
                value={profileData.phone}
                onChange={handleInputChange}
                placeholder="Enter your phone number"
                type="tel"
              />
            </div>

            {/* Address */}
            <div>
              <Label>Address</Label>
              <Input
                name="address"
                value={profileData.address}
                onChange={handleInputChange}
                placeholder="Enter your address"
              />
            </div>

            <Button type="submit" className="w-full">
              Update Profile
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}