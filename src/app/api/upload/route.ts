import { NextRequest, NextResponse } from 'next/server'
import { uploadToS3, base64ToBuffer, getMimeTypeFromBase64 } from '@/lib/s3'

// Увеличиваем лимит размера body для Vercel
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '50mb'
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('Upload API called')
    console.log('Request headers:', Object.fromEntries(request.headers.entries()))
    
    const body = await request.json()
    const { file, fileName } = body

    if (!file || !fileName) {
      console.error('Missing file or fileName')
      return NextResponse.json(
        { error: 'Файл и имя файла обязательны' },
        { status: 400 }
      )
    }

    console.log('Processing file:', fileName)
    console.log('File data length:', file.length)

    // Проверка размера (примерно)
    const estimatedSize = (file.length * 3) / 4 // base64 to bytes
    console.log('Estimated file size:', Math.round(estimatedSize / 1024 / 1024), 'MB')

    if (estimatedSize > 50 * 1024 * 1024) { // 50MB
      return NextResponse.json(
        { error: 'Файл слишком большой. Максимум 50MB' },
        { status: 413 }
      )
    }

    // Конвертируем base64 в Buffer
    console.log('Converting base64 to buffer...')
    const buffer = base64ToBuffer(file)
    console.log('Buffer size:', buffer.length, 'bytes')
    
    // Определяем MIME тип
    const contentType = getMimeTypeFromBase64(file)
    console.log('Content type:', contentType)

    // Проверяем S3 конфигурацию
    console.log('S3 Config check:', {
      hasEndpoint: !!process.env.S3_ENDPOINT,
      hasRegion: !!process.env.AWS_REGION,
      hasBucket: !!process.env.AWS_S3_BUCKET_NAME,
      hasAccessKey: !!process.env.AWS_ACCESS_KEY_ID,
      hasSecretKey: !!process.env.AWS_SECRET_ACCESS_KEY
    })

    // Загружаем в S3
    console.log('Uploading to S3...')
    try {
      const fileUrl = await uploadToS3(buffer, fileName, contentType)
      console.log('Upload successful:', fileUrl)
      return NextResponse.json({ url: fileUrl })
    } catch (s3Error: any) {
      console.error('S3 upload failed:', {
        message: s3Error.message,
        code: s3Error.Code || s3Error.code,
        statusCode: s3Error.$metadata?.httpStatusCode,
        requestId: s3Error.$metadata?.requestId,
        fault: s3Error.$fault,
        name: s3Error.name
      })
      
      // Более понятное сообщение об ошибке
      let errorMessage = 'Ошибка загрузки в S3'
      if (s3Error.name === 'AccessDenied' || s3Error.Code === 'AccessDenied') {
        errorMessage = 'Доступ запрещен. Проверьте S3 credentials и права доступа к bucket'
      } else if (s3Error.name === 'NoSuchBucket') {
        errorMessage = 'Bucket не найден. Проверьте имя bucket в настройках'
      }
      
      return NextResponse.json(
        { error: errorMessage, details: s3Error.message },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Upload error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      error
    })
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Ошибка загрузки файла',
        details: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}
