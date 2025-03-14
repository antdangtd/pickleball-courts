'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
// Import socket service if it's working
// import socketService from '@/lib/socketService';

// A simplified version that just logs session status
export default function NotificationProvider({
  children
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession();

  // Just log session status for now
  useEffect(() => {
    if (status === 'authenticated' && session?.user?.id) {
      console.log('User authenticated, could initialize notifications');
      
      // Uncomment this once socketService is working
      // socketService.initialize(session.user.id);
      
      // Clean up on unmount
      return () => {
        console.log('Cleaning up notification provider');
        // socketService.disconnect();
      };
    }
  }, [session, status]);

  // Just render children - this is a non-visual component
  return <>{children}</>;
}