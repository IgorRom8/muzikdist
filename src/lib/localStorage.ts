import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

// Локальное хранилище файлов (альтернатива S3)
export async function saveFileLocally(
  file: Buffer,
  fileName: string,
  folder: 'audio' | 'images'
): Promise<string> {
  try {
    // Создаем папку если её нет
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', folder)
    await mkdir(uploadDir, { recursive: true })

    // Генерируем уникальное имя файла
    const uniqueName = `${Date.now()}-${fileName}`
    const filePath = path.join(uploadDir, uniqueName)

    // Сохраняем файл
    await writeFile(filePath, file)

    // Возвращаем публичный URL
    return `/uploads/${folder}/${uniqueName}`
  } catch (error) {
    console.error('Error saving file locally:', error)
    throw new Error('Ошибка сохранения файла')
  }
}

// Конвертация base64 в Buffer
export function base64ToBuffer(base64: string): Buffer {
  const base64Data = base64.replace(/^data:[^;]+;base64,/, '')
  return Buffer.from(base64Data, 'base64')
}

// Определение типа файла
export function getFileType(base64: string): 'audio' | 'images' {
  if (base64.startsWith('data:audio/')) {
    return 'audio'
  }
  return 'images'
}
