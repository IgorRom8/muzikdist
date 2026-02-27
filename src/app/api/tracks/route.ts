import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET all tracks
export async function GET() {
  try {
    const tracks = await prisma.track.findMany({
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        user: {
          select: {
            name: true
          }
        }
      }
    })

    return NextResponse.json(tracks)
  } catch (error) {
    console.error('Error fetching tracks:', error)
    return NextResponse.json(
      { error: 'Ошибка загрузки треков' },
      { status: 500 }
    )
  }
}

// POST create new track
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    const track = await prisma.track.create({
      data: {
        title: data.title,
        artist: data.artist,
        album: data.album,
        duration: data.duration,
        coverUrl: data.coverUrl || '',
        audioUrl: data.audioUrl,
        genre: data.genre,
        uploader: data.uploader,
        userId: data.userId
      }
    })

    return NextResponse.json(track, { status: 201 })
  } catch (error) {
    console.error('Error creating track:', error)
    return NextResponse.json(
      { error: 'Ошибка создания трека' },
      { status: 500 }
    )
  }
}
