'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useSession } from "next-auth/react"
import Image from 'next/image'

export default function ProfilePage() {
  const { data: session } = useSession()
  const [name, setName] = useState('')
  const [skillLevel, setSkillLevel] = useState('')
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    if (session?.user) {
      setName(session.user.name || '')
      // Assuming skill level is part of user object
      // You might need to adjust this based on your actual session data
      setSkillLevel(session.user.skillLevel || 'BEGINNER')
    }
  }, [session])

  const handleSaveProfile = async () => {
    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          skillLevel
        })
      })

      if (response.ok) {
        setIsEditing(false)
        // Optionally update session or show success message
      } else {
        // Handle error
        console.error('Failed to update profile')
      }
    } catch (error) {
      console.error('Profile update error:', error)
    }
  }

  if (!session) {
    return (
      <div className="text-center mt-10">
        <p>Please log in to view your profile</p>
      </div>
    )
  }

  return (
    <div className="max-w-xl mx-auto mt-10">
      <Card>
        <CardHeader>
          <CardTitle>My Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-6 mb-6">
            {session.user?.image && (
              <Image 
                src={session.user.image} 
                alt="Profile Picture" 
                width={100} 
                height={100} 
                className="rounded-full"
              />
            )}
            <div>
              <h2 className="text-xl font-semibold">
                {isEditing ? (
                  <Input 
                    value={name} 
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your Name"
                  />
                ) : (
                  session.user?.name
                )}
              </h2>
              <p className="text-muted-foreground">
                {session.user?.email}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label>Skill Level</Label>
              {isEditing ? (
                <Select 
                  value={skillLevel} 
                  onValueChange={setSkillLevel}
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
              ) : (
                <p>{skillLevel}</p>
              )}
            </div>

            <div className="flex space-x-4">
              {isEditing ? (
                <>
                  <Button onClick={handleSaveProfile}>Save Profile</Button>
                  <Button 
                    variant="secondary" 
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </Button>
                </>
              ) : (
                <Button onClick={() => setIsEditing(true)}>
                  Edit Profile
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}