// src/components/admin/CourtManagement.tsx
// This file contains the CourtManagement component. The component fetches and displays a list of courts and allows admins to add new courts or edit existing ones.

'use client'

import { useState, useEffect } from 'react'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter 
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"

interface Court {
  id?: string
  name: string
  description?: string
  is_indoor: boolean
  capacity: number
  active: boolean
}

export function CourtManagement() {
  const [courts, setCourts] = useState<Court[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentCourt, setCurrentCourt] = useState<Partial<Court>>({
    name: '',
    description: '',
    is_indoor: false,
    capacity: 4,
    active: true
  })

  // Fetch courts
  useEffect(() => {
    async function fetchCourts() {
      try {
        setIsLoading(true)
        const response = await fetch('/api/admin/courts')
        
        if (!response.ok) {
          throw new Error('Failed to fetch courts')
        }
        
        const data = await response.json()
        setCourts(data)
        setIsLoading(false)
      } catch (error) {
        console.error('Error fetching courts:', error)
        toast.error('Failed to load courts')
        setIsLoading(false)
      }
    }

    fetchCourts()
  }, [])

  // Handle adding/editing a court
  const handleSaveCourt = async () => {
    try {
      const url = currentCourt.id 
        ? `/api/admin/courts/${currentCourt.id}` 
        : '/api/admin/courts'
      
      const method = currentCourt.id ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(currentCourt)
      })

      if (!response.ok) {
        throw new Error('Failed to save court')
      }

      const savedCourt = await response.json()

      if (currentCourt.id) {
        // Update existing court
        setCourts(prevCourts => 
          prevCourts.map(court => 
            court.id === savedCourt.id ? savedCourt : court
          )
        )
      } else {
        // Add new court
        setCourts(prevCourts => [...prevCourts, savedCourt])
      }

      // Close modal and reset
      setIsModalOpen(false)
      setCurrentCourt({
        name: '',
        description: '',
        is_indoor: false,
        capacity: 4,
        active: true
      })

      toast.success('Court saved successfully')
    } catch (error) {
      console.error('Error saving court:', error)
      toast.error('Failed to save court')
    }
  }

  // Open modal for editing
  const handleEditCourt = (court: Court) => {
    setCurrentCourt(court)
    setIsModalOpen(true)
  }

  // Open modal for new court
  const handleAddNewCourt = () => {
    setCurrentCourt({
      name: '',
      description: '',
      is_indoor: false,
      capacity: 4,
      active: true
    })
    setIsModalOpen(true)
  }

  if (isLoading) {
    return <div>Loading courts...</div>
  }

  return (
    <>
      <div className="mb-4">
        <Button onClick={handleAddNewCourt}>
          Add New Court
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Capacity</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {courts.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-4">
                No courts found. Add your first court!
              </TableCell>
            </TableRow>
          ) : (
            courts.map((court) => (
              <TableRow key={court.id}>
                <TableCell>{court.name}</TableCell>
                <TableCell>{court.description || 'N/A'}</TableCell>
                <TableCell>{court.is_indoor ? 'Indoor' : 'Outdoor'}</TableCell>
                <TableCell>{court.capacity}</TableCell>
                <TableCell>{court.active ? 'Active' : 'Inactive'}</TableCell>
                <TableCell>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleEditCourt(court)}
                  >
                    Edit
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {currentCourt.id ? 'Edit Court' : 'Add New Court'}
            </DialogTitle>
            <DialogDescription>
              Configure court details
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Court Name</Label>
              <Input
                value={currentCourt.name}
                onChange={(e) => setCurrentCourt(prev => ({
                  ...prev,
                  name: e.target.value
                }))}
                placeholder="Enter court name"
              />
            </div>

            <div>
              <Label>Description</Label>
              <Input
                value={currentCourt.description}
                onChange={(e) => setCurrentCourt(prev => ({
                  ...prev,
                  description: e.target.value
                }))}
                placeholder="Optional court description"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_indoor"
                checked={currentCourt.is_indoor}
                onCheckedChange={(checked) => setCurrentCourt(prev => ({
                  ...prev,
                  is_indoor: !!checked
                }))}
              />
              <Label htmlFor="is_indoor">Indoor Court?</Label>
            </div>

            <div>
              <Label>Court Capacity</Label>
              <Input
                type="number"
                value={currentCourt.capacity}
                onChange={(e) => setCurrentCourt(prev => ({
                  ...prev,
                  capacity: parseInt(e.target.value) || 4
                }))}
                min={1}
                max={10}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="active"
                checked={currentCourt.active}
                onCheckedChange={(checked) => setCurrentCourt(prev => ({
                  ...prev,
                  active: !!checked
                }))}
              />
              <Label htmlFor="active">Court Active?</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveCourt}>
              Save Court
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}