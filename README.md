# SEO Platform MVP

Генератор технических заданий для SEO-специалистов.
Вводите параметры проекта, выбираете конкурентов из поисковой выдачи, система парсит их страницы и генерирует ТЗ через AI.

**Production URL:** https://seopaltform.dzygman.com
**GitHub:** https://github.com/brand989/seo-platform

---

## Стек

- **Frontend:** React + Vite + MUI (Material UI)
- **Backend/Automation:** n8n (workflows)
- **Database:** NocoDB
- **AI:** OpenRouter (Claude / GPT)
- **Scraping:** Firecrawl
- **Search:** Serper API

---

## Деплой на Coolify

1. **New Resource → Static Site** (или Nixpacks)
2. Подключить репозиторий: `brand989/seo-platform`
3. Настройки:
   - Build Command: `npm run build`
   - Publish Directory: `dist`
   - Domain: `seopaltform.dzygman.com`
4. **Environment Variables:**
   ```
   VITE_N8N_BASE_URL=https://n8n.dzygman.com
   VITE_N8N_WEBHOOK_PATH=/webhook
   ```
5. Деплой

---

## Локальная разработка

```bash
cp .env.example .env
npm install
npm run dev   # http://localhost:3000
```

---

## API эндпоинты (n8n webhooks)

| Метод | Путь | Описание |
|-------|------|----------|
| GET | `/api/projects` | Список проектов |
| POST | `/api/projects` | Создать проект |
| GET | `/api/project?id=X` | Получить проект |
| DELETE | `/api/project?id=X` | Удалить проект |
| GET | `/api/project/status?id=X` | Получить статус |
| POST | `/api/project/search-competitors` | Найти конкурентов |
| POST | `/api/project/generate` | Генерировать ТЗ (async) |

---

## Статусы проекта

`draft` → `searching` → `competitors_found` → `analyzing` → `done`
