# Настройка базы данных Neon

## Шаг 1: Применить миграции к базе данных

Откройте **новый терминал** (не тот, где запущен vercel link) и выполните:

```bash
cd music-distribution
npx prisma db push
```

Это создаст все таблицы в вашей базе данных Neon.

## Шаг 2: Проверить переменные окружения в Vercel

Зайдите на https://vercel.com/igorrom8/muzikdist/settings/environment-variables

Убедитесь, что добавлены все переменные:

```
DATABASE_URL=postgresql://neondb_owner:npg_Amuwi2HT1Eda@ep-purple-cloud-aif1qgeb-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require

S3_ENDPOINT=s3.ru-7.storage.selcloud.ru
AWS_REGION=ru-7
AWS_ACCESS_KEY_ID=ecd2796237554e8eab8f3672a6a67f32
AWS_SECRET_ACCESS_KEY=d9a0fce02d7741f89642e569597b157d
AWS_S3_BUCKET_NAME=s3-muzik
```

## Шаг 3: Перезапустить деплой

1. Зайдите на https://vercel.com/igorrom8/muzikdist
2. Перейдите в Deployments
3. Нажмите на последний деплой
4. Нажмите кнопку "Redeploy"

## Шаг 4: Проверить работу сайта

Откройте ваш сайт и попробуйте:
- Зарегистрироваться
- Загрузить трек
- Создать плейлист

Все должно работать!

## Если возникли ошибки

Проверьте логи в Vercel:
1. Deployments → последний деплой → Logs
2. Найдите ошибки и сообщите о них

## Текущий статус

✅ База данных Neon подключена
✅ DATABASE_URL обновлен в .env
✅ Prisma schema обновлен
⏳ Нужно применить миграции (npx prisma db push)
⏳ Нужно перезапустить деплой на Vercel
