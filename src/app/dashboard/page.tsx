// src/app/dashboard/page.tsx
// This file contains the dashboard page. The page contains tabs for overview, bookings, calendar, and court management. The page is accessible to all users, but the court management tab is only visible to admin users.

'use client'

import { useState, useEffect } from 'react'
import { useSession } from "next-auth/react"
import { redirect, useSearchParams } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import CourtsCalendar from "@/components/CourtsCalendar"
import { CourtManagement } from "@/components/admin/CourtManagement"
import { UserManagement } from "@/components/admin/UserManagement"

export default function Dashboard() {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      redirect('/login')
    }
  })

  // Get the tab from URL query parameters
  const searchParams = useSearchParams()
  const tabParam = searchParams.get('tab')

  // Initialize with either the URL parameter or 'overview'
  const [activeTab, setActiveTab] = useState('overview')
  
  // Update active tab when URL parameter changes
  useEffect(() => {
    if (tabParam && ['overview', 'bookings', 'calendar', 'manage-courts', 'manage-users'].includes(tabParam)) {
      setActiveTab(tabParam)
    }
  }, [tabParam])

  const isAdmin = session?.user?.role === 'ADMIN'

  if (status === "loading") {
    return <div className="container mx-auto p-6">Loading...</div>
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
      <p className="text-gray-500 mb-6">
        Welcome back, {session?.user?.name || 'Player'}
      </p>
      
      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="bookings">My Bookings</TabsTrigger>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
          {isAdmin && <TabsTrigger value="manage-courts">Manage Courts</TabsTrigger>}
          {isAdmin && <TabsTrigger value="manage-users">Manage Users</TabsTrigger>}
        </TabsList>
        
        {/* Overview Tab */}
        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="space-y-2">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Upcoming Bookings</dt>
                    <dd className="text-2xl font-bold">0</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Skill Level</dt>
                    <dd className="text-xl font-semibold">{session?.user?.skillLevel || 'Not set'}</dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Book a Court</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col space-y-4">
                <p>Quick and easy court reservation</p>
                <Button variant="default" asChild>
                  <Link href="/dashboard?tab=calendar">Book Now</Link>
                </Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Find Players</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col space-y-4">
                <p>Match with players at your skill level</p>
                <Button variant="outline" asChild>
                  <Link href="/players/find">Find Players</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Bookings Tab */}
        <TabsContent value="bookings">
          <Card>
            <CardHeader>
              <CardTitle>Your Bookings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">You don't have any upcoming bookings.</p>
              <Button asChild>
                <Link href="/dashboard?tab=calendar">Book a Court</Link>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Calendar Tab */}
        <TabsContent value="calendar">
          <Card>
            <CardHeader>
              <CardTitle>Court Calendar</CardTitle>
              <CardDescription>View and manage court availability</CardDescription>
            </CardHeader>
            <CardContent>
              <CourtsCalendar />
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Manage Courts Tab (Admin Only) */}
        {isAdmin && (
          <TabsContent value="manage-courts">
            <Card>
              <CardHeader>
                <CardTitle>Court Management</CardTitle>
                <CardDescription>Add, edit, and manage courts</CardDescription>
              </CardHeader>
              <CardContent>
                <CourtManagement />
              </CardContent>
            </Card>
          </TabsContent>
        )}
        
        {/* Manage Users Tab (Admin Only) */}
        {isAdmin && (
          <TabsContent value="manage-users">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>Manage users and their permissions</CardDescription>
              </CardHeader>
              <CardContent>
                <UserManagement />
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}