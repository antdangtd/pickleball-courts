// src/lib/socketService.ts
import { io, Socket } from 'socket.io-client';
import { toast } from 'sonner';

// Socket notification types
export type NotificationType = 
  | 'event_join' 
  | 'event_leave' 
  | 'event_created' 
  | 'waitlist_join' 
  | 'waitlist_to_participant' 
  | 'court_update';

export interface SocketNotification {
  type: NotificationType;
  message: string;
  data?: any;
}

class SocketService {
  private socket: Socket | null = null;
  private isInitialized: boolean = false;

  initialize(userId: string) {
    if (this.isInitialized) return;
    
    // Use your actual server URL in production, fallback to localhost for development
    const serverUrl = process.env.NEXT_PUBLIC_SOCKET_URL || window.location.origin;
    
    try {
      this.socket = io(serverUrl, {
        auth: {
          userId
        },
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000
      });

      this.socket.on('connect', () => {
        console.log('Socket connected');
        this.isInitialized = true;
      });

      this.socket.on('disconnect', () => {
        console.log('Socket disconnected');
        this.isInitialized = false;
      });

      // Handle connection errors
      this.socket.on('connect_error', (err) => {
        console.error('Socket connection error:', err.message);
        toast.error('Could not connect to notification service. Please reload the page.');
      });

      // Setup notification listener
      this.socket.on('notification', (notification: SocketNotification) => {
        this.handleNotification(notification);
      });

    } catch (error) {
      console.error('Error initializing socket:', error);
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isInitialized = false;
    }
  }

  private handleNotification(notification: SocketNotification) {
    // Display notification
    toast(notification.message, {
      description: this.getDescriptionFromType(notification.type, notification.data),
      action: {
        label: "View",
        onClick: () => this.handleNotificationAction(notification)
      },
    });
  }

  private getDescriptionFromType(type: NotificationType, data?: any): string {
    switch (type) {
      case 'event_join':
        return `${data?.userName || 'Someone'} joined ${data?.eventTitle || 'an event'}`;
      case 'event_leave':
        return `${data?.userName || 'Someone'} left ${data?.eventTitle || 'an event'}`;
      case 'event_created':
        return `New event: ${data?.eventTitle || 'Untitled'} on ${data?.courtName || 'a court'}`;
      case 'waitlist_join':
        return `${data?.userName || 'Someone'} joined the waitlist for ${data?.eventTitle || 'an event'}`;
      case 'waitlist_to_participant':
        return `You've been moved from waitlist to participants for ${data?.eventTitle || 'an event'}`;
      case 'court_update':
        return `Court status update: ${data?.courtName || 'A court'} is now ${data?.status || 'updated'}`;
      default:
        return 'New notification';
    }
  }

  private handleNotificationAction(notification: SocketNotification) {
    // Handle click actions based on notification type
    switch (notification.type) {
      case 'event_join':
      case 'event_leave':
      case 'waitlist_join':
      case 'waitlist_to_participant':
      case 'event_created':
        if (notification.data?.eventId) {
          // Navigate to the specific event
          window.location.href = `/events/${notification.data.eventId}`;
        } else {
          // Navigate to calendar
          window.location.href = '/dashboard';
        }
        break;
      case 'court_update':
        // Navigate to courts management
        window.location.href = '/courts';
        break;
      default:
        window.location.href = '/dashboard';
    }
  }

  // Methods to join and leave rooms for specific events
  joinEventRoom(eventId: string) {
    if (this.socket && this.isInitialized) {
      this.socket.emit('join_event_room', { eventId });
    }
  }

  leaveEventRoom(eventId: string) {
    if (this.socket && this.isInitialized) {
      this.socket.emit('leave_event_room', { eventId });
    }
  }
}

// Export singleton instance
const socketService = new SocketService();
export default socketService;