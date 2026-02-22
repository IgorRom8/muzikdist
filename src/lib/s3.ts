import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'

// Создаем S3 клиент
export const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
  }
})

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME || ''

// Загрузка файла в S3
export async function uploadToS3(
  file: Buffer,
  fileName: string,
  contentType: string
): Promise<string> {
  const key = `${Date.now()}-${fileName}`

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: file,
    ContentType: contentType
  })

  await s3Client.send(command)

  // Возвращаем публичный URL
  return `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`
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
