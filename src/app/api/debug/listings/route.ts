// src/app/api/debug/listings/route.ts
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
    
    // Only allow admins to access this debug endpoint
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }
    
    // Get all listings with their creators
    const allListings = await prisma.playerListing.findMany({
      include: {
        user: {
          select: {
            id: true, 
            name: true,
            role: true,
            skill_level: true,
          }
        },
        _count: {
          select: { responses: true }
        }
      }
    });
    
    // Count of total listings
    const totalCount = allListings.length;
    
    // Count of active listings
    const activeCount = allListings.filter(l => l.active).length;
    
    // Group by creator role
    const byRole = allListings.reduce((acc, listing) => {
      const role = listing.user.role;
      acc[role] = (acc[role] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return NextResponse.json({
      total: totalCount,
      active: activeCount,
      byRole,
      listings: allListings.map(l => ({
        id: l.id,
        title: l.title,
        active: l.active,
        createdAt: l.createdAt,
        minSkill: l.minSkill,
        maxSkill: l.maxSkill,
        creator: {
          id: l.user.id,
          name: l.user.name,
          role: l.user.role,
          skill_level: l.user.skill_level
        },
        responseCount: l._count.responses
      }))
    });
  } catch (error) {
    console.error('Error in debug endpoint:', error);
    return NextResponse.json({ error: 'Failed to fetch debug info' }, { status: 500 });
  }
}