import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/nextauth'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
  }

  const { id } = await params

  try {
    const notification = await prisma.notification.findUnique({ where: { id } })
    if (!notification || notification.userId !== session.user.id) {
      return NextResponse.json({ error: 'Не найдено' }, { status: 404 })
    }

    await prisma.notification.update({
      where: { id },
      data: { read: true },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Notification PATCH error:', error)
    return NextResponse.json({ error: 'Ошибка обновления' }, { status: 500 })
  }
}
