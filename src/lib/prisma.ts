//src/lib/prisma.ts
// This file is used to create a Prisma client instance and export it as a singleton. The Prisma client instance is then used in other parts of the application to interact with the database.

import { PrismaClient } from "@prisma/client"

const prismaClientSingleton = () => {
  return new PrismaClient()
}

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>
}

const prisma = globalThis.prisma ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma