// src/app/layout.tsx

import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from "sonner"
import './globals.css'
import { Providers } from './providers'
import { MainNavigation } from "./navigation"

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Pickleball Court Booking',
  description: 'Book courts, find partners, and elevate your pickleball game',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0" />
      </head>
      <body className={inter.className}>
        <Providers>
          <MainNavigation />
          {children}
        </Providers>
        <Toaster />
      </body>
    </html>
  )
}
