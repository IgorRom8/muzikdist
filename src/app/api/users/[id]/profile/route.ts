import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

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
        email: true,
        name: true,
        avatar: true,
        role: true,
        createdAt: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'Пользователь не найден' }, { status: 404 })
    }

    const [tracks, tracksCount, playlistsCount, favoritesCount, durationAgg, playsAgg] =
      await Promise.all([
        prisma.track.findMany({
          where: { userId: id },
          orderBy: [{ playCount: 'desc' }, { createdAt: 'desc' }],
        }),
        prisma.track.count({ where: { userId: id } }),
        prisma.playlist.count({ where: { userId: id } }),
        prisma.favorite.count({ where: { userId: id } }),
        prisma.track.aggregate({
          where: { userId: id },
          _sum: { duration: true },
        }),
        prisma.track.aggregate({
          where: { userId: id },
          _sum: { playCount: true },
        }),
      ])

    const genres = [...new Set(tracks.map((t) => t.genre).filter(Boolean))]
    const totalPlays = playsAgg._sum.playCount ?? 0
    const topTrack = tracks.length > 0 ? tracks[0] : null

    return NextResponse.json({
      user,
      stats: {
        tracksCount,
        playlistsCount,
        favoritesCount,
        totalDuration: durationAgg._sum.duration ?? 0,
        genresCount: genres.length,
        totalPlays,
        topTrackTitle: topTrack?.title ?? null,
        topTrackPlays: topTrack?.playCount ?? 0,
        memberSince: user.createdAt,
      },
      tracks,
    })
  } catch (error) {
    console.error('Error fetching profile:', error)
    return NextResponse.json({ error: 'Ошибка загрузки профиля' }, { status: 500 })
  }
}
