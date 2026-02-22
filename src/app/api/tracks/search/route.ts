import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('q')

    if (!query) {
      return NextResponse.json([])
    }

    // Поиск по названию трека, исполнителю и альбому
    const tracks = await prisma.track.findMany({
      where: {
        OR: [
          {
            title: {
              contains: query,
              mode: 'insensitive'
            }
          },
          {
            artist: {
              contains: query,
              mode: 'insensitive'
            }
          },
          {
            album: {
              contains: query,
              mode: 'insensitive'
            }
          }
        ]
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(tracks)
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json(
      { error: 'Ошибка поиска' },
      { status: 500 }
    )
  }
}
