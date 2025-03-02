//src/app/api/profile/complete/route.ts
// This file contains the profile completion API route. The route updates the user's profile with a new skill level.

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    // Verify server-side session
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' }, 
        { status: 401 }
      )
    }

    const { username, bio, skillLevel } = await request.json()

    // Validate input
    if (!skillLevel) {
      return NextResponse.json(
        { error: 'Skill level is required' }, 
        { status: 400 }
      )
    }

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { email: session.user.email! },
      data: {
        username,
        bio,
        skill_level: skillLevel
      }
    })

    return NextResponse.json(updatedUser, { status: 200 })
  } catch (error) {
    console.error('Profile completion error:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}