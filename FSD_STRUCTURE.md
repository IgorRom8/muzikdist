# FSD (Feature-Sliced Design) Архитектура

## Текущая структура (до рефакторинга)

```
src/
├── app/              # Next.js App Router
├── components/       # Общие компоненты
├── context/          # React Context
├── lib/              # Утилиты и сервисы
└── types/            # TypeScript типы
```

## Целевая FSD структура

```
src/
├── app/                    # Next.js App Router (точка входа)
│   ├── (auth)/
│   │   └── auth/
│   ├── (main)/
│   │   ├── app/
│   │   ├── upload/
│   │   └── favorites/
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
│
├── pages/                  # Страницы (Page layer)
│   ├── home/
│   ├── auth/
│   ├── player/
│   ├── upload/
│   └── favorites/
│
├── widgets/                # Виджеты (Widget layer)
│   ├── header/
│   ├── sidebar/
│   ├── player/
│   └── track-list/
│
├── features/               # Фичи (Feature layer)
│   ├── auth/
│   │   ├── login/
│   │   ├── register/
│   │   └── logout/
│   ├── track/
│   │   ├── play-track/
│   │   ├── upload-track/
│   │   └── favorite-track/
│   └── playlist/
│       ├── create-playlist/
│       └── manage-playlist/
│
├── entities/               # Сущности (Entity layer)
│   ├── user/
│   │   ├── model/
│   │   ├── ui/
│   │   └── api/
│   ├── track/
│   │   ├── model/
│   │   ├── ui/
│   │   └── api/
│   ├── album/
│   └── playlist/
│
├── shared/                 # Общий код (Shared layer)
│   ├── ui/                 # UI компоненты
│   │   ├── button/
│   │   ├── input/
│   │   ├── card/
│   │   └── modal/
│   ├── lib/                # Утилиты
│   │   ├── hooks/
│   │   ├── utils/
│   │   └── constants/
│   ├── api/                # API клиент
│   ├── config/             # Конфигурация
│   └── types/              # Общие типы
│
└── processes/              # Процессы (опционально)
    └── auth-flow/
```

## Слои FSD

### 1. App (app/)
- Точка входа приложения
- Next.js роутинг
- Глобальные провайдеры
- Глобальные стили

### 2. Processes (processes/)
- Сложные сценарии использования
- Многошаговые процессы
- Оркестрация фич

### 3. Pages (pages/)
- Композиция виджетов
- Роутинг логика
- SEO метаданные

### 4. Widgets (widgets/)
- Композитные блоки UI
- Самодостаточные части интерфейса
- Комбинация фич и сущностей

### 5. Features (features/)
- Бизнес-логика
- Пользовательские сценарии
- Взаимодействие с сущностями

### 6. Entities (entities/)
- Бизнес-сущности
- Модели данных
- CRUD операции

### 7. Shared (shared/)
- Переиспользуемый код
- UI-kit
- Утилиты
- Константы

## Правила FSD

1. **Изоляция слоев**: Верхние слои могут использовать нижние, но не наоборот
2. **Публичный API**: Каждый модуль экспортирует через index.ts
3. **Низкая связанность**: Модули одного слоя не зависят друг от друга
4. **Высокая связность**: Код внутри модуля тесно связан

## Пример структуры модуля

```
features/auth/login/
├── ui/
│   ├── LoginForm.tsx
│   ├── LoginForm.module.css
│   └── index.ts
├── model/
│   ├── useLogin.ts
│   ├── loginSchema.ts
│   └── index.ts
├── api/
│   ├── loginApi.ts
│   └── index.ts
└── index.ts              # Публичный API
```

## Миграция

Для полной миграции на FSD нужно:

1. Создать структуру папок
2. Разделить компоненты по слоям
3. Выделить фичи и сущности
4. Создать публичные API для модулей
5. Обновить импорты
6. Настроить алиасы в tsconfig.json

## Преимущества FSD

- ✅ Масштабируемость
- ✅ Предсказуемость
- ✅ Переиспользование кода
- ✅ Легкость тестирования
- ✅ Понятная структура для команды
- ✅ Изоляция изменений