// src/app/providers.tsx
// This file is used to wrap the app with providers

'use client'

import { SessionProvider } from "next-auth/react"
import { ThemeProvider } from "@/components/theme-provider"
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import NotificationProvider from '@/components/NotificationProvider'
import { useState, useEffect } from 'react'

export function Providers({ 
  children,
  session
}: { 
  children: React.ReactNode
  session: any
}) {
  // Create a client for each session
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        retry: 1,
        staleTime: 5 * 60 * 1000, // 5 minutes
      },
    },
  }))
  
  // Force light theme on first load to prevent flash
  useEffect(() => {
    document.documentElement.classList.remove('dark');
    document.documentElement.classList.add('light');
  }, []);

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={true}
      storageKey="pickleball-theme"
    >
      <SessionProvider session={session}>
        <QueryClientProvider client={queryClient}>
          <NotificationProvider>
            {children}
          </NotificationProvider>
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
      </SessionProvider>
    </ThemeProvider>
  )
}