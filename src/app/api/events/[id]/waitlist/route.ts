// src/app/api/events/[id]/waitlist/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        waitlist: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                skill_level: true
              }
            }
          },
          orderBy: {
            joinedAt: 'asc'
          }
        }
      }
    });

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    return NextResponse.json(event.waitlist);
  } catch (error) {
    console.error('Error fetching waitlist:', error);
    return NextResponse.json({ error: 'Failed to fetch waitlist' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const id = params.id;
    const userId = session.user.id;
    
    // Check if event exists
    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        participants: true,
        waitlist: true
      }
    });
    
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }
    
    // Check if user is already a participant
    const isParticipant = event.participants.some((p: { userId: string }) => p.userId === userId);
    if (isParticipant) {
      return NextResponse.json(
        { error: 'You are already a participant in this event' }, 
        { status: 400 }
      );
    }
    
    // Check if user is already on the waitlist
    const isOnWaitlist = event.waitlist.some((w: { userId: string }) => w.userId === userId);
    if (isOnWaitlist) {
      return NextResponse.json(
        { error: 'You are already on the waitlist for this event' }, 
        { status: 400 }
      );
    }
    
    // Add user to waitlist
    const waitlistEntry = await prisma.eventWaitlist.create({
      data: {
        userId,
        eventId: id
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });
    
    return NextResponse.json(waitlistEntry);
  } catch (error) {
    console.error('Error adding to waitlist:', error);
    return NextResponse.json(
      { error: 'Failed to add to waitlist' }, 
      { status: 500 }
    );
  }
}