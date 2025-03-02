// src/components/CourtsCalendar.tsx
// This file contains the courts calendar component. The component fetches a list of courts from the API and displays them in a calendar view. The component allows users to create events on the calendar for booking courts.

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

export default function CourtsCalendar() {
  const calendarRef = useRef<any>(null);
  const [courts, setCourts] = useState<ResourceInput[]>([])
  const [events, setEvents] = useState<EventInput[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { data: session } = useSession();
  const canCreateEvents = session?.user?.role === 'ADMIN' || session?.user?.role === 'COURT_MANAGER';
  
  // State variables for booking modal
  const [selectedStartTime, setSelectedStartTime] = useState<string | null>(null)
  const [selectedEndTime, setSelectedEndTime] = useState<string | null>(null)
  const [selectedCourtId, setSelectedCourtId] = useState<string | null>(null)
  const [selectedCourtName, setSelectedCourtName] = useState<string | null>(null)
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [isEventDetailsModalOpen, setIsEventDetailsModalOpen] = useState(false);
  

  // Debug effect for modal state
  useEffect(() => {
    console.log("Booking modal open state:", isBookingModalOpen);
  }, [isBookingModalOpen]);

  // Fetch courts when component mounts
  useEffect(() => {
    async function fetchCourts() {
      try {
        setIsLoading(true)
        console.log("Fetching courts...")
        const response = await fetch('/api/courts')
        
        if (!response.ok) {
          console.error("Court fetch response not OK:", response.status)
          throw new Error('Failed to fetch courts')
        }
        
        const courtsData: Court[] = await response.json()
        console.log("Courts data from API:", courtsData)
        
        // Transform courts into FullCalendar resources
        if (courtsData && courtsData.length > 0) {
          const resources: ResourceInput[] = courtsData.map(court => ({
            id: court.id,
            title: `${court.name} (${court.is_indoor ? 'Indoor' : 'Outdoor'})`
          }))
          
          setCourts(resources)
          console.log("Using actual courts:", resources)
        } else {
          // If no courts in database, show a message
          setCourts([
            { id: 'no-courts', title: 'No courts available - Add courts in Dashboard' }
          ])
          console.log("No courts found in database")
        }
      } catch (error) {
        console.error('Error fetching courts:', error)
        setError('Failed to load courts')
        
        // Show a friendly message if courts failed to load
        setCourts([
          { id: 'error-court', title: 'Error loading courts - Please check console' }
        ])
      } finally {
        setIsLoading(false)
      }
    }

    fetchCourts()
  }, [])

  // Fetch existing events
  useEffect(() => {
    async function fetchEvents() {
      try {
        const response = await fetch('/api/events')
        
        if (!response.ok) {
          throw new Error('Failed to fetch events')
        }
        
        const eventsData = await response.json()
        console.log("Events data from API:", eventsData)
        
        // Transform events for FullCalendar
        let formattedEvents: EventInput[] = []
        
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
              })
            })
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
            })
          }
        })
        
        setEvents(formattedEvents)
        console.log("Formatted events for calendar:", formattedEvents)
      } catch (error) {
        console.error('Error fetching events:', error)
      }
    }
    
    if (!isLoading) {
      fetchEvents()
    }
  }, [isLoading])

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
    
    // For multi-court events, we'll get an array of court IDs
    if (savedEvent.courts && savedEvent.courts.length > 0) {
      // Create an event instance for each court
      const newEvents = savedEvent.courts.map((court: any) => ({
        id: `${savedEvent.id}-${court.courtId}`,
        title: savedEvent.title,
        start: savedEvent.start,
        end: savedEvent.end,
        resourceId: court.courtId,
        backgroundColor: '#4caf50', // Green for multi-court events
        borderColor: '#388e3c',
        extendedProps: {
          eventId: savedEvent.id,
          eventType: savedEvent.type,
          minSkillLevel: savedEvent.min_skill,
          maxSkillLevel: savedEvent.max_skill,
          maxPlayers: savedEvent.max_players,
          notes: savedEvent.notes,
          isMultiCourt: true,
          totalCourts: savedEvent.courts.length
        }
      }));
      
      setEvents(prev => [...prev, ...newEvents]);
      toast.success(`Event created across ${savedEvent.courts.length} courts`);
    } else {
      // Handle single court events as before
      setEvents(prev => [...prev, {
        id: savedEvent.id,
        title: savedEvent.title,
        start: savedEvent.start,
        end: savedEvent.end,
        resourceId: savedEvent.courtId,
        extendedProps: {
          eventType: savedEvent.type,
          minSkillLevel: savedEvent.min_skill,
          maxSkillLevel: savedEvent.max_skill,
          maxPlayers: savedEvent.max_players,
          notes: savedEvent.notes,
          isMultiCourt: false
        }
      }]);
    }
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
    editable: false, // Disable dragging existing events for now
    selectable: false, // Disable drag-selection since it's not working
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
          
          <div className="calendar-container">
            <FullCalendar 
              ref={calendarRef}
              {...calendarOptions} 
            />
          </div>
          
          {error && (
            <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded">
              <p className="text-amber-700">{error}</p>
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
          
          {/* Keep your EventDetailsModal here if it exists */}
        </>
      )}
    </div>
  );
}