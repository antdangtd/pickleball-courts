// src/lib/auth.ts

import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { Session } from "next-auth";
import { UserRole, SkillLevel } from "@prisma/client";

// Utility functions moved outside of the authOptions
export async function isAdmin(session?: Session | null) {
  return session?.user?.role === 'ADMIN'
}

export async function isAuthorized(session?: Session | null, requiredRole?: UserRole) {
  if (!session?.user?.role) return false
  
  const roleHierarchy = {
    'ADMIN': ['ADMIN', 'COURT_MANAGER', 'USER'],
    'COURT_MANAGER': ['COURT_MANAGER', 'USER'],
    'USER': ['USER']
  }

  return roleHierarchy[requiredRole || 'USER']?.includes(session.user.role)
}

export const authOptions: NextAuthOptions = {
  debug: process.env.NODE_ENV === 'development', // Only debug in development
  
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },
  
  // Add cookies configuration
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === "production" 
        ? `__Secure-next-auth.session-token`
        : `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },

  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.password) {
          return null;
        }

        const isValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isValid) {
          return null;
        }

        console.log("Authorized User:", user);
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
          skill_level: user.skill_level,
        };
      },
    }),
  ],

  secret: process.env.NEXTAUTH_SECRET,

  callbacks: {
    async jwt({ token, user, account }) {
      console.log("JWT Callback - User:", user);
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.image = user.image;
        token.role = user.role || 'USER';
        token.skill_level = user.skill_level || 'BEGINNER_2_0';
      }
      
      // If this is a sign-in with Google, fetch the user from the database
      // to get their role and skill_level
      if (account?.provider === 'google') {
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email as string },
          select: { role: true, skill_level: true }
        });
        
        if (dbUser) {
          token.role = dbUser.role;
          token.skill_level = dbUser.skill_level;
        }
      }
      
      return token;
    },
    
    async session({ session, token }) {
      console.log("Session Callback - Token:", token);
      if (session?.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.image = token.image as string;
        session.user.role = (token.role as UserRole) || 'USER';
        session.user.skill_level = (token.skill_level as SkillLevel) || 'BEGINNER_2_0';
      }
      console.log("Session Callback - Session:", session);
      return session;
    },
  },
};