// src/app/players/listings/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { 
  Card, CardHeader, CardTitle, 
  CardDescription, CardContent, CardFooter 
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import PlayerListingForm from '@/components/PlayerListingForm'
import ResponsesList from '@/components/ResponsesList'

export default function MyListingsPage() {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      redirect('/login')
    }
  })
  
  const [myListings, setMyListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [selectedListing, setSelectedListing] = useState(null)
  
  // Fetch user's listings
  const fetchMyListings = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/players/listings/my')
      if (!response.ok) {
        throw new Error('Failed to fetch listings')
      }
      
      const data = await response.json()
      setMyListings(data)
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to load your listings')
    } finally {
      setLoading(false)
    }
  }
  
  useEffect(() => {
    if (session) {
      fetchMyListings()
    }
  }, [session])
  
  const handleDeactivate = async (listingId) => {
    try {
      const response = await fetch(`/api/players/listings/${listingId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          active: false
        })
      })
      
      if (!response.ok) {
        throw new Error('Failed to deactivate listing')
      }
      
      toast.success('Listing deactivated')
      fetchMyListings() // Refresh the listings
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to deactivate listing')
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
          <h1 className="text-3xl font-bold">My Listings</h1>
          <p className="text-gray-500">Manage your player listings</p>
        </div>
        
        <Button onClick={() => setShowForm(true)}>
          Create Listing
        </Button>
      </div>
      
      {/* Player listing form modal */}
      <PlayerListingForm 
        open={showForm} 
        onClose={() => setShowForm(false)}
        onCreated={() => {
          setShowForm(false)
          fetchMyListings()
        }}
      />
      
      {/* Responses modal */}
      {selectedListing && (
        <ResponsesList
          open={!!selectedListing}
          onClose={() => setSelectedListing(null)}
          listingId={selectedListing}
          onUpdate={fetchMyListings}
        />
      )}
      
      {/* Listings */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <p>Loading your listings...</p>
        ) : myListings.length === 0 ? (
          <p>You haven't created any listings yet.</p>
        ) : (
          myListings.map(listing => (
            <Card key={listing.id} className={!listing.active ? 'opacity-60' : ''}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle>{listing.title}</CardTitle>
                  <Badge>{listing.active ? 'Active' : 'Inactive'}</Badge>
                </div>
                <CardDescription>{listing.timeSlot}</CardDescription>
              </CardHeader>
              
              <CardContent>
                <p className="mb-2">{listing.description || 'No description provided.'}</p>
                
                <div className="text-sm mt-4">
                  {listing.minSkill && listing.maxSkill && (
                    <p>
                      <span className="font-medium">Looking for: </span>
                      {formatSkillLevel(listing.minSkill)} to {formatSkillLevel(listing.maxSkill)}
                    </p>
                  )}
                  
                  <p className="mt-2">
                    <span className="font-medium">Responses: </span>
                    {listing._count?.responses || 0}
                  </p>
                </div>
              </CardContent>
              
              <CardFooter className="flex justify-between">
                <Button 
                  variant="outline" 
                  onClick={() => setSelectedListing(listing.id)}
                  disabled={listing._count?.responses === 0}
                >
                  View Responses
                </Button>
                
                {listing.active ? (
                  <Button 
                    variant="destructive" 
                    onClick={() => handleDeactivate(listing.id)}
                  >
                    Deactivate
                  </Button>
                ) : (
                  <Button disabled>Inactive</Button>
                )}
              </CardFooter>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}