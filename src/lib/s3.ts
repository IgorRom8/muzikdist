import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

// Создаем S3 клиент с кастомным endpoint
export const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'ru-7',
  endpoint: process.env.S3_ENDPOINT ? `https://${process.env.S3_ENDPOINT}` : undefined,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
  },
  forcePathStyle: true // Важно для кастомных S3-совместимых хранилищ
})

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME || ''
const S3_ENDPOINT = process.env.S3_ENDPOINT || ''

// Загрузка файла в S3
export async function uploadToS3(
  file: Buffer,
  fileName: string,
  contentType: string
): Promise<string> {
  try {
    console.log('S3 Config:', {
      region: process.env.AWS_REGION,
      endpoint: process.env.S3_ENDPOINT,
      bucket: BUCKET_NAME,
      hasAccessKey: !!process.env.AWS_ACCESS_KEY_ID,
      hasSecretKey: !!process.env.AWS_SECRET_ACCESS_KEY
    })

    const key = `${Date.now()}-${fileName}`

    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: file,
      ContentType: contentType,
      // Пробуем добавить метаданные для публичного доступа
      Metadata: {
        'Cache-Control': 'public, max-age=31536000'
      }
    })

    console.log('Sending to S3...')
    await s3Client.send(command)
    console.log('S3 upload successful')

    // Формируем URL через прокси API для обхода CORS
    // Это решает проблему ERR_BLOCKED_BY_ORB в Chrome
    const proxyUrl = `/api/proxy-file?key=${encodeURIComponent(key)}`
    
    console.log('File key:', key)
    console.log('Proxy URL:', proxyUrl)
    
    return proxyUrl
  } catch (error) {
    console.error('S3 upload error:', error)
    throw error
  }
}

// Удаление файла из S3
export async function deleteFromS3(fileUrl: string): Promise<void> {
  // Извлекаем ключ из URL
  const key = fileUrl.split('/').pop()
  
  if (!key) return

  const command = new DeleteObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key
  })

  await s3Client.send(command)
}

// Конвертация base64 в Buffer
export function base64ToBuffer(base64: string): Buffer {
  // Убираем префикс data:image/png;base64, или data:audio/mp3;base64,
  const base64Data = base64.replace(/^data:[^;]+;base64,/, '')
  return Buffer.from(base64Data, 'base64')
}

// Определение MIME типа из base64
export function getMimeTypeFromBase64(base64: string): string {
  const match = base64.match(/^data:([^;]+);base64,/)
  return match ? match[1] : 'application/octet-stream'
}
