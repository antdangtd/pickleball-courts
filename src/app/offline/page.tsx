// src/app/offline/page.tsx
'use client';

import { Button } from "@/components/ui/button";
import { WifiOff } from "lucide-react";

export default function OfflinePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <div className="p-6 rounded-xl bg-muted max-w-md w-full">
        <WifiOff className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold mb-2">You're offline</h1>
        <p className="text-muted-foreground mb-6">
          Sorry, it looks like you've lost your internet connection. The Pickleball Court Booking app requires an internet connection to work properly.
        </p>
        <Button 
          onClick={() => window.location.reload()}
          className="w-full"
        >
          Try Again
        </Button>
      </div>
    </div>
  );
}