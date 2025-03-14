// src/app/layout.tsx
import type { Metadata, Viewport } from 'next'
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
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Pickleball Booking',
  },
  applicationName: 'Pickleball Court Booking',
  formatDetection: {
    telephone: false,
  },
  themeColor: '#4f46e5',
  openGraph: {
    type: 'website',
    siteName: 'Pickleball Court Booking',
    title: 'Pickleball Court Booking',
    description: 'Book courts, find partners, and elevate your pickleball game',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#4f46e5',
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
        {/* No need for viewport meta tag here since we're using the viewport export */}
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