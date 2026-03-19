import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const email = 'admin@musicstream.com'
  const existing = await prisma.user.findUnique({ where: { email } })

  if (existing) {
    // Обновляем роль если уже существует
    await prisma.user.update({ where: { email }, data: { role: 'ADMIN' } })
    console.log('Admin role updated for existing user')
    return
  }

  const password = await bcrypt.hash('admin123', 10)
  await prisma.user.create({
    data: {
      email,
      name: 'Admin',
      password,
      role: 'ADMIN',
      avatar: 'https://ui-avatars.com/api/?name=Admin&background=dc2626&color=fff',
    },
  })
  console.log('Admin created: admin@musicstream.com / admin123')
}

main().catch(console.error).finally(() => prisma.$disconnect())
