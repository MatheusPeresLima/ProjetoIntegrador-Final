import { PrismaClient } from '@prisma/client'

declare global {
  var prisma: PrismaClient
}

let Prisma: PrismaClient
if (!global.prisma) {
  Prisma = new PrismaClient()
  global.prisma = Prisma
} else Prisma = global.prisma

export default Prisma
