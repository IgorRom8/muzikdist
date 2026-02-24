# Настройка Selectel S3 для публичного доступа

## Проблема
Файлы загружаются в S3, но не отображаются/не воспроизводятся.
Ошибка: "Failed to load because no supported source was found"

## Причины
1. Bucket не настроен для публичного доступа
2. CORS не настроен
3. Неправильный URL

## Решение

### 1. Настройка публичного доступа к bucket

Зайдите в панель Selectel:
1. Откройте раздел **Облачное хранилище (S3)**
2. Выберите bucket `s3-muzik`
3. Перейдите в **Настройки** → **Политика доступа**
4. Включите **Публичный доступ** или добавьте политику:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::s3-muzik/*"
    }
  ]
}
```

### 2. Настройка CORS

В настройках bucket добавьте CORS правила:

```json
[
  {
    "AllowedOrigins": ["*"],
    "AllowedMethods": ["GET", "HEAD"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }
]
```

### 3. Проверка URL

После загрузки файла проверьте URL в логах Vercel.
Должен быть один из форматов:

**Path-style (используется сейчас):**
```
https://s3.ru-7.storage.selcloud.ru/s3-muzik/1234567890-file.mp3
```

**Virtual-hosted style:**
```
https://s3-muzik.s3.ru-7.storage.selcloud.ru/1234567890-file.mp3
```

Попробуйте открыть URL напрямую в браузере - файл должен скачаться/открыться.

### 4. Альтернатива: CDN Selectel

Если публичный доступ не работает, используйте CDN:
1. Создайте CDN в Selectel
2. Привяжите к bucket `s3-muzik`
3. Получите CDN URL (например: `https://12345.selcdn.ru`)
4. Измените формирование URL в коде:
   ```typescript
   const url = `https://12345.selcdn.ru/${key}`
   ```

### 5. Проверка

После настройки:
1. Загрузите тестовый файл через приложение
2. Скопируйте URL из логов Vercel
3. Откройте URL в браузере
4. Файл должен открыться/скачаться

Если не работает - проверьте права доступа к bucket в Selectel.
