# Настройка AWS S3 для хранения файлов

## Что было сделано:

1. ✅ Установлены AWS SDK пакеты:
   - @aws-sdk/client-s3
   - @aws-sdk/s3-request-presigner

2. ✅ Создан S3 клиент в `src/lib/s3.ts` с функциями:
   - uploadToS3() - загрузка файлов
   - deleteFromS3() - удаление файлов
   - base64ToBuffer() - конвертация base64 в Buffer
   - getMimeTypeFromBase64() - определение MIME типа

3. ✅ Создан API endpoint `/api/upload` для загрузки файлов в S3

4. ✅ Обновлены компоненты:
   - Страница загрузки треков - загружает аудио и обложки в S3
   - Профиль - загружает аватары в S3

## Настройка AWS S3:

### Шаг 1: Создайте S3 bucket

1. Войдите в AWS Console: https://console.aws.amazon.com/s3/
2. Нажмите "Create bucket"
3. Введите уникальное имя bucket (например: `music-distribution-files`)
4. Выберите регион (например: `us-east-1`)
5. Снимите галочку "Block all public access" (чтобы файлы были доступны публично)
6. Нажмите "Create bucket"

### Шаг 2: Настройте публичный доступ

1. Откройте созданный bucket
2. Перейдите на вкладку "Permissions"
3. В разделе "Bucket policy" добавьте:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::your-bucket-name/*"
    }
  ]
}
```

Замените `your-bucket-name` на имя вашего bucket.

### Шаг 3: Создайте IAM пользователя

1. Перейдите в IAM: https://console.aws.amazon.com/iam/
2. Нажмите "Users" → "Add users"
3. Введите имя (например: `music-distribution-uploader`)
4. Выберите "Access key - Programmatic access"
5. Нажмите "Next: Permissions"
6. Выберите "Attach existing policies directly"
7. Найдите и выберите `AmazonS3FullAccess` (или создайте кастомную политику)
8. Нажмите "Next" → "Create user"
9. **ВАЖНО**: Сохраните Access Key ID и Secret Access Key

### Шаг 4: Настройте .env файл

Откройте файл `.env` и заполните переменные:

```env
DATABASE_URL="postgresql://postgres:123@localhost:5432/postgres?schema=public"

# AWS S3 Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIA...ваш_access_key
AWS_SECRET_ACCESS_KEY=ваш_secret_key
AWS_S3_BUCKET_NAME=music-distribution-files
```

### Шаг 5: Настройте CORS (если нужно)

Если будете загружать файлы напрямую из браузера:

1. В S3 bucket перейдите на вкладку "Permissions"
2. В разделе "Cross-origin resource sharing (CORS)" добавьте:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedOrigins": ["http://localhost:3000", "https://yourdomain.com"],
    "ExposeHeaders": []
  }
]
```

## Как это работает:

1. **Загрузка трека**:
   - Пользователь выбирает аудиофайл и обложку
   - Файлы конвертируются в base64
   - Отправляются на `/api/upload`
   - Сервер загружает их в S3
   - Возвращает публичные URL
   - URL сохраняются в базе данных

2. **Загрузка аватара**:
   - Пользователь выбирает изображение
   - Файл конвертируется в base64
   - Отправляется на `/api/upload`
   - Сервер загружает в S3
   - URL сохраняется в профиле пользователя

## Альтернатива: Локальное хранилище

Если не хотите использовать AWS S3, можете использовать:
- **MinIO** - self-hosted S3-совместимое хранилище
- **Cloudflare R2** - дешевле AWS S3
- **DigitalOcean Spaces** - простая альтернатива
- **Локальная файловая система** - для разработки

## Проверка работы:

1. Запустите сервер: `npm run dev`
2. Зарегистрируйтесь и войдите
3. Загрузите трек с обложкой
4. Проверьте в AWS Console, что файлы появились в bucket
5. Проверьте, что трек воспроизводится

## Безопасность:

⚠️ **ВАЖНО**: Никогда не коммитьте .env файл в git!

Добавьте в `.gitignore`:
```
.env
.env.local
```
