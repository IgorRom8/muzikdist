import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Проверяем переменные окружения
    const config = {
      hasS3Endpoint: !!process.env.S3_ENDPOINT,
      hasRegion: !!process.env.AWS_REGION,
      hasAccessKey: !!process.env.AWS_ACCESS_KEY_ID,
      hasSecretKey: !!process.env.AWS_SECRET_ACCESS_KEY,
      hasBucket: !!process.env.AWS_S3_BUCKET_NAME,
      s3Endpoint: process.env.S3_ENDPOINT || 'NOT SET',
      region: process.env.AWS_REGION || 'NOT SET',
      bucket: process.env.AWS_S3_BUCKET_NAME || 'NOT SET',
      accessKeyLength: process.env.AWS_ACCESS_KEY_ID?.length || 0,
      secretKeyLength: process.env.AWS_SECRET_ACCESS_KEY?.length || 0
    }

    console.log('S3 Config Check:', config)

    return NextResponse.json({
      status: 'ok',
      config,
      allSet: config.hasS3Endpoint && config.hasRegion && config.hasAccessKey && config.hasSecretKey && config.hasBucket
    })
  } catch (error) {
    console.error('Test error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
