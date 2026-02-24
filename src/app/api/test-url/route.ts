import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const url = searchParams.get('url')

  if (!url) {
    return NextResponse.json({ error: 'URL parameter required' }, { status: 400 })
  }

  try {
    // Пробуем загрузить файл
    const response = await fetch(url, { method: 'HEAD' })
    
    return NextResponse.json({
      url,
      accessible: response.ok,
      status: response.status,
      statusText: response.statusText,
      contentType: response.headers.get('content-type'),
      contentLength: response.headers.get('content-length'),
      headers: Object.fromEntries(response.headers.entries())
    })
  } catch (error) {
    return NextResponse.json({
      url,
      accessible: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
