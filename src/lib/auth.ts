// src/lib/auth.ts

import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { Session } from "next-auth";
import { UserRole } from "@prisma/client";

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
  debug: true,

  session: {
    strategy: "jwt",
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
        };
      },
    }),
  ],

  secret: process.env.NEXTAUTH_SECRET,

  callbacks: {
    async jwt({ token, user }) {
      console.log("JWT Callback - User:", user);
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.image = user.image;
        token.role = user.role || 'USER';
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
      }
      console.log("Session Callback - Session:", session);
      return session;
    },
    events: {
      signOut: async ({ url }) => {
        const baseUrl = url.origin || process.env.NEXTAUTH_URL || 'http://localhost:3000';
        url.pathname = '/';
        return baseUrl;
      }
    },
  },
};