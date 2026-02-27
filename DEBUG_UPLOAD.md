# Отладка ошибки загрузки

## Ошибка
500 Internal Server Error при загрузке файлов

## Что сделано
1. Добавлено детальное логирование
2. Увеличен лимит размера файлов до 50MB
3. Добавлена проверка S3 конфигурации

## Как проверить

### 1. Запушьте изменения
```bash
git add -A
git commit -m "Add detailed logging and increase file size limit"
git push
```

### 2. Redeploy на Vercel
- Deployments → последний деплой → Redeploy
- ✓ Clear cache

### 3. Проверьте логи
1. Попробуйте загрузить файл
2. Откройте Vercel Dashboard → Deployments → Functions
3. Найдите функцию `api/upload`
4. Посмотрите логи - там будет детальная информация:
   - Размер файла
   - S3 конфигурация
   - Точная ошибка

## Возможные причины

### 1. Файл слишком большой
- Vercel имеет лимит 4.5MB для Hobby плана
- Решение: используйте меньшие файлы или апгрейд план

### 2. Отсутствуют переменные окружения
Проверьте в Vercel Settings → Environment Variables:
- `S3_ENDPOINT`
- `AWS_REGION`
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_S3_BUCKET_NAME`

### 3. Неправильные credentials
- Проверьте Access Key и Secret Key в Selectel
- Убедитесь что они активны

### 4. Bucket не существует
- Проверьте что bucket `s3-muzik` существует в Selectel
- Проверьте регион (должен быть ru-7)

## Временное решение

Если не работает, попробуйте загрузить файл меньшего размера:
- Изображения: сжать до < 1MB
- Аудио: использовать более низкий битрейт

## После исправления

Проверьте что в логах появилось:
```
Upload API called
Processing file: filename.jpg
Buffer size: 123456 bytes
Content type: image/jpeg
S3 Config check: { все true }
Uploading to S3...
Upload successful: https://...
```

Если видите ошибку - скопируйте её полностью для дальнейшей отладки.
