// src/app/providers.tsx
'use client'

import { useEffect } from 'react'
import { SessionProvider } from 'next-auth/react'

export function Providers({ 
  children,
  session = null
}: { 
  children: React.ReactNode,
  session?: any
}) {
  // Add debug logging for session issues
  useEffect(() => {
    console.log('Provider mounted with session:', session ? 'Session exists' : 'No session')
  }, [session])

  return (
    <SessionProvider session={session}>
      {children}
    </SessionProvider>
  )
}