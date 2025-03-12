// src/app/api/players/listings/[id]/respond/route.ts
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
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const id = params.id;
    const { message } = await request.json();
    
    // Check if listing exists
    const listing = await prisma.playerListing.findUnique({
      where: { id }
    });
    
    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }
    
    // Check if user has already responded
    const existingResponse = await prisma.playerResponse.findFirst({
      where: {
        listingId: id,
        userId: session.user.id
      }
    });
    
    if (existingResponse) {
      return NextResponse.json(
        { error: 'You have already responded to this listing' }, 
        { status: 400 }
      );
    }
    
    // Create response
    const response = await prisma.playerResponse.create({
      data: {
        message,
        listingId: id,
        userId: session.user.id
      }
    });
    
    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('Error responding to listing:', error);
    return NextResponse.json({ error: 'Failed to respond to listing' }, { status: 500 });
  }
}