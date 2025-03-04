// src/components/EventDetailsModal.tsx
// This file contains a modal component for displaying event details. The modal is used to show event information and allow users to join or leave the event.

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { format } from 'date-fns';

interface EventDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: any;
  onRefresh: () => void;
}

export default function EventDetailsModal({
  isOpen,
  onClose,
  event,
  onRefresh
}: EventDetailsModalProps) {
  const { data: session } = useSession();
  const [eventDetails, setEventDetails] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [participants, setParticipants] = useState<any[]>([]);
  const [waitlist, setWaitlist] = useState<any[]>([]);
  const [isJoining, setIsJoining] = useState(false);
  const [isLeavingEvent, setIsLeavingEvent] = useState(false);
  const [isJoiningWaitlist, setIsJoiningWaitlist] = useState(false);
  const [isLeavingWaitlist, setIsLeavingWaitlist] = useState(false);

  // Debug session data
  useEffect(() => {
    console.log("Session data:", session);
  }, [session]);

  // Fetch event details when modal opens
  useEffect(() => {
    console.log("Modal Opened, Event Data:", event);
    if (isOpen && event) {
      fetchEventDetails();
    }
  }, [isOpen, event]);

  const fetchEventDetails = async () => {
    if (!event) return;

    setIsLoading(true);
    try {
      // Extract the actual event ID if it's a multi-court event
      const eventId = event.extendedProps?.eventId || event.id;
      const response = await fetch(`/api/events/${eventId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch event details');
      }
      
      const data = await response.json();
      setEventDetails(data);
      
      // Set participants and waitlist
      if (data.participants) {
        setParticipants(data.participants);
      }
      
      if (data.waitlist) {
        setWaitlist(data.waitlist);
      }
      
    } catch (error) {
      console.error('Error fetching event details:', error);
      toast.error('Failed to load event details');
    } finally {
      setIsLoading(false);
    }
  };

  // Check if user is already a participant
  const isUserParticipant = () => {
    return participants.some(p => p.userId === session?.user?.id);
  };

  // Check if user is on the waitlist
  const isUserOnWaitlist = () => {
    return waitlist.some(w => w.userId === session?.user?.id);
  };

  // Check if event is full
  const isEventFull = () => {
    return eventDetails && participants.length >= eventDetails.max_players;
  };

  // Check if user meets the skill level requirements
  const userMeetsSkillLevel = () => {
    if (!eventDetails || !session?.user) {
      console.log("Missing skill data:", {
        eventDetails: !!eventDetails,
        userSession: !!session?.user
      });
      return false;
    }
  
    const userSkillLevel = session.user.skillLevel;
  
    if (!userSkillLevel) {
      console.log("User skill level not found in session");
      return false;
    }
  
    const skillLevels = [
      'BEGINNER', 'BEGINNER_2_0', 'BEGINNER_2_25', 'BEGINNER_2_5',
      'RISING_BEGINNER_2_75', 'LOW_INTERMEDIATE_3_0', 'INTERMEDIATE',
      'INTERMEDIATE_3_25', 'INTERMEDIATE_3_5', 'RISING_INTERMEDIATE_3_75',
      'LOW_ADVANCED_4_0', 'ADVANCED', 'ADVANCED_4_25', 'ADVANCED_4_5',
      'RISING_ADVANCED_4_75', 'TOURNAMENT_5_0', 'PRO', 'PRO_5_5'
    ];
  
    const userSkillIndex = skillLevels.indexOf(userSkillLevel);
    const minSkillIndex = eventDetails.min_skill ? skillLevels.indexOf(eventDetails.min_skill) : 0;
    const maxSkillIndex = eventDetails.max_skill ? skillLevels.indexOf(eventDetails.max_skill) : skillLevels.length - 1;
  
    console.log("Comparing skill levels:", {
      userSkill: userSkillLevel,
      minSkill: eventDetails.min_skill,
      maxSkill: eventDetails.max_skill
    });
  
    console.log("Skill level comparison details:", {
      userSkillLevel,
      userSkillIndex,
      minSkill: eventDetails.min_skill,
      minSkillIndex,
      maxSkill: eventDetails.max_skill,
      maxSkillIndex,
      meetsRequirements: userSkillIndex >= minSkillIndex && userSkillIndex <= maxSkillIndex,
      userSkillFound: userSkillIndex !== -1,
      minSkillFound: minSkillIndex !== -1,
      maxSkillFound: maxSkillIndex !== -1
    });
  
    // If any skill level is not found, allow fallback logic
    if (userSkillIndex === -1 || minSkillIndex === -1 || maxSkillIndex === -1) {
      console.warn("One or more skill levels not found in skill levels array!");
      
      if (userSkillIndex === -1) {
        const userSkill = String(userSkillLevel).toLowerCase();
        if (userSkill.includes('beginner')) {
          return eventDetails.min_skill?.toLowerCase().includes('beginner') || !eventDetails.min_skill;
        } else if (userSkill.includes('intermediate')) {
          return eventDetails.min_skill?.toLowerCase().includes('beginner') || 
                eventDetails.min_skill?.toLowerCase().includes('intermediate') || 
                !eventDetails.min_skill;
        }
      }
  
      console.log("Defaulting to allowing access due to comparison issues");
      return true;
    }
  
    return userSkillIndex >= minSkillIndex && userSkillIndex <= maxSkillIndex;
  };
  

  // Join the event
  const handleJoinEvent = async () => {
    if (!session || !eventDetails) return;
    
    setIsJoining(true);
    try {
      const response = await fetch(`/api/events/${eventDetails.id}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to join event');
      }
      
      await fetchEventDetails();
      toast.success('Successfully joined the event');
      onRefresh(); // Refresh parent component
    } catch (error: any) {
      toast.error(error.message || 'Failed to join event');
    } finally {
      setIsJoining(false);
    }
  };

  // Leave the event
  const handleLeaveEvent = async () => {
    if (!session || !eventDetails) return;
    
    setIsLeavingEvent(true);
    try {
      const response = await fetch(`/api/events/${eventDetails.id}/leave`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to leave event');
      }
      
      await fetchEventDetails();
      toast.success('Successfully left the event');
      onRefresh(); // Refresh parent component
    } catch (error: any) {
      toast.error(error.message || 'Failed to leave event');
    } finally {
      setIsLeavingEvent(false);
    }
  };

  // Join the waitlist
  const handleJoinWaitlist = async () => {
    if (!session || !eventDetails) return;
    
    setIsJoiningWaitlist(true);
    try {
      const response = await fetch(`/api/events/${eventDetails.id}/waitlist/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to join waitlist');
      }
      
      await fetchEventDetails();
      toast.success('Successfully joined the waitlist');
      onRefresh(); // Refresh parent component
    } catch (error: any) {
      toast.error(error.message || 'Failed to join waitlist');
    } finally {
      setIsJoiningWaitlist(false);
    }
  };

  // Leave the waitlist
  const handleLeaveWaitlist = async () => {
    if (!session || !eventDetails) return;
    
    setIsLeavingWaitlist(true);
    try {
      const response = await fetch(`/api/events/${eventDetails.id}/waitlist/leave`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to leave waitlist');
      }
      
      await fetchEventDetails();
      toast.success('Successfully left the waitlist');
      onRefresh(); // Refresh parent component
    } catch (error: any) {
      toast.error(error.message || 'Failed to leave waitlist');
    } finally {
      setIsLeavingWaitlist(false);
    }
  };

  // Render the skill level requirements
  const renderSkillLevel = () => {
    if (!eventDetails) return null;
    
    console.log("Event skill level details:", {
      min_skill: eventDetails.min_skill,
      max_skill: eventDetails.max_skill
    });
    
    if (eventDetails.min_skill && eventDetails.max_skill) {
      return `${formatSkillLevel(eventDetails.min_skill)} to ${formatSkillLevel(eventDetails.max_skill)}`;
    } else if (eventDetails.min_skill) {
      return `Minimum: ${formatSkillLevel(eventDetails.min_skill)}`;
    } else if (eventDetails.max_skill) {
      return `Maximum: ${formatSkillLevel(eventDetails.max_skill)}`;
    } else {
      return 'All levels welcome';
    }
  };

  // Format skill level for display
  const formatSkillLevel = (skillLevel: string) => {
    const parts = skillLevel.split('_');
    if (parts.length < 2) return skillLevel;
    
    const level = parts[1].replace('_', '.');
    return `${parts[0]} ${level}`;
  };

  // Render action buttons based on user state
  const renderActionButtons = () => {
    if (!session) {
      return (
        <Button variant="outline" onClick={onClose}>
          Sign in to join
        </Button>
      );
    }
    
    if (isUserParticipant()) {
      return (
        <Button 
          variant="destructive" 
          onClick={handleLeaveEvent}
          disabled={isLeavingEvent}
        >
          {isLeavingEvent ? 'Leaving...' : 'Leave Event'}
        </Button>
      );
    }
    
    if (isUserOnWaitlist()) {
      return (
        <Button 
          variant="destructive" 
          onClick={handleLeaveWaitlist}
          disabled={isLeavingWaitlist}
        >
          {isLeavingWaitlist ? 'Leaving...' : 'Leave Waitlist'}
        </Button>
      );
    }
    
    if (!userMeetsSkillLevel()) {
      return (
        <div className="text-sm text-red-500 font-medium">
          Your skill level does not meet the requirements for this event.
        </div>
      );
    }
    
    if (isEventFull()) {
      return (
        <Button 
          onClick={handleJoinWaitlist}
          disabled={isJoiningWaitlist}
        >
          {isJoiningWaitlist ? 'Joining...' : 'Join Waitlist'}
        </Button>
      );
    }
    
    return (
      <Button 
        onClick={handleJoinEvent}
        disabled={isJoining}
      >
        {isJoining ? 'Joining...' : 'Join Event'}
      </Button>
    );
  };

  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Loading</DialogTitle>
            <DialogDescription>
              <div className="flex justify-center items-center h-40">
                <p>Loading event details...</p>
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
  }

  if (!eventDetails) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Not Found</DialogTitle>
            <DialogDescription>
              <div className="flex justify-center items-center h-40">
                <p>Event details not found</p>
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
  }

  const eventTypeMap: Record<string, string> = {
    'OPEN_PLAY': 'Open Play',
    'PRO_SESSION': 'Pro Session',
    'CLINIC': 'Clinic',
    'PRIVATE_LESSON': 'Private Lesson',
    'TOURNAMENT': 'Tournament'
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{eventDetails.title}</DialogTitle>
          <DialogDescription>
            <div className="flex flex-wrap gap-2 mt-2">
              <Badge variant="outline">{eventTypeMap[eventDetails.type] || eventDetails.type}</Badge>
              <Badge variant="outline">{participants.length}/{eventDetails.max_players} Players</Badge>
              {eventDetails.min_skill && (
                <Badge variant="outline">Skill: {renderSkillLevel()}</Badge>
              )}
            </div>
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium">Time</h3>
            <p className="text-sm">
              {format(new Date(eventDetails.start), 'EEE, MMM d, yyyy h:mm a')} - {format(new Date(eventDetails.end), 'h:mm a')}
            </p>
          </div>
          
          {eventDetails.notes && (
            <div>
              <h3 className="text-sm font-medium">Notes</h3>
              <p className="text-sm">{eventDetails.notes}</p>
            </div>
          )}
          
          <Separator />
          
          <div>
            <h3 className="text-sm font-medium">Participants ({participants.length}/{eventDetails.max_players})</h3>
            {participants.length > 0 ? (
              <ul className="text-sm mt-2 space-y-1">
                {participants.map((participant: any) => (
                  <li key={participant.userId} className="flex items-center gap-2">
                    <span>{participant.user.name}</span>
                    {participant.user.skill_level && (
                      <Badge variant="secondary" className="text-xs">
                        {formatSkillLevel(participant.user.skill_level)}
                      </Badge>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">No participants yet.</p>
            )}
          </div>
          
          {waitlist.length > 0 && (
            <div>
              <h3 className="text-sm font-medium">Waitlist ({waitlist.length})</h3>
              <ul className="text-sm mt-2 space-y-1">
                {waitlist.map((waitlistUser: any) => (
                  <li key={waitlistUser.userId} className="flex items-center gap-2">
                    <span>{waitlistUser.user.name}</span>
                    {waitlistUser.user.skill_level && (
                      <Badge variant="secondary" className="text-xs">
                        {formatSkillLevel(waitlistUser.user.skill_level)}
                      </Badge>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        
        <DialogFooter className="sm:justify-between">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          {renderActionButtons()}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}