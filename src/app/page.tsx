//src/app/page.tsx
// This file contains the home page component. The component includes a hero section with a title and description, a features section with four feature cards, and a call-to-action section with a button to create an account.

'use client'

import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { 
  Calendar, 
  Users, 
  Clock, 
  Trophy 
} from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <section className="text-center mb-16">
          <h1 className="text-5xl font-bold text-green-800 mb-6">
            Pickleball Court Booking
          </h1>
          <p className="text-xl text-gray-700 max-w-2xl mx-auto mb-8">
            Seamlessly book courts, find partners, and elevate your pickleball experience. 
            Whether you're a beginner or a pro, we've got you covered.
          </p>
          <div className="flex justify-center space-x-4">
            <Button asChild size="lg">
              <Link href="/courts">
                Find Courts
              </Link>
            </Button>
            <Button variant="secondary" asChild size="lg">
              <Link href="/bookings/new">
                Book a Court
              </Link>
            </Button>
          </div>
        </section>

        {/* Features Section */}
        <section className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Calendar className="w-10 h-10 text-green-600 mb-4" />
              <CardTitle>Easy Booking</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Quick and simple court reservations with real-time availability.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Users className="w-10 h-10 text-blue-600 mb-4" />
              <CardTitle>Partner Matching</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Find players at your skill level and schedule games together.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Clock className="w-10 h-10 text-yellow-600 mb-4" />
              <CardTitle>Flexible Scheduling</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Book courts at times that work best for you and your schedule.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Trophy className="w-10 h-10 text-red-600 mb-4" />
              <CardTitle>Skill Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Track your progress and match with players of similar abilities.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Call to Action */}
        <section className="bg-white rounded-lg shadow-md p-12 text-center">
          <h2 className="text-3xl font-bold text-green-800 mb-6">
            Ready to Play?
          </h2>
          <p className="text-xl text-gray-700 mb-8">
            Join our community and take your pickleball game to the next level.
          </p>
          <Button asChild size="lg">
            <Link href="/register">
              Create Account
            </Link>
          </Button>
        </section>
      </div>
    </div>
  )
}