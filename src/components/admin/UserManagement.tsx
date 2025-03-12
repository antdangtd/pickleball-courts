// src/components/admin/UserManagement.tsx
'use client'

import { useState, useEffect } from 'react'
import { 
  Table, TableBody, TableCell, 
  TableHead, TableHeader, TableRow 
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Dialog, DialogContent, DialogHeader, 
  DialogTitle, DialogFooter 
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { 
  Select, SelectContent, SelectItem, 
  SelectTrigger, SelectValue 
} from '@/components/ui/select'
import { toast } from 'sonner'

export function UserManagement() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddUser, setShowAddUser] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'USER',
    skill_level: 'BEGINNER_2_0'
  })

  // Fetch users
  const fetchUsers = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/users')
      if (!response.ok) {
        throw new Error('Failed to fetch users')
      }
      
      const data = await response.json()
      setUsers(data)
    } catch (error) {
      console.error('Error fetching users:', error)
      toast.error('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  // Handle select changes
  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })
      
      if (!response.ok) {
        throw new Error('Failed to create user')
      }
      
      toast.success('User created successfully')
      setShowAddUser(false)
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'USER',
        skill_level: 'BEGINNER_2_0'
      })
      fetchUsers() // Refresh the user list
    } catch (error) {
      console.error('Error creating user:', error)
      toast.error('Failed to create user')
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">User Management</h2>
        <Button onClick={() => setShowAddUser(true)}>Add User</Button>
      </div>

      {loading ? (
        <p>Loading users...</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Skill Level</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">No users found</TableCell>
              </TableRow>
            ) : (
              users.map(user => (
                <TableRow key={user.id}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>{user.skill_level}</TableCell>
                  <TableCell>
                    {/* We'll implement these in a future update */}
                    <Button variant="outline" size="sm" className="mr-2">Edit</Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      )}

      {/* Add User Dialog */}
      <Dialog open={showAddUser} onOpenChange={setShowAddUser}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="role">Role</Label>
              <Select
                value={formData.role}
                onValueChange={(value) => handleSelectChange('role', value)}
              >
                <SelectTrigger id="role">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USER">User</SelectItem>
                  <SelectItem value="COURT_MANAGER">Court Manager</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="skill_level">Skill Level</Label>
              <Select
                value={formData.skill_level}
                onValueChange={(value) => handleSelectChange('skill_level', value)}
              >
                <SelectTrigger id="skill_level">
                  <SelectValue placeholder="Select skill level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BEGINNER_2_0">2.0 Beginner</SelectItem>
                  <SelectItem value="BEGINNER_2_5">2.5 Beginner</SelectItem>
                  <SelectItem value="INTERMEDIATE_3_0">3.0 Intermediate</SelectItem>
                  <SelectItem value="INTERMEDIATE_3_5">3.5 Intermediate</SelectItem>
                  <SelectItem value="ADVANCED_4_0">4.0 Advanced</SelectItem>
                  <SelectItem value="ADVANCED_4_5">4.5 Advanced</SelectItem>
                  <SelectItem value="TOURNAMENT_5_0">5.0 Tournament</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowAddUser(false)}>
                Cancel
              </Button>
              <Button type="submit">Create User</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}