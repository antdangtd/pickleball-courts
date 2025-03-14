// src/components/CourtsCalendar.tsx
// This file contains the courts calendar component with React Query implementation

'use client'

import React, { useState, useEffect, useRef } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import resourceTimeGridPlugin from '@fullcalendar/resource-timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import { EventInput, ResourceInput } from '@fullcalendar/core'
import { toast } from 'sonner'
import BookingModal from './BookingModal'
import { format } from 'date-fns'
import EventDetailsModal from './EventDetailsModal';
import { useSession } from 'next-auth/react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import socketService from '@/lib/socketService';

type ResourceInput = {
  id: string;
  title: string;
  [key: string]: any;
};

interface Court {
  id: string
  name: string
  is_indoor: boolean
  description?: string | null
}

// API fetch functions
const fetchCourts = async (): Promise<Court[]> => {
  const response = await fetch('/api/courts');
  if (!response.ok) {
    throw new Error('Failed to fetch courts');
  }
  return response.json();
};

const fetchEvents = async (): Promise<any[]> => {
  const response = await fetch('/api/events');
  if (!response.ok) {
    throw new Error('Failed to fetch events');
  }
  return response.json();
};

export default function CourtsCalendar() {
  const calendarRef = useRef<any>(null);
  const [events, setEvents] = useState<EventInput[]>([]);
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  
  const canCreateEvents = session?.user?.role === 'ADMIN' || session?.user?.role === 'COURT_MANAGER';
  
  // State variables for booking modal
  const [selectedStartTime, setSelectedStartTime] = useState<string | null>(null);
  const [selectedEndTime, setSelectedEndTime] = useState<string | null>(null);
  const [selectedCourtId, setSelectedCourtId] = useState<string | null>(null);
  const [selectedCourtName, setSelectedCourtName] = useState<string | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [isEventDetailsModalOpen, setIsEventDetailsModalOpen] = useState(false);
  
  // Use React Query for courts data
  const { 
    data: courtsData, 
    isLoading: isLoadingCourts, 
    error: courtsError
  } = useQuery({
    queryKey: ['courts'],
    queryFn: fetchCourts,
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    refetchOnWindowFocus: false,
  });
  
  // Use React Query for events data  
  const { 
    data: eventsData, 
    isLoading: isLoadingEvents,
    error: eventsError,
    refetch: refetchEvents
  } = useQuery({
    queryKey: ['events'],
    queryFn: fetchEvents,
    staleTime: 1 * 60 * 1000, // Consider data fresh for 1 minute (more frequent updates)
    refetchOnWindowFocus: true,
    enabled: !isLoadingCourts, // Only fetch events once courts are loaded
  });

  // Transform courts into FullCalendar resources
  const courts: ResourceInput[] = React.useMemo(() => {
    if (!courtsData || courtsData.length === 0) {
      return [{ id: 'no-courts', title: 'No courts available - Add courts in Dashboard' }];
    }
    
    return courtsData.map(court => ({
      id: court.id,
      title: `${court.name} (${court.is_indoor ? 'Indoor' : 'Outdoor'})`
    }));
  }, [courtsData]);
  
  // Transform events for FullCalendar when events data changes
  useEffect(() => {
    if (!eventsData) return;
    
    let formattedEvents: EventInput[] = [];
    
    eventsData.forEach((event: any) => {
      // Handle multi-court events
      if (event.courts && event.courts.length > 0) {
        // For multi-court events, create an event instance for each court
        event.courts.forEach((courtEvent: any) => {
          formattedEvents.push({
            id: `${event.id}-${courtEvent.courtId}`,
            title: event.title,
            start: event.start,
            end: event.end,
            resourceId: courtEvent.courtId,
            backgroundColor: '#4caf50', // Make multi-court events green
            borderColor: '#388e3c',
            extendedProps: {
              eventId: event.id,
              eventType: event.type,
              minSkillLevel: event.min_skill,
              maxSkillLevel: event.max_skill,
              maxPlayers: event.max_players,
              notes: event.notes,
              isMultiCourt: true,
              totalCourts: event.courts.length
            }
          });
        });
      } else if (event.courtId) {
        // Single court event (backward compatibility)
        formattedEvents.push({
          id: event.id,
          title: event.title,
          start: event.start,
          end: event.end,
          resourceId: event.courtId,
          extendedProps: {
            eventType: event.type,
            minSkillLevel: event.min_skill,
            maxSkillLevel: event.max_skill,
            maxPlayers: event.max_players,
            notes: event.notes,
            isMultiCourt: false
          }
        });
      }
    });
    
    setEvents(formattedEvents);
  }, [eventsData]);
  
  // Join socket rooms for events when events data changes
  useEffect(() => {
    if (eventsData && session?.user?.id) {
      // Join rooms for all events to get updates
      eventsData.forEach((event: any) => {
        socketService.joinEventRoom(event.id);
      });
    }
    
    // Cleanup function to leave rooms when component unmounts
    return () => {
      if (eventsData && session?.user?.id) {
        eventsData.forEach((event: any) => {
          socketService.leaveEventRoom(event.id);
        });
      }
    };
  }, [eventsData, session?.user?.id]);
  
  const handleEventClick = (clickInfo: any) => {
    console.log("Event clicked:", clickInfo.event);
    setSelectedEvent(clickInfo.event);
    setIsEventDetailsModalOpen(true);
  };

  // Handle date click for creating a new event using click instead of selection
  const handleDateClick = (info: any) => {
    // Only allow admins and court managers to create events
    if (!canCreateEvents) {
      toast.error('Only administrators and court managers can create events');
      return;
    }
    
    console.log("Date clicked:", info);
    
    if (!info.resource) {
      toast.error('Please select a specific court');
      return;
    }
    
    const resourceId = info.resource.id;
    const resourceTitle = info.resource.title;
    
    // Calculate start and end times
    const startDate = new Date(info.date);
    
    // For end, use 4 hours later
    const endDate = new Date(startDate);
    endDate.setHours(endDate.getHours() + 4);
    
    const startTime = startDate.toISOString();
    const endTime = endDate.toISOString();
    
    setSelectedStartTime(startTime);
    setSelectedEndTime(endTime);
    setSelectedCourtId(resourceId);
    setSelectedCourtName(resourceTitle);
    console.log("About to open modal with time:", startTime, "to", endTime);
    setIsBookingModalOpen(true);
  };

  // Handle newly saved events
  const handleEventSaved = (savedEvent: any) => {
    console.log("Event saved:", savedEvent);
    
    // Invalidate and refetch events query to get the latest data
    queryClient.invalidateQueries({ queryKey: ['events'] });
    
    toast.success(`Event created successfully`);
  };
  
  // Handle event details close/refresh
  const handleEventDetailsClose = () => {
    setIsEventDetailsModalOpen(false);
    setSelectedEvent(null);
  };
  
  const handleEventDetailsRefresh = () => {
    // Invalidate and refetch events query
    queryClient.invalidateQueries({ queryKey: ['events'] });
  };

  // Calendar configuration with support for multi-court events and multi-hour scheduling
  const calendarOptions = {
    plugins: [
      dayGridPlugin, 
      timeGridPlugin, 
      resourceTimeGridPlugin, 
      interactionPlugin
    ],
    initialView: typeof window !== 'undefined' && window.innerWidth < 768 ? "timeGridDay" : "resourceTimeGridDay",
    nowIndicator: true,
    editable: false, // Disable dragging existing events
    selectable: false, // Disable drag-selection 
    selectMirror: true,
    selectMinDistance: 1,
    dayMaxEvents: true,
    resources: courts,
    events: events,
    eventClick: handleEventClick,
    dateClick: handleDateClick, // Use date click instead of selection
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'resourceTimeGridDay' // Only show day view
    },
    slotDuration: "00:30:00", // 30-minute slots for finer selection
    slotLabelInterval: "01:00:00", // Still show hour labels
    snapDuration: "00:30:00", // Snap to 30-minute increments
    slotMinTime: "06:00:00",  // Start at 6 AM
    slotMaxTime: "22:00:00",  // End at 10 PM
    height: "auto", // Makes height responsive
    contentHeight: "auto",
    // Mobile optimizations
    views: {
      timeGridDay: {
        type: 'timeGrid',
        duration: { days: 1 },
        titleFormat: { year: 'numeric', month: 'short', day: 'numeric' }
      },
      resourceTimeGridDay: {
        type: 'timeGrid',
        resources: true,
        slotDuration: "00:30:00", // 30-minute slots in resource view
      }
    },
    // Custom event rendering for multi-court events
    eventContent: (info: any) => {
      const isMultiCourt = info.event.extendedProps?.isMultiCourt;
      const totalCourts = info.event.extendedProps?.totalCourts || 1;
      
      // Create custom content for multi-court events
      if (isMultiCourt) {
        const eventEl = document.createElement('div');
        eventEl.innerHTML = `
          <div class="fc-event-main-frame">
            <div class="fc-event-title-container">
              <div class="fc-event-title">${info.event.title}</div>
              <div class="text-xs">(${totalCourts} courts)</div>
            </div>
          </div>
        `;
        return { domNodes: [eventEl] };
      }
      
      return null; // Use default rendering for single-court events
    }
  };

  // Add a test function to manually open the modal with specific times
  const testOpenModal = () => {
    // Only allow admins and court managers to test the modal
    if (!canCreateEvents) {
      toast.error('Only administrators and court managers can create events');
      return;
    }
    
    // Set start time to 7 AM today
    const today = new Date();
    today.setHours(7, 0, 0, 0);
    const startTime = today.toISOString();
    
    // Set end time to 11 AM (4 hours later)
    const endTime = new Date(today);
    endTime.setHours(11, 0, 0, 0);
    
    setSelectedStartTime(startTime);
    setSelectedEndTime(endTime.toISOString());
    setSelectedCourtId(courts[0]?.id || null);
    setSelectedCourtName(courts[0]?.title as string || null);
    setIsBookingModalOpen(true);
    console.log("Test modal open triggered with time 7am-11am");
  };

  // Add custom CSS to fix calendar interaction issues
  useEffect(() => {
    // Add custom CSS to enable pointer events on time slots
    const style = document.createElement('style');
    style.textContent = `
      .fc-timegrid-slot {
        pointer-events: auto !important;
        cursor: pointer !important;
      }
      .fc-timegrid-col {
        pointer-events: auto !important;
        cursor: pointer !important;
      }
      .fc-timegrid-slots td {
        pointer-events: auto !important;
        cursor: pointer !important;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Loading and error states
  const isLoading = isLoadingCourts || isLoadingEvents;
  const error = courtsError || eventsError;

  return (
    <div className="w-full overflow-x-auto">
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-lg font-medium">Loading courts...</div>
        </div>
      ) : (
        <>
          {/* Only show test button for admins and court managers */}
          {canCreateEvents && (
            <button 
              onClick={testOpenModal}
              className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Test Open Modal (7am-11am)
            </button>
          )}
          
          {/* Refresh button */}
          <button 
            onClick={() => {
              queryClient.invalidateQueries({ queryKey: ['events'] });
              refetchEvents();
              toast.info('Refreshing calendar data...');
            }}
            className="mb-4 ml-2 px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
          >
            Refresh Calendar
          </button>
          
          <div className="calendar-container">
            <FullCalendar 
              ref={calendarRef}
              {...calendarOptions} 
            />
          </div>
          
          {error && (
            <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded">
              <p className="text-amber-700">{(error as Error).message || 'An error occurred'}</p>
              <button
                onClick={() => {
                  queryClient.invalidateQueries({ queryKey: ['courts'] });
                  queryClient.invalidateQueries({ queryKey: ['events'] });
                  toast.info('Retrying...');
                }}
                className="mt-2 px-3 py-1 bg-amber-100 text-amber-800 rounded hover:bg-amber-200"
              >
                Retry
              </button>
            </div>
          )}
          
          <BookingModal
            isOpen={isBookingModalOpen}
            onClose={() => {
              console.log("Modal close triggered");
              setIsBookingModalOpen(false);
            }}
            startTime={selectedStartTime}
            endTime={selectedEndTime}
            courtId={selectedCourtId}
            courtName={selectedCourtName}
            allCourts={courts}
            onSave={handleEventSaved}
          />
          
          <EventDetailsModal
            isOpen={isEventDetailsModalOpen}
            onClose={handleEventDetailsClose}
            event={selectedEvent}
            onRefresh={handleEventDetailsRefresh}
          />
        </>
      )}
    </div>
  );
}