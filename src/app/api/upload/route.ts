import { NextRequest, NextResponse } from 'next/server'
import { saveFileLocally, base64ToBuffer, getFileType } from '@/lib/localStorage'

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
    
    // Определяем тип файла (audio или images)
    const fileType = getFileType(file)

    // Сохраняем локально
    const fileUrl = await saveFileLocally(buffer, fileName, fileType)

    return NextResponse.json({ url: fileUrl })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Ошибка загрузки файла' },
      { status: 500 }
    )
  }
}
