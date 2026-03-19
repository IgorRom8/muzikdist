import { S3Client, PutBucketCorsCommand } from '@aws-sdk/client-s3'

const client = new S3Client({
  region: 'ru-7',
  endpoint: 'https://s3.ru-7.storage.selcloud.ru',
  credentials: {
    accessKeyId: 'ecd2796237554e8eab8f3672a6a67f32',
    secretAccessKey: 'd9a0fce02d7741f89642e569597b157d'
  },
  forcePathStyle: true
})

const command = new PutBucketCorsCommand({
  Bucket: 's3-muzik',
  CORSConfiguration: {
    CORSRules: [
      {
        AllowedOrigins: ['*'],
        AllowedMethods: ['PUT', 'GET', 'HEAD', 'POST', 'DELETE'],
        AllowedHeaders: ['*'],
        MaxAgeSeconds: 3000
      }
    ]
  }
})

try {
  await client.send(command)
  console.log('CORS успешно настроен!')
} catch (e) {
  console.error('Ошибка:', e.message)
}
