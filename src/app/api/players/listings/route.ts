// src/app/api/players/listings/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions, isAdmin } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Add detailed logging
    console.log('User making request:', {
      id: session.user.id,
      email: session.user.email,
      role: session.user.role,
      skill_level: session.user.skill_level
    });
    
    // Get query parameters
    const url = new URL(request.url);
    const minSkill = url.searchParams.get('minSkill');
    const maxSkill = url.searchParams.get('maxSkill');
    
    // Build filter conditions
    let whereClause: any = { active: true };
    
    // Only admins can see all listings, regular users only see others' listings
    if (session.user.role !== 'ADMIN') {
      whereClause.userId = { not: session.user.id };
    }
    
    // Log the where clause before skill filtering
    console.log('Initial where clause:', whereClause);
    
    // Add skill filters if provided
    if (minSkill && minSkill !== 'any') {
      // If user specifies minSkill filter, find listings where maxSkill is at least this level
      // (i.e., the listing accepts players up to at least this skill level)
      whereClause.maxSkill = { gte: minSkill };
    }
    
    if (maxSkill && maxSkill !== 'any') {
      // If user specifies maxSkill filter, find listings where minSkill is at most this level
      // (i.e., the listing accepts players down to at most this skill level)
      whereClause.minSkill = { lte: maxSkill };
    }
    
    // Log the final where clause
    console.log('Final where clause:', whereClause);
    
    const listings = await prisma.playerListing.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            skill_level: true,
          }
        },
        responses: {
          where: {
            userId: session.user.id
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    // Log the result
    console.log(`Found ${listings.length} listings`);
    
    return NextResponse.json(listings);
  } catch (error) {
    console.error('Error fetching player listings:', error);
    return NextResponse.json({ error: 'Failed to fetch listings' }, { status: 500 });
  }
}