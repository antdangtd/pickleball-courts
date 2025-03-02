//src/app/api/admin/courts/route.ts
// This file contains the API route for fetching all courts. The route is protected and only accessible to admin users.


import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    // Ensure only admins can access
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const courts = await prisma.court.findMany()

    return NextResponse.json(courts)
  } catch (error) {
    console.error('Error fetching courts:', error)
    return NextResponse.json({ error: 'Failed to fetch courts' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    // Ensure only admins can access
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { name, description, is_indoor, capacity, active } = await request.json()

    const newCourt = await prisma.court.create({
      data: {
        name,
        description,
        is_indoor,
        capacity,
        active
      }
    })

    return NextResponse.json(newCourt, { status: 201 })
  } catch (error) {
    console.error('Error creating court:', error)
    return NextResponse.json({ error: 'Failed to create court' }, { status: 500 })
  }
}