//src/app/api/admin/bookings/route.ts
// This file contains the API route for fetching all bookings. The route is protected and only accessible to admin users.

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

function isAdmin(session: any): boolean {
  return session?.user?.role === 'ADMIN'
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    // Ensure only admins can access
    if (!session || !isAdmin(session)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const bookings = await prisma.booking.findMany({
      include: {
        court: {
          select: {
            name: true
          }
        },
        user: {
          select: {
            name: true
          }
        }
      }
    })

    return NextResponse.json(bookings)
  } catch (error) {
    console.error('Error fetching bookings:', error)
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 })
  }
}