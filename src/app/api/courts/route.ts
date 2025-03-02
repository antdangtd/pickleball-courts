//src/app/api/courts/routes.ts
// This file contains the API route for fetching all active courts.

// src/app/api/courts/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    // Fetch all courts from the database
    const courts = await prisma.court.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        is_indoor: true,
        capacity: true,
        active: true
      }
    });

    console.log("API /courts returning:", courts);
    return NextResponse.json(courts);
  } catch (error) {
    console.error('Error fetching courts:', error);
    return NextResponse.json({ error: 'Failed to fetch courts' }, { status: 500 });
  }
}