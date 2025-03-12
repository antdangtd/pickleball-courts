// src/app/api/players/listings/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get query parameters
    const url = new URL(request.url);
    const minSkill = url.searchParams.get('minSkill');
    const maxSkill = url.searchParams.get('maxSkill');
    const viewMode = url.searchParams.get('viewMode') || 'all'; // 'all', 'mine', 'community'
    
    console.log('API: Request params:', { viewMode, minSkill, maxSkill });
    
    // Build filter conditions based on viewMode
    let whereClause: any = { active: true };
    
    // Filter by listings ownership
    if (viewMode === 'mine') {
      // Show only the user's own listings
      whereClause.userId = session.user.id;
    } else if (viewMode === 'community') {
      // Show only other users' listings
      whereClause.userId = { not: session.user.id };
    }
    // If viewMode is 'all', we don't add a userId filter
    
    // Add skill filters if provided
    if (minSkill && minSkill !== 'any') {
      whereClause.OR = [
        { maxSkill: { gte: minSkill } },
        { maxSkill: null }
      ];
    }
    
    if (maxSkill && maxSkill !== 'any') {
      whereClause.OR = [
        ...(whereClause.OR || []),
        { minSkill: { lte: maxSkill } },
        { minSkill: null }
      ];
    }
    
    console.log('API: Final where clause:', JSON.stringify(whereClause));
    
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
        },
        _count: {
          select: {
            responses: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    // Add ownership flag to each listing
    const listingsWithOwnership = listings.map(listing => ({
      ...listing,
      isOwner: listing.userId === session.user.id
    }));
    
    return NextResponse.json(listingsWithOwnership);
  } catch (error) {
    console.error('API Error fetching player listings:', error);
    return NextResponse.json({ error: 'Failed to fetch listings' }, { status: 500 });
  }
}