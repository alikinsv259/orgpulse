# API и конфигурация

## Эндпоинты

`GET /api/org-tree` — плоский массив узлов (42 узла, 3 уровня вложенности):

```json
{
  "id": "d1-p1-t1",
  "name": "Ядро",
  "parentId": "d1-p1",
  "headcount": 8,
  "budget": 8993000,
  "performance": 83,
  "updatedAt": "2026-09-14T14:00:14.180Z"
}
```

Ошибки отдаются единым конвертом:

```json
{ "error": { "code": "NOT_FOUND", "message": "Route GET /api/nope not found" } }
```

Данные детерминированы: сервер строит их из фиксированного сида, поэтому перезапуск
не меняет ответ — кэш на клиенте инвалидируется только при реальном изменении данных.

### WebSocket `ws://localhost:4001/api/live`

Пока подключён хотя бы один клиент, сервер раз в `LIVE_INTERVAL_MS` мутирует случайный узел
и рассылает патч. Без подключённых клиентов данные не меняются вообще.

```json
{
  "type": "orgNode.updated",
  "patch": { "id": "d1-p1-t1", "headcount": 9, "budget": 10117000, "performance": 79, "updatedAt": "2026-09-16T08:14:02.311Z" }
}
```

Патч — полная замена изменяемых полей узла, поэтому применение идемпотентно. Клиент валидирует
каждое событие через `LiveEventSchema` и молча отбрасывает то, что не прошло контракт.

### `GET /api/capabilities`

```json
{ "aiSearch": { "isLlmAvailable": false, "requiredEnvVar": "OPENAI_API_KEY", "model": null } }
```

### `POST /api/ai-search`

Тело — `{ "query", "stats" }`, ответ — `{ "filter", "summary", "confidence" }`.
Без ключа возвращает `503 AI_SEARCH_UNAVAILABLE`, и клиент переключается на локальный разбор.

## Переменные окружения

| Переменная | Где | По умолчанию | Назначение |
|------------|-----|--------------|------------|
| `PORT` | server | `4001` | Порт API |
| `CORS_ORIGIN` | server | `http://localhost:5173` | Разрешённый origin клиента |
| `LATENCY_MS` | server | `1000` | Искусственная задержка ответа, чтобы были видны состояния загрузки. `LATENCY_MS=0` отключает |
| `LIVE_INTERVAL_MS` | server | `3000` | Период рассылки live-патчей подключённым клиентам |
| `OPENAI_API_KEY` | server | пусто | Ключ OpenAI. Пустой — AI-поиск работает на локальном парсере |
| `AI_SEARCH_MODEL` | server | `gpt-4o-mini` | Модель для разбора поискового запроса |
| `WEB_PORT` | compose | `8080` | Внешний порт nginx |

Сервер читает `.env` через `dotenv` при старте, уже существующие переменные окружения
не перезаписываются. `.env` перечислен и в `.gitignore`, и в `.dockerignore` — в образ он
не попадает: контейнеру значения подкладывает `env_file` из compose.

`WEB_PORT` — исключение: это подстановка `${...}` в самом compose, а она читает только
корневой `.env`. В `apps/server/.env` эта переменная работать не будет.

`LATENCY_MS` по умолчанию равен `1000` в разработке (чтобы были видны состояния загрузки)
и `0` при `NODE_ENV=production`, который выставлен в образе. Отдельно задавать не нужно.

При старте сервер пишет, что именно подхватил:

```
[server] listening on http://localhost:4001
[server] .env: /app/.env
[server] ai search: openai (gpt-4o-mini)
```
| `VITE_API_URL` | web | `http://localhost:4001` | Базовый URL API |
| `VITE_LIVE_ORIGIN` | web | выводится из `VITE_API_URL` | Origin WebSocket-соединения (`http` → `ws`) |
