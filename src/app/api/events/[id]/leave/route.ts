// src/app/api/events/[id]/leave/route.ts
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
    
    const id = params.id;
    const userId = session.user.id;
    
    // Check if user is a participant
    const participant = await prisma.eventParticipant.findUnique({
      where: {
        userId_eventId: {
          userId,
          eventId: id
        }
      }
    });
    
    if (!participant) {
      return NextResponse.json(
        { error: 'You are not a participant in this event' }, 
        { status: 404 }
      );
    }
    
    // Remove user from participants
    await prisma.eventParticipant.delete({
      where: {
        userId_eventId: {
          userId,
          eventId: id
        }
      }
    });
    
    // Update current_players count
    await prisma.event.update({
      where: { id },
      data: {
        current_players: {
          decrement: 1
        }
      }
    });
    
    // Check if there are users on the waitlist
    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        waitlist: {
          orderBy: {
            joinedAt: 'asc'
          },
          take: 1,
          include: {
            user: true
          }
        }
      }
    });
    
    // If there's someone on the waitlist, notify them (in a real app)
    if (event?.waitlist.length > 0) {
      const nextUser = event.waitlist[0];
      console.log(`Notifying ${nextUser.user.name} that a spot is available`);
      // In a real app, you'd send an email or notification here
    }
    
    return NextResponse.json({ message: 'Successfully left event' });
  } catch (error) {
    console.error('Error leaving event:', error);
    return NextResponse.json({ error: 'Failed to leave event' }, { status: 500 });
  }
}