import { NextRequest, NextResponse } from 'next/server'
import { uploadToS3 } from '@/lib/s3'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const fileName = formData.get('fileName') as string | null

    if (!file || !fileName) {
      return NextResponse.json(
        { error: 'Файл и имя файла обязательны' },
        { status: 400 }
      )
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const contentType = file.type || 'application/octet-stream'

    console.log('Uploading to S3:', fileName, buffer.length, 'bytes')

    try {
      const fileUrl = await uploadToS3(buffer, fileName, contentType)
      return NextResponse.json({ url: fileUrl })
    } catch (s3Error: any) {
      console.error('S3 upload failed:', s3Error.message)
      return NextResponse.json(
        { error: 'Ошибка загрузки в S3', details: s3Error.message },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Ошибка загрузки файла' },
      { status: 500 }
    )
  }
}
