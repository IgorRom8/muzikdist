import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const email = 'admin@musicstream.com'
const plainPassword = 'admin123'

// Удаляем старого admin и создаём заново
await prisma.user.deleteMany({ where: { email } })

const password = await bcrypt.hash(plainPassword, 10)
const user = await prisma.user.create({
  data: {
    email,
    name: 'Admin',
    password,
    role: 'ADMIN',
    avatar: 'https://ui-avatars.com/api/?name=Admin&background=dc2626&color=fff',
  },
})

// Проверяем что хеш работает
const valid = await bcrypt.compare(plainPassword, user.password)
console.log('Admin created:', user.email, '| role:', user.role, '| password check:', valid)

await prisma.$disconnect()
