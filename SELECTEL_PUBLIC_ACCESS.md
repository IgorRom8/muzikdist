# Настройка публичного доступа к Selectel S3

## КРИТИЧЕСКИ ВАЖНО!

Файлы загружаются в S3, но не доступны публично. Нужно настроить bucket.

## Шаг 1: Откройте панель Selectel

1. Зайдите на https://my.selectel.ru/
2. Перейдите в раздел **Облачная платформа** → **Объектное хранилище (S3)**
3. Найдите bucket `s3-muzik`

## Шаг 2: Включите публичный доступ

### Вариант А: Через интерфейс Selectel
1. Откройте настройки bucket `s3-muzik`
2. Найдите раздел **Публичный доступ** или **ACL**
3. Включите **Публичное чтение** (Public Read)
4. Сохраните изменения

### Вариант Б: Через политику доступа
1. Откройте bucket `s3-muzik`
2. Перейдите в **Политика доступа** (Bucket Policy)
3. Добавьте политику:

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

4. Сохраните

## Шаг 3: Настройте CORS

В настройках bucket добавьте CORS правила:

```json
[
  {
    "AllowedOrigins": ["*"],
    "AllowedMethods": ["GET", "HEAD"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": ["ETag", "Content-Length", "Content-Type"],
    "MaxAgeSeconds": 3600
  }
]
```

## Шаг 4: Проверка

После настройки:

1. Загрузите тестовый файл через приложение
2. Скопируйте URL из логов Vercel (должен быть вида: `https://s3.ru-7.storage.selcloud.ru/s3-muzik/1234567890-file.mp3`)
3. Откройте URL в браузере
4. Файл должен скачаться/открыться

Если получаете 403 Forbidden - публичный доступ не настроен.
Если получаете 404 Not Found - файл не загрузился или неправильный URL.

## Альтернатива: CDN

Если публичный доступ не работает, используйте CDN Selectel:

1. Создайте CDN в Selectel
2. Привяжите к bucket `s3-muzik`
3. Получите CDN URL (например: `https://12345.selcdn.ru`)
4. В коде измените формирование URL:
   ```typescript
   const publicUrl = `https://12345.selcdn.ru/${key}`
   ```

## После настройки

1. Запушьте изменения
2. Redeploy на Vercel
3. Загрузите новый трек
4. Должно работать!
