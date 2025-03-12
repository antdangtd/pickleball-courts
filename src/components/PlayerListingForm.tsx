// src/components/PlayerListingForm.tsx
import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { 
  Dialog, DialogContent, DialogHeader, 
  DialogTitle, DialogDescription, DialogFooter 
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { 
  Select, SelectContent, SelectItem, 
  SelectTrigger, SelectValue 
} from '@/components/ui/select'
import { toast } from 'sonner'

const TIME_SLOTS = [
  { id: 'weekday_morning', label: 'Weekday Mornings' },
  { id: 'weekday_afternoon', label: 'Weekday Afternoons' },
  { id: 'weekday_evening', label: 'Weekday Evenings' },
  { id: 'weekend_morning', label: 'Weekend Mornings' },
  { id: 'weekend_afternoon', label: 'Weekend Afternoons' },
  { id: 'weekend_evening', label: 'Weekend Evenings' },
]

const SKILL_LEVELS = [
  { id: 'BEGINNER_2_0', label: '2.0 Beginner' },
  { id: 'BEGINNER_2_5', label: '2.5 Beginner' },
  { id: 'INTERMEDIATE_3_0', label: '3.0 Intermediate' },
  { id: 'INTERMEDIATE_3_5', label: '3.5 Intermediate' },
  { id: 'ADVANCED_4_0', label: '4.0 Advanced' },
  { id: 'ADVANCED_4_5', label: '4.5 Advanced' },
  { id: 'TOURNAMENT_5_0', label: '5.0 Tournament' },
]

export default function PlayerListingForm({ open, onClose, onCreated }) {
  const { data: session } = useSession()
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    timeSlot: '',
    minSkill: '',
    maxSkill: '',
  })
  const [loading, setLoading] = useState(false)
  
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }
  
  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    // Create a copy of the form data to modify
    const submitData = { ...formData }
    
    // Convert "any" values to null or empty string as needed by your API
    if (submitData.minSkill === 'any') submitData.minSkill = null
    if (submitData.maxSkill === 'any') submitData.maxSkill = null
    
    try {
      const response = await fetch('/api/players/listings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(submitData)
      })
      
      if (!response.ok) {
        throw new Error('Failed to create listing')
      }
      
      toast.success('Listing created successfully!')
      onCreated()
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to create listing')
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Player Listing</DialogTitle>
          <DialogDescription>
            Let others know you're looking for players to match with.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Looking for doubles partner"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Tell others about your play style, experience, etc."
              rows={3}
            />
          </div>
          
          <div>
            <Label htmlFor="timeSlot">When do you usually play?</Label>
            <Select
              value={formData.timeSlot}
              onValueChange={(value) => handleSelectChange('timeSlot', value)}
              required
            >
              <SelectTrigger id="timeSlot">
                <SelectValue placeholder="Select time slot" />
              </SelectTrigger>
              <SelectContent>
                {TIME_SLOTS.map(slot => (
                  <SelectItem key={slot.id} value={slot.id}>
                    {slot.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="minSkill">Minimum Skill Level</Label>
              <Select
                value={formData.minSkill}
                onValueChange={(value) => handleSelectChange('minSkill', value)}
              >
                <SelectTrigger id="minSkill">
                  <SelectValue placeholder="Any level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any level</SelectItem>
                  {SKILL_LEVELS.map(level => (
                    <SelectItem key={level.id} value={level.id}>
                      {level.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="maxSkill">Maximum Skill Level</Label>
              <Select
                value={formData.maxSkill}
                onValueChange={(value) => handleSelectChange('maxSkill', value)}
              >
                <SelectTrigger id="maxSkill">
                  <SelectValue placeholder="Any level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any level</SelectItem>
                  {SKILL_LEVELS.map(level => (
                    <SelectItem key={level.id} value={level.id}>
                      {level.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Listing'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}