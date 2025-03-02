// src/scripts/create-admin.ts


import { PrismaClient } from "@prisma/client"
import * as bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function createInitialAdmin() {
  try {
    const existingAdmin = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    })

    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash('AdminPassword123!', 10)
      
      await prisma.user.create({
        data: {
          name: 'Site Administrator',
          email: 'admin@pickleball.com',
          password: hashedPassword,
          role: 'ADMIN',
          skill_level: 'PRO'
        }
      })
      
      console.log('Initial admin user created')
    } else {
      console.log('Admin user already exists')
    }
  } catch (error) {
    console.error('Error creating admin user:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createInitialAdmin()