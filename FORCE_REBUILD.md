# Принудительная пересборка на Vercel

## Проблема
Vercel использует старую версию кода с localStorage вместо S3.

## Решение

### Вариант 1: Через Vercel Dashboard (РЕКОМЕНДУЕТСЯ)

1. Зайдите на https://vercel.com/dashboard
2. Выберите проект `muzikdist`
3. Перейдите в **Settings → General**
4. Найдите секцию **Build & Development Settings**
5. Измените **Build Command** на:
   ```
   npm run vercel-build
   ```
6. Сохраните изменения
7. Перейдите в **Deployments**
8. Нажмите на последний деплой
9. Нажмите три точки (⋯) → **Redeploy**
10. Выберите **Redeploy with existing Build Cache cleared** ✓

### Вариант 2: Через Git

1. Запушьте изменения:
   ```bash
   git add -A
   git commit -m "Force rebuild: Switch to S3 storage"
   git push
   ```

2. Если не помогло, создайте пустой коммит:
   ```bash
   git commit --allow-empty -m "Force rebuild"
   git push
   ```

### Вариант 3: Через Vercel CLI

```bash
npm i -g vercel
vercel --prod --force
```

## Проверка

После пересборки проверьте логи:
1. Deployments → Functions → api/upload
2. Должны увидеть логи: "Upload API called", "Processing file:", "Uploading to S3..."

Если видите "Error saving file locally" - значит все еще старая версия.
