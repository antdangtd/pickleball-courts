//src/app/api/admin/UserEditModal.tsx
// This file contains the modal component for editing user details. The modal is used in the admin dashboard to update user information.


'use client'

import { useState, useEffect } from 'react'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

interface User {
  id: string
  name: string | null
  email: string
  role: string
  skill_level: string
}

interface UserEditModalProps {
  user: User | null
  isOpen: boolean
  onClose: () => void
  onUpdate: (updatedUser: Partial<User>) => void
}

export function UserEditModal({ 
  user, 
  isOpen, 
  onClose, 
  onUpdate 
}: UserEditModalProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('')
  const [skillLevel, setSkillLevel] = useState('')

  // Update local state when user changes
  useEffect(() => {
    if (user) {
      setName(user.name || '')
      setEmail(user.email)
      setRole(user.role)
      setSkillLevel(user.skill_level)
    }
  }, [user])

  const handleSubmit = async () => {
    if (!user) return

    try {
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          role,
          skillLevel
        })
      })

      if (response.ok) {
        const updatedUser = await response.json()
        onUpdate(updatedUser)
        toast.success('User updated successfully')
        onClose()
      } else {
        const errorData = await response.json()
        toast.error('Failed to update user', {
          description: errorData.error || 'An unexpected error occurred'
        })
      }
    } catch (error) {
      console.error('User update error:', error)
      toast.error('Failed to update user')
    }
  }

  if (!user) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
          <DialogDescription>
            Update user details
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="User's name"
            />
          </div>

          <div>
            <Label>Email</Label>
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="User's email"
              type="email"
            />
          </div>

          <div>
            <Label>Role</Label>
            <Select 
              value={role} 
              onValueChange={setRole}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select user role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USER">User</SelectItem>
                <SelectItem value="ADMIN">Admin</SelectItem>
                <SelectItem value="COURT_MANAGER">Court Manager</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Skill Level</Label>
            <Select 
              value={skillLevel} 
              onValueChange={setSkillLevel}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select skill level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BEGINNER">Beginner</SelectItem>
                <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                <SelectItem value="ADVANCED">Advanced</SelectItem>
                <SelectItem value="PRO">Pro</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}