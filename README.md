# ГРАНИ СТРАХА — Next.js проект

## Запуск

```bash
npm install
npm run dev
```

Открой: http://localhost:3000

## Структура

```
app/                    # Страницы (Next.js App Router)
  page.tsx              # Главная
  quests/               # Каталог квестов
  booking/              # Бронирование с календарём
  gallery/              # Галерея с lightbox
  reviews/              # Отзывы
  about/                # О компании
  prices/               # Тарифы
  corporate/            # Корпоративы
  certificates/         # Сертификаты
  faq/                  # FAQ
  blog/                 # Блог
  rules/                # Правила
  contacts/             # Контакты
  profile/              # Личный кабинет (user)
  admin/                # Панель администратора
  auth/                 # Авторизация / регистрация
  lore/                 # История мест
  safety/               # Безопасность
  feartest/             # Тест на страх
  simulator/            # Мини-квест
  leaderboard/          # Таблица рекордов
  livemap/              # Live-статус залов

components/
  layout/Header.tsx     # Навигация с dropdown
  layout/Footer.tsx     # Футер
  ui/Cursor.tsx         # Кастомный курсор
  ui/Toast.tsx          # Уведомления
  ui/QuestCard.tsx      # Карточка квеста

lib/
  auth.tsx              # Контекст авторизации (3 роли)
  toast.ts              # Система уведомлений

data/index.ts           # Все данные (квесты, отзывы, галерея…)
styles/globals.css      # Глобальные стили + CSS переменные
```

## Тестовые аккаунты

| Роль       | Email                      | Пароль       |
|------------|----------------------------|--------------|
| User       | user@granistrakha.ru       | user123      |
| Admin      | admin@granistrakha.ru      | admin123     |
| Директор   | boss@granistrakha.ru       | director123  |

Коды для регистрации: Admin = `ADMIN2024`, Директор = `BOSS9999`
