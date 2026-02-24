// Утилита для конвертации S3 ключей в URL

export function getFileUrl(s3Key: string): string {
  // Если это уже полный URL, возвращаем как есть
  if (s3Key.startsWith('http://') || s3Key.startsWith('https://')) {
    return s3Key
  }

  // Если это S3 ключ с префиксом s3://
  if (s3Key.startsWith('s3://')) {
    const key = s3Key.replace('s3://', '')
    // Используем прокси API для доступа к файлам
    return `/api/proxy-file?key=${encodeURIComponent(key)}`
  }

  // Если это просто ключ без префикса
  return `/api/proxy-file?key=${encodeURIComponent(s3Key)}`
}

// Извлекает ключ из S3 URL или возвращает как есть
export function extractS3Key(url: string): string {
  if (url.startsWith('s3://')) {
    return url.replace('s3://', '')
  }
  
  // Если это URL с прокси
  if (url.includes('/api/proxy-file?key=')) {
    const urlObj = new URL(url, 'http://localhost')
    return decodeURIComponent(urlObj.searchParams.get('key') || '')
  }

  // Если это прямой S3 URL
  if (url.includes('storage.selcloud.ru')) {
    const parts = url.split('/')
    return parts[parts.length - 1]
  }

  return url
}
