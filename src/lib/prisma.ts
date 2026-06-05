import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient() {
  return new PrismaClient()
}

function getPrisma(): PrismaClient {
  const cached = globalForPrisma.prisma
  // После добавления моделей старый кэш в dev не содержит новых делегатов
  if (cached && 'notification' in cached) {
    return cached
  }

  const client = createPrismaClient()
  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = client
  }
  return client
}

export const prisma = getPrisma()
