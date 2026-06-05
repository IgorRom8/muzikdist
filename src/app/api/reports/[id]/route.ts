import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/nextauth'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Нет доступа' }, { status: 403 })
    }

    const { id } = await params
    const data = await request.json()

    const report = await prisma.report.update({
      where: { id },
      data: {
        status: data.status === 'REVIEWED' ? 'REVIEWED' : 'PENDING',
      },
    })

    return NextResponse.json(report)
  } catch (error) {
    console.error('Error updating report:', error)
    return NextResponse.json({ error: 'Ошибка обновления жалобы' }, { status: 500 })
  }
}
