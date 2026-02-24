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

    // Конвертируем S3 ключи в URL для клиента
    const tracksWithUrls = tracks.map(track => ({
      ...track,
      audioUrl: convertS3KeyToUrl(track.audioUrl),
      coverUrl: track.coverUrl ? convertS3KeyToUrl(track.coverUrl) : null
    }))

    return NextResponse.json(tracksWithUrls)
  } catch (error) {
    console.error('Error fetching tracks:', error)
    return NextResponse.json(
      { error: 'Ошибка загрузки треков' },
      { status: 500 }
    )
  }
}

// Конвертирует S3 ключ в URL
function convertS3KeyToUrl(s3Key: string): string {
  // Если это уже полный URL, возвращаем как есть
  if (s3Key.startsWith('http://') || s3Key.startsWith('https://')) {
    return s3Key
  }

  // Если это S3 ключ с префиксом s3://
  if (s3Key.startsWith('s3://')) {
    const key = s3Key.replace('s3://', '')
    return `/api/proxy-file?key=${encodeURIComponent(key)}`
  }

  // Если это просто ключ без префикса
  return `/api/proxy-file?key=${encodeURIComponent(s3Key)}`
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
