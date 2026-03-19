import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/nextauth'
import { prisma } from '@/lib/prisma'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()

  if (!session) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
  }

  const { id } = await params
  const track = await prisma.track.findUnique({ where: { id } })

  if (!track) {
    return NextResponse.json({ error: 'Трек не найден' }, { status: 404 })
  }

  // Удалять может владелец или admin
  if (track.userId !== session.user.id && session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Нет прав' }, { status: 403 })
  }

  await prisma.track.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
