// src/app/api/events/route.ts

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    // Get all events with their courts
    const events = await prisma.event.findMany({
      include: {
        courts: {
          include: {
            court: {
              select: {
                id: true,
                name: true,
                is_indoor: true
              }
            }
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });
    
    return NextResponse.json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Check if user is an admin
    if (session.user.role !== 'ADMIN' && session.user.role !== 'COURT_MANAGER') {
      return NextResponse.json({ 
        error: 'Only administrators and court managers can create events' 
      }, { status: 403 });
    }
    
    const { 
      title, 
      eventType, 
      minSkillLevel, 
      maxSkillLevel,
      maxPlayers,
      notes,
      courtIds, // Now an array of court IDs
      start,
      end
    } = await request.json();
    
    // Basic validation
    if (!title || !courtIds || courtIds.length === 0 || !start || !end) {
      return NextResponse.json({ 
        error: 'Missing required fields' 
      }, { status: 400 });
    }
    
    // Create the event with multiple courts
    const event = await prisma.event.create({
      data: {
        title,
        type: eventType,
        min_skill: minSkillLevel,
        max_skill: maxSkillLevel,
        max_players: maxPlayers,
        notes,
        start: new Date(start),
        end: new Date(end),
        courts: {
          create: courtIds.map((courtId: string) => ({
            court: { connect: { id: courtId } }
          }))
        },
        user: { connect: { id: session.user.id } },
        is_bookable: true,
        current_players: 0
      },
      include: {
        courts: {
          include: {
            court: true
          }
        }
      }
    });
    
    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error('Error creating event:', error);
    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 });
  }
}