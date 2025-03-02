// src/app/book/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { Calendar } from '@/components/Calendar'
import { BookingModal } from '@/components/BookingModal'

export default function BookingPage() {
  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      redirect('/login')
    }
  })
  
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  
  // Implementation details for booking flow
  
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Book a Court</h1>
      
      <Calendar 
        onEventSelect={(event) => {
          setSelectedEvent(event)
          setIsModalOpen(true)
        }}
        userSkillLevel={session?.user?.skillLevel}
      />
      
      {selectedEvent && (
        <BookingModal
          event={selectedEvent}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          userId={session?.user?.id}
        />
      )}
    </div>
  )
}