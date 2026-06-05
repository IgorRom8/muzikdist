import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/nextauth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Нет доступа' }, { status: 403 })
    }

    const reports = await prisma.report.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        track: {
          select: {
            id: true,
            title: true,
            artist: true,
            uploader: true,
            genre: true,
          },
        },
      },
    })

    const pendingCount = reports.filter((r) => r.status === 'PENDING').length

    return NextResponse.json({ reports, pendingCount })
  } catch (error) {
    console.error('Error fetching reports:', error)
    return NextResponse.json({ error: 'Ошибка загрузки жалоб' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    const data = await request.json()

    if (!data.trackId) {
      return NextResponse.json({ error: 'trackId обязателен' }, { status: 400 })
    }

    const track = await prisma.track.findUnique({
      where: { id: data.trackId },
    })

    if (!track) {
      return NextResponse.json({ error: 'Трек не найден' }, { status: 404 })
    }

    const report = await prisma.report.create({
      data: {
        trackId: data.trackId,
        reporterId: session?.user?.id ?? null,
        reporterName: session?.user?.name ?? 'Гость',
        message: data.message?.trim() || null,
      },
    })

    return NextResponse.json(report, { status: 201 })
  } catch (error) {
    console.error('Error creating report:', error)
    return NextResponse.json({ error: 'Ошибка отправки жалобы' }, { status: 500 })
  }
}
