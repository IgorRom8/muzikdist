import { NextRequest, NextResponse } from 'next/server'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

export const runtime = 'nodejs'
// Отключаем bodyParser чтобы стримить файл напрямую
export const config = { api: { bodyParser: false } }

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'ru-7',
  endpoint: process.env.S3_ENDPOINT ? `https://${process.env.S3_ENDPOINT}` : undefined,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
  forcePathStyle: true,
  requestChecksumCalculation: 'WHEN_REQUIRED',
  responseChecksumValidation: 'WHEN_REQUIRED',
})

const BUCKET = process.env.AWS_S3_BUCKET_NAME || ''

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const fileName = formData.get('fileName') as string | null

    if (!file || !fileName) {
      return NextResponse.json({ error: 'file and fileName required' }, { status: 400 })
    }

    const key = `${Date.now()}-${fileName}`
    const contentType = file.type || 'application/octet-stream'

    // Генерируем presigned URL на сервере
    const command = new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      ContentType: contentType,
    })
    const presignedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 900,
      unhoistableHeaders: new Set(['content-type']),
    })

    // Стримим файл с сервера на S3 (браузер не обращается к S3 напрямую)
    const arrayBuffer = await file.arrayBuffer()
    const uploadRes = await fetch(presignedUrl, {
      method: 'PUT',
      body: arrayBuffer,
      // @ts-ignore — отключаем duplex для Node.js fetch
      duplex: 'half',
    })

    if (!uploadRes.ok) {
      const text = await uploadRes.text()
      console.error('S3 upload failed:', uploadRes.status, text)
      return NextResponse.json({ error: 'Ошибка загрузки в S3' }, { status: 500 })
    }

    const fileUrl = `/api/proxy-file?key=${encodeURIComponent(key)}`
    return NextResponse.json({ url: fileUrl })
  } catch (error) {
    console.error('Upload proxy error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Ошибка загрузки' },
      { status: 500 }
    )
  }
}
