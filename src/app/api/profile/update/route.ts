//src/app/api/profile/update/route.ts
// This file contains the profile update API route. The route updates the user's profile with a new name, bio, skill level, phone, and address.

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Parse the incoming JSON payload only once
    const updateData = await request.json()
    const { 
      name,
      email,
      username, 
      bio, 
      skillLevel, 
      phone, 
      address,
      image
    } = updateData

    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        name,
        email,
        username,
        bio,
        skill_level: skillLevel,
        phone,
        address,
        image,
      }
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error('Profile update error:', error)
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
  }
}
