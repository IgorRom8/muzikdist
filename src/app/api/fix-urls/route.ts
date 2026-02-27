import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Получаем все треки
    const tracks = await prisma.track.findMany()
    
    let updated = 0
    let errors = 0

    // Обновляем треки с s3:// URL или прямыми S3 URL
    for (const track of tracks) {
      try {
        const needsUpdate = 
          track.audioUrl.startsWith('s3://') || 
          track.audioUrl.includes('s3.ru-7.storage.selcloud.ru') ||
          (track.coverUrl && (
            track.coverUrl.startsWith('s3://') || 
            track.coverUrl.includes('s3.ru-7.storage.selcloud.ru')
          ))

        if (needsUpdate) {
          // Извлекаем ключ из URL
          const audioKey = extractKeyFromUrl(track.audioUrl)
          const coverKey = track.coverUrl ? extractKeyFromUrl(track.coverUrl) : null

          await prisma.track.update({
            where: { id: track.id },
            data: {
              audioUrl: `/api/proxy-file?key=${encodeURIComponent(audioKey)}`,
              coverUrl: coverKey ? `/api/proxy-file?key=${encodeURIComponent(coverKey)}` : null
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

// Извлекает ключ из различных форматов URL
function extractKeyFromUrl(url: string): string {
  if (url.startsWith('s3://')) {
    return url.replace('s3://', '')
  }
  
  if (url.includes('/api/proxy-file?key=')) {
    const urlObj = new URL(url, 'http://localhost')
    return decodeURIComponent(urlObj.searchParams.get('key') || '')
  }
  
  if (url.includes('s3.ru-7.storage.selcloud.ru')) {
    // Извлекаем ключ из URL вида: https://s3.ru-7.storage.selcloud.ru/s3-muzik/key
    const parts = url.split('/')
    return parts[parts.length - 1]
  }
  
  return url
}
