import { NextResponse } from 'next/server'
import { S3Client, ListBucketsCommand, HeadBucketCommand } from '@aws-sdk/client-s3'

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

    // Пробуем подключиться к S3
    const s3Client = new S3Client({
      region: process.env.AWS_REGION || 'ru-7',
      endpoint: process.env.S3_ENDPOINT ? `https://${process.env.S3_ENDPOINT}` : undefined,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
      },
      forcePathStyle: true
    })

    let s3Test: { success: boolean; error: { message: string; code: string; statusCode?: number } | null } = { 
      success: false, 
      error: null 
    }
    
    try {
      // Проверяем доступ к bucket
      const headCommand = new HeadBucketCommand({
        Bucket: process.env.AWS_S3_BUCKET_NAME || ''
      })
      await s3Client.send(headCommand)
      s3Test = { success: true, error: null }
    } catch (error: any) {
      s3Test = { 
        success: false, 
        error: {
          message: error.message || 'Unknown error',
          code: error.Code || error.code || error.name || 'Unknown',
          statusCode: error.$metadata?.httpStatusCode
        }
      }
    }

    return NextResponse.json({
      status: 'ok',
      config,
      allSet: config.hasS3Endpoint && config.hasRegion && config.hasAccessKey && config.hasSecretKey && config.hasBucket,
      s3Connection: s3Test
    })
  } catch (error) {
    console.error('Test error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
