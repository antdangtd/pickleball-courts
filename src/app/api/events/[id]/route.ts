// src/app/api/events/[id]/route.ts
// This file contains the route to fetch event details by ID. It returns the event with participants and waitlist.

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Fixed: Don't use await on params and access id directly
    const id = params.id;
    
    // Fetch the event with participants and waitlist
    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                skill_level: true,
              }
            }
          }
        },
        waitlist: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                skill_level: true,
              }
            }
          },
          orderBy: {
            joinedAt: 'asc' // Order waitlist by join time
          }
        },
        court: true,
        courts: {
          include: {
            court: true
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
    
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }
    
    return NextResponse.json(event);
  } catch (error) {
    console.error('Error fetching event details:', error);
    return NextResponse.json({ error: 'Failed to fetch event details' }, { status: 500 });
  }
}