// Тест подключения к S3
require('dotenv').config({ path: '.env' })
const { S3Client, ListBucketsCommand, PutObjectCommand } = require('@aws-sdk/client-s3')

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'ru-7',
  endpoint: process.env.S3_ENDPOINT ? `https://${process.env.S3_ENDPOINT}` : undefined,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
  },
  forcePathStyle: true
})

async function testS3() {
  console.log('Testing S3 connection...')
  console.log('Config:', {
    region: process.env.AWS_REGION,
    endpoint: process.env.S3_ENDPOINT,
    bucket: process.env.AWS_S3_BUCKET_NAME,
    hasAccessKey: !!process.env.AWS_ACCESS_KEY_ID,
    hasSecretKey: !!process.env.AWS_SECRET_ACCESS_KEY
  })

  try {
    // Тест 1: Список бакетов
    console.log('\n1. Listing buckets...')
    const listCommand = new ListBucketsCommand({})
    const listResult = await s3Client.send(listCommand)
    console.log('Buckets:', listResult.Buckets?.map(b => b.Name))

    // Тест 2: Загрузка тестового файла
    console.log('\n2. Uploading test file...')
    const testContent = Buffer.from('Test file content')
    const putCommand = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: `test-${Date.now()}.txt`,
      Body: testContent,
      ContentType: 'text/plain'
    })
    
    await s3Client.send(putCommand)
    console.log('✓ Upload successful!')
    
    const url = `https://${process.env.S3_ENDPOINT}/${process.env.AWS_S3_BUCKET_NAME}/test-${Date.now()}.txt`
    console.log('File URL:', url)
    
  } catch (error) {
    console.error('❌ Error:', error.message)
    if (error.$metadata) {
      console.error('Status:', error.$metadata.httpStatusCode)
    }
  }
}

testS3()
