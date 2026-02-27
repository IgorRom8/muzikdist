import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Утилита для конвертации URL
function convertS3KeyToUrl(s3Key: string): string {
  if (!s3Key) return ''
  
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

export async function GET() {
  try {
    // Получаем все треки
    const tracks = await prisma.track.findMany()
    
    let updated = 0
    let errors = 0

    // Обновляем треки с s3:// URL
    for (const track of tracks) {
      try {
        const needsUpdate = 
          track.audioUrl.startsWith('s3://') || 
          (track.coverUrl && track.coverUrl.startsWith('s3://'))

        if (needsUpdate) {
          await prisma.track.update({
            where: { id: track.id },
            data: {
              audioUrl: convertS3KeyToUrl(track.audioUrl),
              coverUrl: track.coverUrl ? convertS3KeyToUrl(track.coverUrl) : null
            }
          })
          updated++
        }
      } catch (error) {
        console.error(`Error updating track ${track.id}:`, error)
        errors++
      }
    }

    return NextResponse.json({
      success: true,
      total: tracks.length,
      updated,
      errors,
      message: `Updated ${updated} tracks, ${errors} errors`
    })
  } catch (error) {
    console.error('Fix URLs error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
