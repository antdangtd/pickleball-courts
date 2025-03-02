//src/app/admin/BookingManagement.tsx
// This file contains the booking management component for the admin dashboard. The component fetches a list of bookings from the API and displays them in a table with options to view booking details.


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
import { format } from 'date-fns'

interface Booking {
  id: string
  start_time: string
  end_time: string
  status: string
  court: {
    name: string
  }
  user: {
    name: string
  }
}

export function BookingManagement() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchBookings() {
      try {
        setIsLoading(true)
        const response = await fetch('/api/admin/bookings')
        
        if (!response.ok) {
          throw new Error('Failed to fetch bookings')
        }
        
        const data = await response.json()
        setBookings(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred')
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchBookings()
  }, [])

  if (isLoading) {
    return <div>Loading bookings...</div>
  }

  if (error) {
    return <div>Error: {error}</div>
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Start Time</TableHead>
          <TableHead>End Time</TableHead>
          <TableHead>Court</TableHead>
          <TableHead>Booked By</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {bookings.map((booking) => (
          <TableRow key={booking.id}>
            <TableCell>{format(new Date(booking.start_time), 'PPp')}</TableCell>
            <TableCell>{format(new Date(booking.end_time), 'PPp')}</TableCell>
            <TableCell>{booking.court.name}</TableCell>
            <TableCell>{booking.user.name}</TableCell>
            <TableCell>{booking.status}</TableCell>
            <TableCell>
              <Button variant="outline" size="sm">View</Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}