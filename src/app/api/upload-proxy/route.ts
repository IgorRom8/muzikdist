import { NextRequest, NextResponse } from 'next/server'
import { uploadToS3 } from '@/lib/s3'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const fileName = formData.get('fileName') as string | null

    if (!file || !fileName) {
      return NextResponse.json({ error: 'file and fileName required' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const contentType = file.type || 'application/octet-stream'

    const url = await uploadToS3(buffer, fileName, contentType)
    return NextResponse.json({ url })
  } catch (error) {
    console.error('Upload proxy error:', error)
    const message =
      error instanceof Error ? error.message : 'Ошибка загрузки'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
