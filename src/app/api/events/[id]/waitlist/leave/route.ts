// src/app/api/events/[id]/waitlist/leave/route.ts

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const eventId = params.id;
    const userId = session.user.id;
    
    // Check if entry exists on waitlist
    const waitlistEntry = await prisma.eventWaitlist.findUnique({
      where: {
        userId_eventId: {
          userId,
          eventId
        }
      }
    });
    
    if (!waitlistEntry) {
      return NextResponse.json(
        { error: 'You are not on the waitlist for this event' }, 
        { status: 404 }
      );
    }
    
    // Remove user from waitlist
    await prisma.eventWaitlist.delete({
      where: {
        userId_eventId: {
          userId,
          eventId
        }
      }
    });
    
    return NextResponse.json({ message: 'Successfully left waitlist' });
  } catch (error) {
    console.error('Error leaving waitlist:', error);
    return NextResponse.json(
      { error: 'Failed to leave waitlist' }, 
      { status: 500 }
    );
  }
}