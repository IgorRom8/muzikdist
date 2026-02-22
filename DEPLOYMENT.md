# Инструкция по деплою на Vercel

## 1. Настройка базы данных

Для продакшена нужна внешняя PostgreSQL база данных. Рекомендуемые варианты:

### Вариант A: Vercel Postgres (рекомендуется)
1. Зайдите в проект на Vercel
2. Перейдите в Storage → Create Database → Postgres
3. Создайте базу данных
4. Vercel автоматически добавит переменные окружения

### Вариант B: Supabase (бесплатно)
1. Зайдите на https://supabase.com
2. Создайте новый проект
3. Скопируйте Connection String из Settings → Database
4. Используйте этот URL как DATABASE_URL

### Вариант C: Neon (serverless)
1. Зайдите на https://neon.tech
2. Создайте новый проект
3. Скопируйте Connection String
4. Используйте этот URL как DATABASE_URL

## 2. Настройка переменных окружения в Vercel

Зайдите в Settings → Environment Variables и добавьте:

```
DATABASE_URL=<ваш_connection_string_из_шага_1>
S3_ENDPOINT=s3.ru-7.storage.selcloud.ru
AWS_REGION=ru-7
AWS_ACCESS_KEY_ID=ecd2796237554e8eab8f3672a6a67f32
AWS_SECRET_ACCESS_KEY=d9a0fce02d7741f89642e569597b157d
AWS_S3_BUCKET_NAME=s3-muzik
```

**Важно:** Добавьте переменные для всех окружений (Production, Preview, Development)

## 3. Применение миграций базы данных

После настройки DATABASE_URL выполните миграции:

```bash
# Установите Prisma CLI глобально (если еще не установлен)
npm install -g prisma

# Примените миграции к продакшен базе
npx prisma migrate deploy

# Или создайте новую миграцию
npx prisma migrate dev
```

## 4. Проверка деплоя

1. Откройте ваш сайт на Vercel
2. Попробуйте зарегистрироваться
3. Проверьте загрузку треков
4. Проверьте создание плейлистов

## 5. Отладка ошибок

Если возникают ошибки:

1. Проверьте логи в Vercel Dashboard → Deployments → Logs
2. Убедитесь, что все переменные окружения добавлены
3. Проверьте, что DATABASE_URL правильный
4. Убедитесь, что миграции применены

## Текущий статус

- ✅ Проект собирается без ошибок
- ✅ Код загружен на GitHub
- ✅ Деплой на Vercel выполнен
- ❌ Нужно настроить базу данных
- ❌ Нужно добавить переменные окружения

## Следующие шаги

1. Выберите провайдера базы данных (рекомендуется Vercel Postgres)
2. Создайте базу данных
3. Добавьте DATABASE_URL в переменные окружения Vercel
4. Примените миграции Prisma
5. Перезапустите деплой на Vercel
