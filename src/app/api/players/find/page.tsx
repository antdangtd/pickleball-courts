// src/app/players/find/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { 
  Card, CardHeader, CardTitle, 
  CardDescription, CardContent, CardFooter 
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Select, SelectContent, SelectItem, 
  SelectTrigger, SelectValue 
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import PlayerListingForm from '@/components/PlayerListingForm'

export default function PlayerFinderPage() {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      redirect('/login')
    }
  })
  
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [skillFilter, setSkillFilter] = useState('')
  const [showForm, setShowForm] = useState(false)
  
  // Fetch player listings
  const fetchListings = async () => {
    setLoading(true)
    try {
      let url = '/api/players/listings'
      if (skillFilter) {
        url += `?minSkill=${skillFilter}`
      }
      
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error('Failed to fetch listings')
      }
      
      const data = await response.json()
      setListings(data)
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to load player listings')
    } finally {
      setLoading(false)
    }
  }
  
  useEffect(() => {
    if (session) {
      fetchListings()
    }
  }, [session, skillFilter])
  
  const handleRespond = async (listingId) => {
    try {
      const response = await fetch(`/api/players/listings/${listingId}/respond`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: `I'd like to play with you! My skill level is ${session?.user?.skillLevel || 'not specified'}.`
        })
      })
      
      if (!response.ok) {
        throw new Error('Failed to send response')
      }
      
      toast.success('Response sent successfully!')
      fetchListings() // Refresh the listings
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to send response')
    }
  }
  
  const formatSkillLevel = (level) => {
    if (!level) return 'Any Level'
    
    return level.replace('_', ' ').replace(/_/g, '.')
  }
  
  if (status === "loading") {
    return <div className="container mx-auto p-6">Loading...</div>
  }
  
  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Find Players</h1>
          <p className="text-gray-500">Connect with other players for games</p>
        </div>
        
        <Button onClick={() => setShowForm(true)}>
          Create Listing
        </Button>
      </div>
      
      {/* Filter controls */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="skillFilter">Filter by Skill Level</Label>
              <Select value={skillFilter} onValueChange={setSkillFilter}>
                <SelectTrigger id="skillFilter">
                  <SelectValue placeholder="Any Skill Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Any Skill Level</SelectItem>
                  <SelectItem value="BEGINNER_2_0">2.0 Beginner</SelectItem>
                  <SelectItem value="BEGINNER_2_5">2.5 Beginner</SelectItem>
                  <SelectItem value="INTERMEDIATE_3_0">3.0 Intermediate</SelectItem>
                  <SelectItem value="INTERMEDIATE_3_5">3.5 Intermediate</SelectItem>
                  <SelectItem value="ADVANCED_4_0">4.0 Advanced</SelectItem>
                  <SelectItem value="ADVANCED_4_5">4.5 Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="self-end">
              <Button variant="outline" onClick={fetchListings}>
                Refresh
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Player listing form modal */}
      <PlayerListingForm 
        open={showForm} 
        onClose={() => setShowForm(false)}
        onCreated={() => {
          setShowForm(false)
          fetchListings()
        }}
      />
      
      {/* Listings */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <p>Loading listings...</p>
        ) : listings.length === 0 ? (
          <p>No player listings found. Create one to find players!</p>
        ) : (
          listings.map(listing => (
            <Card key={listing.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle>{listing.title}</CardTitle>
                  <Badge>{formatSkillLevel(listing.user.skill_level)}</Badge>
                </div>
                <CardDescription>{listing.timeSlot}</CardDescription>
              </CardHeader>
              
              <CardContent>
                <p className="mb-2">{listing.description || 'No description provided.'}</p>
                
                <div className="text-sm mt-4">
                  <p>
                    <span className="font-medium">Player: </span>
                    {listing.user.name}
                  </p>
                  
                  {listing.minSkill && listing.maxSkill && (
                    <p>
                      <span className="font-medium">Looking for: </span>
                      {formatSkillLevel(listing.minSkill)} to {formatSkillLevel(listing.maxSkill)}
                    </p>
                  )}
                </div>
              </CardContent>
              
              <CardFooter>
                {listing.responses.length > 0 ? (
                  <Button variant="outline" disabled>
                    Response Sent
                  </Button>
                ) : (
                  <Button onClick={() => handleRespond(listing.id)}>
                    I'm Interested
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}