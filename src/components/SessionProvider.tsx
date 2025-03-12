'use client'

import { SessionProvider } from "next-auth/react"

export default function NextAuthSessionProvider({ 
  children,
  session = null
}: { 
  children: React.ReactNode,
  session?: any
}) {
  return (
    <SessionProvider session={session}>
      {children}
    </SessionProvider>
  )
}