# Настройка проекта на Vercel

## 1. Добавьте переменные окружения в Vercel

Зайдите в **Settings → Environment Variables** и добавьте:

```env
DATABASE_URL=postgresql://neondb_owner:npg_Amuwi2HT1Eda@ep-purple-cloud-aif1qgeb-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require

S3_ENDPOINT=s3.ru-7.storage.selcloud.ru
AWS_REGION=ru-7
AWS_ACCESS_KEY_ID=ecd2796237554e8eab8f3672a6a67f32
AWS_SECRET_ACCESS_KEY=d9a0fce02d7741f89642e569597b157d
AWS_S3_BUCKET_NAME=s3-muzik
```

**Важно:** Добавьте для всех окружений (Production, Preview, Development)

## 2. Настройте Build Command

В **Settings → General → Build & Development Settings**:

**Build Command:**
```
npm run vercel-build
```

## 3. Проверьте настройки S3

Убедитесь, что в вашем S3-совместимом хранилище (Selectel):
- Bucket `s3-muzik` существует
- Включен публичный доступ к файлам (ACL: public-read)
- CORS настроен правильно

## 4. Запустите миграции базы данных

Локально выполните:
```bash
cd music-distribution
npm run db:migrate
```

Это создаст все таблицы в продакшн базе Neon.

## 5. Redeploy проекта

После добавления переменных окружения:
- Зайдите в **Deployments**
- Нажмите на последний деплой
- Нажмите **Redeploy**

## Проверка

После деплоя проверьте:
1. Главная страница загружается
2. Регистрация работает
3. Загрузка треков работает
4. Воспроизведение аудио работает

## Логи

Если ошибки остаются, проверьте логи:
**Deployments → Functions → выберите функцию с ошибкой**
