//src/app/navigation.tsx
// This file contains the main navigation component. The navigation component contains links to browse courts, book courts, find players, and access the admin console. The component also includes user actions such as login, profile, and logout.

// src/app/navigation.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { 
  NavigationMenu, 
  NavigationMenuContent, 
  NavigationMenuItem, 
  NavigationMenuLink, 
  NavigationMenuList, 
  NavigationMenuTrigger,
  navigationMenuTriggerStyle 
} from "@/components/ui/navigation-menu"
import { Button } from "@/components/ui/button"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { Users, Menu, X } from 'lucide-react'

export function MainNavigation() {
  const { data: session } = useSession()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 flex justify-between items-center py-4">
        {/* Logo */}
        <Link href="/" className="text-2xl font-bold text-green-700">
          PickleBall Courts
        </Link>

        {/* Mobile menu button */}
        <button 
          className="md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Desktop Navigation */}
        <div className="hidden md:flex md:items-center md:space-x-4">
          <NavigationMenu>
            <NavigationMenuList>
              {/* Courts */}
              <NavigationMenuItem>
                <NavigationMenuTrigger>Courts</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid gap-3 p-4 md:w-[400px] lg:w-[500px]">
                    <li>
                      <NavigationMenuLink asChild>
                        <Link
                          href="/courts"
                          className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                        >
                          <div className="text-sm font-medium leading-none">Find Courts</div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            Browse available courts and check their availability
                          </p>
                        </Link>
                      </NavigationMenuLink>
                    </li>
                    <li>
                      <NavigationMenuLink asChild>
                        <Link
                          href="/bookings/new"
                          className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                        >
                          <div className="text-sm font-medium leading-none">Book a Court</div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            Quick and easy court reservation
                          </p>
                        </Link>
                      </NavigationMenuLink>
                    </li>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>

              {/* Players */}
              <NavigationMenuItem>
                <NavigationMenuTrigger>Players</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid gap-3 p-4 md:w-[400px] lg:w-[500px]">
                    <li>
                      <NavigationMenuLink asChild>
                        <Link
                          href="/players/find"
                          className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                        >
                          <div className="text-sm font-medium leading-none">Find Players</div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            Match with players at your skill level
                          </p>
                        </Link>
                      </NavigationMenuLink>
                    </li>
                    <li>
                      <NavigationMenuLink asChild>
                        <Link
                          href="/tournaments"
                          className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                        >
                          <div className="text-sm font-medium leading-none">Tournaments</div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            Upcoming pickleball tournaments and events
                          </p>
                        </Link>
                      </NavigationMenuLink>
                    </li>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>

              {/* My Bookings */}
              <NavigationMenuItem>
                <Link href="/bookings" legacyBehavior passHref>
                  <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                    My Bookings
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
              
              {/* Dashboard - for all users */}
              <NavigationMenuItem>
                <Link href="/dashboard" legacyBehavior passHref>
                  <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                    Dashboard
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

          {/* User Actions */}
          <div className="flex items-center">
            {session ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Users className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Link href="/dashboard" className="w-full">Dashboard</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link href="/profile/complete" className="w-full">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Button 
                      variant="destructive" 
                      onClick={() => signOut({ 
                        callbackUrl: window.location.origin || "/"
                      })}
                      className="w-full"
                    >
                      Logout
                    </Button>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/login">
                <Button>Login</Button>
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="absolute top-16 left-0 right-0 bg-white shadow-md p-4 z-50 md:hidden flex flex-col space-y-4">
            <Link href="/courts" className="py-2 px-4 hover:bg-gray-100 rounded">
              Find Courts
            </Link>
            <Link href="/bookings/new" className="py-2 px-4 hover:bg-gray-100 rounded">
              Book a Court
            </Link>
            <Link href="/players/find" className="py-2 px-4 hover:bg-gray-100 rounded">
              Find Players
            </Link>
            <Link href="/tournaments" className="py-2 px-4 hover:bg-gray-100 rounded">
              Tournaments
            </Link>
            <Link href="/bookings" className="py-2 px-4 hover:bg-gray-100 rounded">
              My Bookings
            </Link>
            <Link href="/dashboard" className="py-2 px-4 hover:bg-gray-100 rounded">
              Dashboard
            </Link>
            
            {session ? (
              <>
                <Link href="/profile/complete" className="py-2 px-4 hover:bg-gray-100 rounded">
                  Profile
                </Link>
                <Button 
                  variant="destructive" 
                  onClick={() => signOut({ 
                    callbackUrl: window.location.origin || "/"
                  })}
                  className="w-full"
                >
                  Logout
                </Button>
              </>
            ) : (
              <Link href="/login">
                <Button className="w-full">Login</Button>
              </Link>
            )}
          </div>
        )}
      </div>
    </header>
  )
}