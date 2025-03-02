import "next-auth"
import { SkillLevel, UserRole } from "@prisma/client"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      skillLevel?: SkillLevel | null
      role?: UserRole | null
    }
  }

  interface User {
    id: string
    skill_level?: SkillLevel
    role?: UserRole
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    skillLevel?: SkillLevel
    role?: UserRole
  }
}