import { NextRequest, NextResponse } from 'next/server'
import { uploadToS3, base64ToBuffer, getMimeTypeFromBase64 } from '@/lib/s3'

export async function POST(request: NextRequest) {
  try {
    console.log('Upload API called')
    
    const { file, fileName } = await request.json()

    if (!file || !fileName) {
      console.error('Missing file or fileName')
      return NextResponse.json(
        { error: 'Файл и имя файла обязательны' },
        { status: 400 }
      )
    }

    console.log('Processing file:', fileName)

    // Конвертируем base64 в Buffer
    const buffer = base64ToBuffer(file)
    console.log('Buffer size:', buffer.length)
    
    // Определяем MIME тип
    const contentType = getMimeTypeFromBase64(file)
    console.log('Content type:', contentType)

    // Загружаем в S3
    console.log('Uploading to S3...')
    const fileUrl = await uploadToS3(buffer, fileName, contentType)
    console.log('Upload successful:', fileUrl)

    return NextResponse.json({ url: fileUrl })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Ошибка загрузки файла' },
      { status: 500 }
    )
  }
}
