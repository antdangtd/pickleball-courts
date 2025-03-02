// src/components/BookingModal.tsx
// This file contains the booking modal component. The modal is used to create new events on the calendar for booking courts.

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { format, parse, addHours } from 'date-fns';

// Event types
const EVENT_TYPES = [
  { id: 'OPEN_PLAY', label: 'Open Play' },
  { id: 'PRO_SESSION', label: 'Pro Session' },
  { id: 'CLINIC', label: 'Clinic' },
  { id: 'PRIVATE_LESSON', label: 'Private Lesson' },
  { id: 'TOURNAMENT', label: 'Tournament' }
];

// Skill levels
const SKILL_LEVELS = [
  { id: 'BEGINNER_2_0', label: '2.0 Beginner' },
  { id: 'BEGINNER_2_5', label: '2.5 Beginner' },
  { id: 'INTERMEDIATE_3_0', label: '3.0 Intermediate' },
  { id: 'INTERMEDIATE_3_5', label: '3.5 Intermediate' },
  { id: 'ADVANCED_4_0', label: '4.0 Advanced' },
  { id: 'ADVANCED_4_5', label: '4.5 Advanced' },
  { id: 'PRO_5_0', label: '5.0 Pro' }
];

// Generate time options from 6am to 10pm in 30 minute increments
const TIME_OPTIONS: { value: string; label: string }[] = [];
for (let hour = 6; hour < 22; hour++) {
  const hourString = hour.toString().padStart(2, '0');
  TIME_OPTIONS.push({
    value: `${hourString}:00`,
    label: `${hour > 12 ? hour - 12 : hour}:00 ${hour >= 12 ? 'PM' : 'AM'}`
  });
  TIME_OPTIONS.push({
    value: `${hourString}:30`,
    label: `${hour > 12 ? hour - 12 : hour}:30 ${hour >= 12 ? 'PM' : 'AM'}`
  });
}
// Add 10pm as the last option
TIME_OPTIONS.push({
  value: '22:00',
  label: '10:00 PM'
});

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  startTime: string | null;
  endTime: string | null;
  courtId: string | null;
  courtName: string | null;
  allCourts: any[]; // Court resources
  onSave: (event: any) => void;
}

export default function BookingModal({
  isOpen,
  onClose,
  startTime,
  endTime,
  courtId,
  courtName,
  allCourts = [],
  onSave
}: BookingModalProps) {
  const [title, setTitle] = useState("");
  const [eventType, setEventType] = useState("OPEN_PLAY");
  const [minSkillLevel, setMinSkillLevel] = useState("");
  const [maxSkillLevel, setMaxSkillLevel] = useState("");
  const [maxPlayers, setMaxPlayers] = useState(4);
  const [notes, setNotes] = useState("");
  const [isMultiCourt, setIsMultiCourt] = useState(false);
  const [selectedCourts, setSelectedCourts] = useState<Record<string, boolean>>({});
  
  // Time selection state
  const [selectedStartTime, setSelectedStartTime] = useState("07:00");
  const [selectedEndTime, setSelectedEndTime] = useState("11:00");
  const [selectedDate, setSelectedDate] = useState("");

  // Initialize selected courts with the initially selected court
  useEffect(() => {
    if (courtId) {
      setSelectedCourts({ [courtId]: true });
    }
  }, [courtId]);

  // Initialize time fields when modal opens with new date/time
  useEffect(() => {
    if (startTime && endTime) {
      const startDate = new Date(startTime);
      const endDate = new Date(endTime);
      
      // Format the start and end times as HH:MM for the select inputs
      setSelectedStartTime(format(startDate, 'HH:mm'));
      setSelectedEndTime(format(endDate, 'HH:mm'));
      
      // Store the date part for later use in form submission
      setSelectedDate(format(startDate, 'yyyy-MM-dd'));
    }
  }, [startTime, endTime]);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setTitle("");
      setEventType("OPEN_PLAY");
      setMinSkillLevel("");
      setMaxSkillLevel("");
      setMaxPlayers(4);
      setNotes("");
      setIsMultiCourt(false);
    }
  }, [isOpen]);

  const handleCourtToggle = (courtId: string, checked: boolean) => {
    setSelectedCourts(prev => ({
      ...prev,
      [courtId]: checked
    }));
  };

  // Handle time changes
  const handleStartTimeChange = (time: string) => {
    setSelectedStartTime(time);
    
    // Ensure end time is at least 30 minutes after start time
    const startHour = parseInt(time.split(':')[0]);
    const startMinute = parseInt(time.split(':')[1]);
    const endHour = parseInt(selectedEndTime.split(':')[0]);
    const endMinute = parseInt(selectedEndTime.split(':')[1]);
    
    const startTotalMinutes = startHour * 60 + startMinute;
    const endTotalMinutes = endHour * 60 + endMinute;
    
    if (endTotalMinutes <= startTotalMinutes) {
      // If end time is before or equal to start time, set it to start time + 1 hour
      const newEndHour = (startHour + 1) % 24;
      setSelectedEndTime(`${newEndHour.toString().padStart(2, '0')}:${startMinute.toString().padStart(2, '0')}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Get array of selected court IDs
    const courtIds = Object.entries(selectedCourts)
      .filter(([_, isSelected]) => isSelected)
      .map(([id]) => id);
    
    if (courtIds.length === 0) {
      toast.error('Please select at least one court');
      return;
    }

    // Create proper date objects with the selected times
    const startDateStr = `${selectedDate}T${selectedStartTime}:00`;
    const endDateStr = `${selectedDate}T${selectedEndTime}:00`;
    
    const startDateTime = new Date(startDateStr);
    const endDateTime = new Date(endDateStr);
    
    // Handle case where end time is earlier in the day than start time (next day booking)
    if (endDateTime <= startDateTime) {
      endDateTime.setDate(endDateTime.getDate() + 1);
    }
    
    try {
      const bookingData = {
        title,
        eventType,
        minSkillLevel,
        maxSkillLevel,
        maxPlayers: Number(maxPlayers),
        notes,
        courtIds: isMultiCourt ? courtIds : undefined, // Send array if multi-court
        courtId: !isMultiCourt ? courtIds[0] : undefined, // Send single ID if not multi-court
        start: startDateTime.toISOString(),
        end: endDateTime.toISOString()
      };
      
      console.log("Creating event with data:", bookingData);
      
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
      });
      
      if (response.ok) {
        const savedEvent = await response.json();
        toast.success('Event created successfully');
        onSave(savedEvent);
        onClose();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to create event');
      }
    } catch (error) {
      console.error('Error creating event:', error);
      toast.error('Failed to create event');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Booking</DialogTitle>
          <DialogDescription>
            Create a new event or booking for the selected time slot.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Event Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter event title"
              required
            />
          </div>
          
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <Checkbox 
                id="isMultiCourt" 
                checked={isMultiCourt} 
                onCheckedChange={(checked) => setIsMultiCourt(checked === true)}
              />
              <Label htmlFor="isMultiCourt">Book Multiple Courts</Label>
            </div>
            
            {isMultiCourt ? (
              <div className="border rounded p-3 max-h-40 overflow-y-auto">
                <div className="text-sm font-medium mb-2">Select Courts</div>
                {allCourts.map(court => (
                  <div key={court.id} className="flex items-center space-x-2 mb-1">
                    <Checkbox 
                      id={`court-${court.id}`}
                      checked={!!selectedCourts[court.id]}
                      onCheckedChange={(checked) => handleCourtToggle(court.id, checked === true)}
                    />
                    <Label htmlFor={`court-${court.id}`} className="text-sm">
                      {court.title}
                    </Label>
                  </div>
                ))}
              </div>
            ) : (
              <div>
                <Label htmlFor="court">Court</Label>
                <Input id="court" value={courtName || ''} disabled />
              </div>
            )}
          </div>
          
          {/* Editable time selection */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startTime">Start Time</Label>
              <Select 
                value={selectedStartTime} 
                onValueChange={handleStartTimeChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select start time" />
                </SelectTrigger>
                <SelectContent>
                  {TIME_OPTIONS.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="endTime">End Time</Label>
              <Select 
                value={selectedEndTime} 
                onValueChange={setSelectedEndTime}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select end time" />
                </SelectTrigger>
                <SelectContent>
                  {TIME_OPTIONS.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div>
            <Label htmlFor="eventType">Event Type</Label>
            <Select value={eventType} onValueChange={setEventType}>
              <SelectTrigger>
                <SelectValue placeholder="Select event type" />
              </SelectTrigger>
              <SelectContent>
                {EVENT_TYPES.map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="minSkillLevel">Minimum Skill Level</Label>
              <Select value={minSkillLevel} onValueChange={setMinSkillLevel}>
                <SelectTrigger>
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  {SKILL_LEVELS.map((level) => (
                    <SelectItem key={level.id} value={level.id}>
                      {level.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="maxSkillLevel">Maximum Skill Level</Label>
              <Select value={maxSkillLevel} onValueChange={setMaxSkillLevel}>
                <SelectTrigger>
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  {SKILL_LEVELS.map((level) => (
                    <SelectItem key={level.id} value={level.id}>
                      {level.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div>
            <Label htmlFor="maxPlayers">Maximum Players</Label>
            <Input
              id="maxPlayers"
              type="number"
              value={maxPlayers}
              onChange={(e) => setMaxPlayers(parseInt(e.target.value))}
              min={1}
              max={100}
            />
          </div>
          
          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional information"
            />
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              Create Event
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}