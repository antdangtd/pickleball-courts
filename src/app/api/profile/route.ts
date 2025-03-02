// src/app/api/profile/route.ts
// This file contains the profile API route. The route fetches the user's profile from the database.

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email! }
    })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    return NextResponse.json(user, { status: 200 })
  } catch (error) {
    console.error('Error fetching profile:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const { skillLevel } = await request.json()
    if (!skillLevel) {
      return NextResponse.json({ error: 'Skill level is required' }, { status: 400 })
    }
    const updatedUser = await prisma.user.update({
      where: { email: session.user.email! },
      data: { skill_level: skillLevel }
    })
    return NextResponse.json(updatedUser, { status: 200 })
  } catch (error) {
    console.error('Profile completion error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
