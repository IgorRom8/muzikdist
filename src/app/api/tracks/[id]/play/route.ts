import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const track = await prisma.track.update({
      where: { id },
      data: { playCount: { increment: 1 } },
      select: { id: true, playCount: true },
    })

    return NextResponse.json(track)
  } catch (error) {
    console.error('Error recording play:', error)
    return NextResponse.json({ error: 'Ошибка записи прослушивания' }, { status: 500 })
  }
}
