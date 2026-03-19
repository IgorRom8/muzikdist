import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const user = await prisma.user.findUnique({ where: { email: 'admin@musicstream.com' } })
console.log('User in DB:', user ? { id: user.id, email: user.email, role: user.role } : 'NOT FOUND')

if (user) {
  const valid = await bcrypt.compare('admin123', user.password)
  console.log('Password valid:', valid)
}

await prisma.$disconnect()
