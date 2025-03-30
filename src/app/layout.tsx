// src/app/layout.tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from "sonner"
import './globals.css'
import { Providers } from './providers'
import { MainNavigation } from "./navigation"
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Pickleball Court Booking',
  description: 'Book courts, find partners, and elevate your pickleball game',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Pre-fetch the session on the server
  const session = await getServerSession(authOptions)
  
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0" />
      </head>
      <body className={inter.className}>
        <Providers session={session}>
          <MainNavigation />
          {children}
        </Providers>
        <Toaster />
      </body>
    </html>
  )
}