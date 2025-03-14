// src/components/BookingModal.tsx
// This file contains the booking modal component with react-hook-form implementation

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { format } from 'date-fns';
import { useForm, Controller } from "react-hook-form";

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

// Form data type for react-hook-form
interface BookingFormData {
  title: string;
  eventType: string;
  minSkillLevel: string;
  maxSkillLevel: string;
  maxPlayers: number;
  notes: string;
  isMultiCourt: boolean;
  selectedCourts: Record<string, boolean>;
  selectedStartTime: string;
  selectedEndTime: string;
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
  // React Hook Form setup
  const { control, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<BookingFormData>({
    defaultValues: {
      title: "",
      eventType: "OPEN_PLAY",
      minSkillLevel: "",
      maxSkillLevel: "",
      maxPlayers: 4,
      notes: "",
      isMultiCourt: false,
      selectedCourts: {},
      selectedStartTime: "07:00",
      selectedEndTime: "11:00"
    }
  });
  
  // Watch values for reactive updates
  const isMultiCourt = watch("isMultiCourt");
  const selectedStartTime = watch("selectedStartTime");
  const selectedEndTime = watch("selectedEndTime");
  const [selectedDate, setSelectedDate] = useState("");
  
  // Initialize selected courts with the initially selected court
  useEffect(() => {
    if (courtId) {
      setValue("selectedCourts", { [courtId]: true });
    }
  }, [courtId, setValue]);

  // Initialize time fields when modal opens with new date/time
  useEffect(() => {
    if (startTime && endTime) {
      const startDate = new Date(startTime);
      const endDate = new Date(endTime);
      
      // Format the start and end times as HH:MM for the select inputs
      setValue("selectedStartTime", format(startDate, 'HH:mm'));
      setValue("selectedEndTime", format(endDate, 'HH:mm'));
      
      // Store the date part for later use in form submission
      setSelectedDate(format(startDate, 'yyyy-MM-dd'));
    }
  }, [startTime, endTime, setValue]);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      reset({
        title: "",
        eventType: "OPEN_PLAY",
        minSkillLevel: "",
        maxSkillLevel: "",
        maxPlayers: 4,
        notes: "",
        isMultiCourt: false,
        selectedCourts: courtId ? { [courtId]: true } : {},
        selectedStartTime: startTime ? format(new Date(startTime), 'HH:mm') : "07:00",
        selectedEndTime: endTime ? format(new Date(endTime), 'HH:mm') : "11:00"
      });
    }
  }, [isOpen, reset, courtId, startTime, endTime]);

  // Handle time changes to ensure end time is after start time
  useEffect(() => {
    if (selectedStartTime && selectedEndTime) {
      const startHour = parseInt(selectedStartTime.split(':')[0]);
      const startMinute = parseInt(selectedStartTime.split(':')[1]);
      const endHour = parseInt(selectedEndTime.split(':')[0]);
      const endMinute = parseInt(selectedEndTime.split(':')[1]);
      
      const startTotalMinutes = startHour * 60 + startMinute;
      const endTotalMinutes = endHour * 60 + endMinute;
      
      if (endTotalMinutes <= startTotalMinutes) {
        // If end time is before or equal to start time, set it to start time + 1 hour
        const newEndHour = (startHour + 1) % 24;
        setValue("selectedEndTime", `${newEndHour.toString().padStart(2, '0')}:${startMinute.toString().padStart(2, '0')}`);
      }
    }
  }, [selectedStartTime, selectedEndTime, setValue]);

  const onSubmit = async (data: BookingFormData) => {
    // Get array of selected court IDs
    const courtIds = Object.entries(data.selectedCourts)
      .filter(([_, isSelected]) => isSelected)
      .map(([id]) => id);
    
    if (courtIds.length === 0) {
      toast.error('Please select at least one court');
      return;
    }

    // Create proper date objects with the selected times
    const startDateStr = `${selectedDate}T${data.selectedStartTime}:00`;
    const endDateStr = `${selectedDate}T${data.selectedEndTime}:00`;
    
    const startDateTime = new Date(startDateStr);
    const endDateTime = new Date(endDateStr);
    
    // Handle case where end time is earlier in the day than start time (next day booking)
    if (endDateTime <= startDateTime) {
      endDateTime.setDate(endDateTime.getDate() + 1);
    }
    
    try {
      const bookingData = {
        title: data.title,
        eventType: data.eventType,
        minSkillLevel: data.minSkillLevel,
        maxSkillLevel: data.maxSkillLevel,
        maxPlayers: Number(data.maxPlayers),
        notes: data.notes,
        courtIds: data.isMultiCourt ? courtIds : undefined, // Send array if multi-court
        courtId: !data.isMultiCourt ? courtIds[0] : undefined, // Send single ID if not multi-court
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
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="title">Event Title</Label>
            <Controller
              name="title"
              control={control}
              rules={{ required: "Title is required" }}
              render={({ field }) => (
                <Input
                  id="title"
                  placeholder="Enter event title"
                  {...field}
                />
              )}
            />
            {errors.title && (
              <p className="text-sm text-red-500 mt-1">{errors.title.message}</p>
            )}
          </div>
          
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <Controller
                name="isMultiCourt"
                control={control}
                render={({ field }) => (
                  <Checkbox 
                    id="isMultiCourt" 
                    checked={field.value} 
                    onCheckedChange={field.onChange}
                  />
                )}
              />
              <Label htmlFor="isMultiCourt">Book Multiple Courts</Label>
            </div>
            
            {isMultiCourt ? (
              <div className="border rounded p-3 max-h-40 overflow-y-auto">
                <div className="text-sm font-medium mb-2">Select Courts</div>
                {allCourts.map(court => (
                  <div key={court.id} className="flex items-center space-x-2 mb-1">
                    <Controller
                      name={`selectedCourts.${court.id}`}
                      control={control}
                      defaultValue={false}
                      render={({ field }) => (
                        <Checkbox 
                          id={`court-${court.id}`}
                          checked={!!field.value}
                          onCheckedChange={field.onChange}
                        />
                      )}
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
              <Label htmlFor="selectedStartTime">Start Time</Label>
              <Controller
                name="selectedStartTime"
                control={control}
                render={({ field }) => (
                  <Select 
                    onValueChange={field.onChange}
                    value={field.value}
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
                )}
              />
            </div>
            <div>
              <Label htmlFor="selectedEndTime">End Time</Label>
              <Controller
                name="selectedEndTime"
                control={control}
                render={({ field }) => (
                  <Select 
                    onValueChange={field.onChange}
                    value={field.value}
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
                )}
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="eventType">Event Type</Label>
            <Controller
              name="eventType"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
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
              )}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="minSkillLevel">Minimum Skill Level</Label>
              <Controller
                name="minSkillLevel"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
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
                )}
              />
            </div>
            <div>
              <Label htmlFor="maxSkillLevel">Maximum Skill Level</Label>
              <Controller
                name="maxSkillLevel"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
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
                )}
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="maxPlayers">Maximum Players</Label>
            <Controller
              name="maxPlayers"
              control={control}
              rules={{ 
                required: "Required",
                min: { value: 1, message: "Minimum 1 player" },
                max: { value: 100, message: "Maximum 100 players" }
              }}
              render={({ field }) => (
                <Input
                  id="maxPlayers"
                  type="number"
                  min={1}
                  max={100}
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value))}
                />
              )}
            />
            {errors.maxPlayers && (
              <p className="text-sm text-red-500 mt-1">{errors.maxPlayers.message}</p>
            )}
          </div>
          
          <div>
            <Label htmlFor="notes">Notes</Label>
            <Controller
              name="notes"
              control={control}
              render={({ field }) => (
                <Textarea
                  id="notes"
                  placeholder="Additional information"
                  {...field}
                />
              )}
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