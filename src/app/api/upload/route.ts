import { NextRequest, NextResponse } from 'next/server'
import { uploadToS3, base64ToBuffer, getMimeTypeFromBase64 } from '@/lib/s3'

export async function POST(request: NextRequest) {
  try {
    const { file, fileName } = await request.json()

    if (!file || !fileName) {
      return NextResponse.json(
        { error: 'Файл и имя файла обязательны' },
        { status: 400 }
      )
    }

    // Конвертируем base64 в Buffer
    const buffer = base64ToBuffer(file)
    
    // Определяем MIME тип
    const contentType = getMimeTypeFromBase64(file)

    // Загружаем в S3
    const fileUrl = await uploadToS3(buffer, fileName, contentType)

    return NextResponse.json({ url: fileUrl })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Ошибка загрузки файла' },
      { status: 500 }
    )
  }
}
