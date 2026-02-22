import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST add track to playlist
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: playlistId } = await params
    const { trackId } = await request.json()

    if (!trackId) {
      return NextResponse.json(
        { error: 'trackId обязателен' },
        { status: 400 }
      )
    }

    // Проверяем, не добавлен ли уже трек
    const existing = await prisma.playlistTrack.findUnique({
      where: {
        playlistId_trackId: {
          playlistId,
          trackId
        }
      }
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Трек уже в плейлисте' },
        { status: 400 }
      )
    }

    // Получаем максимальный order
    const maxOrder = await prisma.playlistTrack.findFirst({
      where: { playlistId },
      orderBy: { order: 'desc' },
      select: { order: true }
    })

    const playlistTrack = await prisma.playlistTrack.create({
      data: {
        playlistId,
        trackId,
        order: (maxOrder?.order || 0) + 1
      },
      include: {
        track: true
      }
    })

    return NextResponse.json(playlistTrack, { status: 201 })
  } catch (error) {
    console.error('Error adding track to playlist:', error)
    return NextResponse.json(
      { error: 'Ошибка добавления трека' },
      { status: 500 }
    )
  }
}

// DELETE remove track from playlist
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: playlistId } = await params
    const searchParams = request.nextUrl.searchParams
    const trackId = searchParams.get('trackId')

    if (!trackId) {
      return NextResponse.json(
        { error: 'trackId обязателен' },
        { status: 400 }
      )
    }

    await prisma.playlistTrack.delete({
      where: {
        playlistId_trackId: {
          playlistId,
          trackId
        }
      }
    })

    return NextResponse.json({ message: 'Трек удален из плейлиста' })
  } catch (error) {
    console.error('Error removing track from playlist:', error)
    return NextResponse.json(
      { error: 'Ошибка удаления трека' },
      { status: 500 }
    )
  }
}
