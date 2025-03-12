// src/app/api/players/listings/[id]/responses/[responseId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string, responseId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { id, responseId } = params;
    const { status } = await request.json();
    
    if (!['PENDING', 'ACCEPTED', 'DECLINED'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }
    
    // Verify that the user owns the listing for this response
    const response = await prisma.playerResponse.findUnique({
      where: { id: responseId },
      include: {
        listing: {
          select: { userId: true }
        }
      }
    });
    
    if (!response) {
      return NextResponse.json({ error: 'Response not found' }, { status: 404 });
    }
    
    if (response.listing.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    
    // Update the response status
    const updatedResponse = await prisma.playerResponse.update({
      where: { id: responseId },
      data: { status }
    });
    
    return NextResponse.json(updatedResponse);
  } catch (error) {
    console.error('Error updating response:', error);
    return NextResponse.json({ error: 'Failed to update response' }, { status: 500 });
  }
}