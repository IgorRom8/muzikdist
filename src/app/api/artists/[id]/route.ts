import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { groupDiscography } from '@/lib/discography'
import { Track } from '@/types'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        avatar: true,
        createdAt: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'Артист не найден' }, { status: 404 })
    }

    const rawTracks = await prisma.track.findMany({
      where: { userId: id },
      orderBy: { createdAt: 'desc' },
    })

    const tracks: Track[] = rawTracks.map((t) => ({
      id: t.id,
      title: t.title,
      artist: t.artist,
      album: t.album,
      duration: t.duration,
      coverUrl: t.coverUrl || '',
      audioUrl: t.audioUrl,
      genre: t.genre,
      uploader: t.uploader ?? undefined,
      playCount: t.playCount,
      userId: t.userId,
      createdAt: t.createdAt.toISOString(),
    }))

    const { singles, albums } = groupDiscography(tracks)

    return NextResponse.json({
      artist: user,
      stats: {
        tracksCount: tracks.length,
        albumsCount: albums.length,
        singlesCount: singles.length,
      },
      singles,
      albums,
      tracks,
    })
  } catch (error) {
    console.error('Error fetching artist:', error)
    return NextResponse.json(
      { error: 'Ошибка загрузки дискографии' },
      { status: 500 }
    )
  }
}
