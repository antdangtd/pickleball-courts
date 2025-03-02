// Code: src/app/provider.tsx
// This file contains the provider component that wraps the application with the NextAuth session provider.

'use client'

import { SessionProvider } from 'next-auth/react'

export function Providers({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>
}
