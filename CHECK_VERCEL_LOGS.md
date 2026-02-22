# Как проверить логи на Vercel

## Шаг 1: Откройте Vercel Dashboard
https://vercel.com/dashboard

## Шаг 2: Выберите проект
Найдите проект `muzikdist` или `music-distribution`

## Шаг 3: Откройте последний деплой
1. Перейдите в раздел **Deployments**
2. Кликните на самый последний деплой (верхний в списке)

## Шаг 4: Проверьте логи функции
1. Найдите вкладку **Functions** или **Runtime Logs**
2. Найдите функцию `api/upload`
3. Кликните на нее

## Шаг 5: Смотрите детальные логи
Вы должны увидеть:
- `Upload API called` - API вызван
- `Processing file: [имя файла]` - файл обрабатывается
- `Buffer size: [размер]` - размер буфера
- `Content type: [тип]` - MIME тип
- `S3 Config: {...}` - конфигурация S3
- `Uploading to S3...` - начало загрузки
- Либо `Upload successful` либо ошибку

## Что искать в логах:

### Если видите "Error saving file locally"
❌ Старая версия кода, нужен Redeploy с очисткой кеша

### Если видите ошибку S3
Проверьте:
- ✓ Все переменные окружения добавлены в Vercel
- ✓ Значения переменных правильные (без лишних пробелов)
- ✓ Bucket существует в Selectel
- ✓ Access Key и Secret Key правильные

### Если видите "Missing credentials"
❌ Переменные окружения не добавлены или неправильные имена

### Если видите "Access Denied"
❌ Неправильные credentials или bucket не существует

## Переменные окружения (должны быть в Vercel):

```
DATABASE_URL=postgresql://...
S3_ENDPOINT=s3.ru-7.storage.selcloud.ru
AWS_REGION=ru-7
AWS_ACCESS_KEY_ID=ecd2796237554e8eab8f3672a6a67f32
AWS_SECRET_ACCESS_KEY=d9a0fce02d7741f89642e569597b157d
AWS_S3_BUCKET_NAME=s3-muzik
```

**ВАЖНО:** Добавьте для всех окружений (Production, Preview, Development)
