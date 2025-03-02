import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function PUT(
  request: NextRequest, 
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    // Ensure only admins can access
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { id } = params
    const { name, description, is_indoor, capacity, active } = await request.json()

    const updatedCourt = await prisma.court.update({
      where: { id },
      data: {
        name,
        description,
        is_indoor,
        capacity,
        active
      }
    })

    return NextResponse.json(updatedCourt)
  } catch (error) {
    console.error('Error updating court:', error)
    return NextResponse.json({ error: 'Failed to update court' }, { status: 500 })
  }
}