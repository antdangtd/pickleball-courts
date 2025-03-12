// src/components/ResponsesList.tsx
import { useState, useEffect } from 'react'
import { 
  Dialog, DialogContent, DialogHeader, 
  DialogTitle, DialogFooter 
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

export default function ResponsesList({ open, onClose, listingId, onUpdate }) {
  const [responses, setResponses] = useState([])
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState(null)
  
  useEffect(() => {
    // Only fetch when the dialog is open and a listingId is provided
    if (open && listingId) {
      fetchResponses()
    }
  }, [open, listingId])
  
  const fetchResponses = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/players/listings/${listingId}/responses`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch responses')
      }
      
      const data = await response.json()
      setResponses(data)
    } catch (error) {
      console.error('Error fetching responses:', error)
      toast.error('Failed to load responses')
    } finally {
      setLoading(false)
    }
  }
  
  const handleStatusUpdate = async (responseId, status) => {
    setProcessingId(responseId)
    
    try {
      const response = await fetch(`/api/players/listings/${listingId}/responses/${responseId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      })
      
      if (!response.ok) {
        throw new Error(`Failed to ${status.toLowerCase()} response`)
      }
      
      // Update the local state
      setResponses(prevResponses => 
        prevResponses.map(r => 
          r.id === responseId ? { ...r, status } : r
        )
      )
      
      toast.success(`Response ${status.toLowerCase()}`)
      
      // Refresh the parent component
      if (onUpdate) {
        onUpdate()
      }
    } catch (error) {
      console.error('Error updating response:', error)
      toast.error(`Failed to ${status.toLowerCase()} response`)
    } finally {
      setProcessingId(null)
    }
  }
  
  const formatSkillLevel = (level) => {
    if (!level) return 'Not specified'
    
    return level.replace('_', ' ').replace(/_/g, '.')
  }
  
  const getStatusBadge = (status) => {
    switch (status) {
      case 'ACCEPTED':
        return <Badge className="bg-green-500">Accepted</Badge>
      case 'DECLINED':
        return <Badge className="bg-red-500">Declined</Badge>
      default:
        return <Badge>Pending</Badge>
    }
  }
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Listing Responses</DialogTitle>
        </DialogHeader>
        
        {loading ? (
          <div className="py-6 text-center">Loading responses...</div>
        ) : responses.length === 0 ? (
          <div className="py-6 text-center">No responses yet.</div>
        ) : (
          <div className="space-y-4 max-h-[60vh] overflow-y-auto py-2">
            {responses.map((response) => (
              <div key={response.id} className="p-4 border rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-medium">{response.user.name}</h3>
                    <p className="text-sm text-gray-500">
                      Skill: {formatSkillLevel(response.user.skill_level)}
                    </p>
                  </div>
                  {getStatusBadge(response.status)}
                </div>
                
                {response.message && (
                  <p className="text-sm my-2">{response.message}</p>
                )}
                
                <Separator className="my-3" />
                
                <div className="flex justify-end space-x-2">
                  {response.status === 'PENDING' && (
                    <>
                      <Button 
                        variant="outline" 
                        size="sm"
                        disabled={!!processingId}
                        onClick={() => handleStatusUpdate(response.id, 'DECLINED')}
                      >
                        {processingId === response.id ? 'Processing...' : 'Decline'}
                      </Button>
                      <Button 
                        size="sm"
                        disabled={!!processingId}
                        onClick={() => handleStatusUpdate(response.id, 'ACCEPTED')}
                      >
                        {processingId === response.id ? 'Processing...' : 'Accept'}
                      </Button>
                    </>
                  )}
                  
                  {response.status !== 'PENDING' && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      disabled={!!processingId}
                      onClick={() => handleStatusUpdate(response.id, 'PENDING')}
                    >
                      {processingId === response.id ? 'Processing...' : 'Reset Status'}
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        
        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}