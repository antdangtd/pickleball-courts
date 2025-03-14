// src/app/api/events/[id]/join/route.ts
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
    
    // Check if event is full
    if (event.participants.length >= event.max_players) {
      return NextResponse.json(
        { error: 'Event is full. Please join the waitlist instead.' }, 
        { status: 400 }
      );
    }
    
    // Check if user is already a participant
    const isParticipant = event.participants.some((p: { userId: string }) => p.userId === userId);
    if (isParticipant) {
      return NextResponse.json(
        { error: 'You are already a participant in this event' }, 
        { status: 400 }
      );
    }
    
    // Check skill level requirements if applicable
    if (event.min_skill || event.max_skill) {
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });
      
      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
      
      // Define skill levels in order
      const skillLevels = [
        'BEGINNER_2_0',
        'BEGINNER_2_25',
        'BEGINNER_2_5',
        'RISING_BEGINNER_2_75',
        'LOW_INTERMEDIATE_3_0',
        'INTERMEDIATE_3_25',
        'INTERMEDIATE_3_5',
        'RISING_INTERMEDIATE_3_75',
        'LOW_ADVANCED_4_0',
        'ADVANCED_4_25',
        'ADVANCED_4_5',
        'RISING_ADVANCED_4_75',
        'TOURNAMENT_5_0',
        'PRO_5_5'
      ];
      
      // Add detailed logging to debug the issue
      console.log('Skill level validation:', {
        userSkillLevel: user.skill_level,
        eventMinSkill: event.min_skill,
        eventMaxSkill: event.max_skill
      });
      
      // Get the indices for comparison
      const userSkillIndex = skillLevels.indexOf(user.skill_level);
      const minSkillIndex = event.min_skill ? skillLevels.indexOf(event.min_skill) : 0;
      const maxSkillIndex = event.max_skill ? skillLevels.indexOf(event.max_skill) : skillLevels.length - 1;
      
      console.log('Skill level indices:', {
        userSkillIndex,
        minSkillIndex,
        maxSkillIndex
      });
      
      // Better error handling for invalid skill levels
      if (userSkillIndex === -1) {
        console.error(`User skill level "${user.skill_level}" not found in skill levels list`);
        // For now, let's allow users with unknown skill levels to join
        // return NextResponse.json({ error: 'Invalid user skill level' }, { status: 400 });
      }
      
      if (minSkillIndex === -1 && event.min_skill) {
        console.error(`Event min skill level "${event.min_skill}" not found in skill levels list`);
        // Don't block on invalid min skill
        // return NextResponse.json({ error: 'Invalid event minimum skill level' }, { status: 400 });
      }
      
      if (maxSkillIndex === -1 && event.max_skill) {
        console.error(`Event max skill level "${event.max_skill}" not found in skill levels list`);
        // Don't block on invalid max skill
        // return NextResponse.json({ error: 'Invalid event maximum skill level' }, { status: 400 });
      }
      
      // Only validate if we have valid indices
      if (userSkillIndex !== -1 && minSkillIndex !== -1 && maxSkillIndex !== -1) {
        if (userSkillIndex < minSkillIndex || userSkillIndex > maxSkillIndex) {
          return NextResponse.json(
            { error: 'Your skill level does not meet the requirements for this event' }, 
            { status: 400 }
          );
        }
      }
    }
    
    // Add user to participants
    const participant = await prisma.eventParticipant.create({
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
    
    // Update current_players count
    await prisma.event.update({
      where: { id },
      data: {
        current_players: {
          increment: 1
        }
      }
    });
    
    // If user was on waitlist, remove them
    const isOnWaitlist = event.waitlist.some((w: { userId: string }) => w.userId === userId);
    if (isOnWaitlist) {
      await prisma.eventWaitlist.delete({
        where: {
          userId_eventId: {
            userId,
            eventId: id
          }
        }
      });
    }
    
    return NextResponse.json(participant);
  } catch (error) {
    console.error('Error joining event:', error);
    return NextResponse.json({ error: 'Failed to join event' }, { status: 500 });
  }
}

export async function DELETE(
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
    
    return NextResponse.json({ message: 'Successfully left event' });
  } catch (error) {
    console.error('Error leaving event:', error);
    return NextResponse.json({ error: 'Failed to leave event' }, { status: 500 });
  }
}