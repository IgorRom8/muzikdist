import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET all playlists for user
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'userId обязателен' },
        { status: 400 }
      )
    }

    const playlists = await prisma.playlist.findMany({
      where: { userId },
      include: {
        tracks: {
          include: {
            track: true
          },
          orderBy: {
            order: 'asc'
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(playlists)
  } catch (error) {
    console.error('Error fetching playlists:', error)
    return NextResponse.json(
      { error: 'Ошибка загрузки плейлистов' },
      { status: 500 }
    )
  }
}

// POST create new playlist
export async function POST(request: NextRequest) {
  try {
    const { name, description, coverUrl, userId } = await request.json()

    if (!name || !userId) {
      return NextResponse.json(
        { error: 'name и userId обязательны' },
        { status: 400 }
      )
    }

    const playlist = await prisma.playlist.create({
      data: {
        name,
        description: description || '',
        coverUrl: coverUrl || '',
        userId
      }
    })

    return NextResponse.json(playlist, { status: 201 })
  } catch (error) {
    console.error('Error creating playlist:', error)
    return NextResponse.json(
      { error: 'Ошибка создания плейлиста' },
      { status: 500 }
    )
  }
}
