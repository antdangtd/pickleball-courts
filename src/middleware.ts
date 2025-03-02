import { getToken } from "next-auth/jwt"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { UserRole } from "@prisma/client"

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request })
  const path = request.nextUrl.pathname

  // Define routes that require specific roles
  const adminRoutes = ['/admin', '/admin/:path*']
  const courtManagerRoutes = ['/manage', '/manage/:path*']

  // Check for admin routes
  if (adminRoutes.some(route => 
    new RegExp(`^${route.replace(':path*', '.*')}$`).test(path)
  )) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url))
    }

    if (token.role !== 'ADMIN') {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }
  }

  // Check for court manager routes
  if (courtManagerRoutes.some(route => 
    new RegExp(`^${route.replace(':path*', '.*')}$`).test(path)
  )) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url))
    }

    if (token.role !== 'ADMIN' && token.role !== 'COURT_MANAGER') {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }
  }

  // Default dashboard protection
  if (path.startsWith('/dashboard')) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*', 
    '/admin/:path*', 
    '/manage/:path*'
  ]
}