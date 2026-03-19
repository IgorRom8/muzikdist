import { NextRequest, NextResponse } from 'next/server'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'ru-7',
  endpoint: process.env.S3_ENDPOINT ? `https://${process.env.S3_ENDPOINT}` : undefined,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
  },
  forcePathStyle: true,
  // Отключаем автоматический checksum — он добавляет заголовки вызывающие CORS preflight
  requestChecksumCalculation: 'WHEN_REQUIRED',
  responseChecksumValidation: 'WHEN_REQUIRED',
})

export async function POST(request: NextRequest) {
  try {
    const { fileName, fileType } = await request.json()

    if (!fileName || !fileType) {
      return NextResponse.json(
        { error: 'fileName and fileType are required' },
        { status: 400 }
      )
    }

    // Генерируем уникальное имя файла
    const key = `${Date.now()}-${fileName}`

    // Создаем команду для загрузки
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME || '',
      Key: key,
      ContentType: fileType
    })

    // Генерируем presigned URL (действителен 15 минут)
    const uploadUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 900,
      // Не подписываем Content-Type чтобы избежать preflight
      unhoistableHeaders: new Set(['content-type']),
    })

    // Формируем URL для доступа к файлу через прокси
    const fileUrl = `/api/proxy-file?key=${encodeURIComponent(key)}`

    return NextResponse.json({
      uploadUrl,
      fileUrl,
      key
    })
  } catch (error) {
    console.error('Generate upload URL error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error generating upload URL' },
      { status: 500 }
    )
  }
}
