# Архитектура

## Общая схема

```
┌─────────────────────────────────────────────────────────────────┐
│ packages/api-contract                                           │
│ RouteDef-карта маршрутов, Zod-схемы, доменные типы              │
└───────────────┬─────────────────────────────┬───────────────────┘
                │ только типы                 │ типы + схемы
                ▼                             ▼
┌───────────────────────────┐   ┌─────────────────────────────────┐
│ apps/server (Koa)         │   │ apps/web (React + Vite)         │
│                           │   │                                 │
│ GET  /api/org-tree        │◄──┤ shared/api/apiClient (axios)    │
│ GET  /api/capabilities    │◄──┤                                 │
│ POST /api/ai-search       │◄──┤                                 │
│ WS   /api/live            ├──►│ shared/api/liveClient           │
└───────────────────────────┘   └─────────────────────────────────┘
```

Контракт — единственная точка, где описан формат обмена. Сервер берёт из него **только типы**
(`import type`), поэтому Zod в рантайме бэкенда отсутствует. Клиент берёт и типы, и схемы:
вся валидация живёт на нём.

## Слои клиента

Feature-Sliced Design, импорты разрешены только «вниз»:

```
app       провайдеры: QueryClientProvider, ThemeProvider, GlobalStyle
  ▲
views     dashboard — композиция страницы, split-view, состояние выделения
  ▲
widgets   orgTree, orgTable — крупные блоки, полностью на пропсах
  ▲
features  orgSearch — пользовательский сценарий поиска
  ▲
entities  orgNode — доменная модель, data-access хуки, агрегация
  ▲
shared    apiClient, liveClient, ApiError, queryClient, тема, UI-примитивы
```

Обратные импорты запрещены. Кросс-слайсовые идут через алиас `@/…`, относительных импортов
в проекте нет вообще.

Ключевое следствие для виджетов: `OrgTree` и `OrgTable` не ходят за данными сами. Они получают
дерево, агрегаты, выделение и раскрытие пропсами, а владеет этим состоянием `views/dashboard`.
Поэтому клик по строке таблицы умеет подсветить узел в дереве — оба виджета смотрят на одно
состояние во view.

## Поток данных: первая загрузка

```
GET /api/org-tree
   ↓ axios (apiClient), signal из React Query
OrgNode[]  ── GetOrgTreeResponseSchema.safeParse ──┐
   ↓ ok                                    не ok ──┘→ ApiError INVALID_RESPONSE → ErrorState
React Query cache  (staleTime 5 с)
   ↓ useMemo, один раз на изменение данных
createOrgSnapshot
   ├── buildOrgTree     плоский массив → дерево, расстановка level
   ├── flattenOrgTree   обход в глубину → порядок строк таблицы
   ├── nodesById        Map для доступа за O(1)
   └── aggregateOrgTree Map<id, агрегат> — один пост-ордер обход
   ↓
views/dashboard
   ├── OrgTree   ← tree, expandedIds, selectedId, liveUpdatedIds
   └── OrgTable  ← flatNodes, aggregates, selectedId, liveUpdatedIds
```

Агрегация считается один раз на загрузку данных и мемоизируется. Фильтрация и сортировка
таблицы её не пересчитывают — они работают поверх готовых агрегатов.

## Поток данных: live-обновления

```
сервер мутирует случайный узел раз в LIVE_INTERVAL_MS
   ↓ WebSocket /api/live
{ type: "orgNode.updated", patch }
   ↓ LiveEventSchema.safeParse — не прошло, событие молча отбрасывается
useOrgTreeLiveUpdates: Map<id, patch>, схлопывание по id
   ↓ useMemo
базовый снапшот + патчи → applyOrgNodePatch на каждый
   ├── дельты headcount / budget / weightedPerformance
   ├── путь наверх по parentId → пересчёт O(глубины)
   └── клонирование ветки дерева, остальные узлы — по ссылке
   ↓
liveUpdatedIds → HighlightOnChange → подсветка ячеек, fade-out 1.5 с
```

Рефетча нет: React Query остаётся источником базового состояния, патчи живут отдельным слоем
поверх него. Патч с `updatedAt` не новее текущего — no-op, поэтому после фонового рефетча
накопленные патчи безопасно становятся пустышками.

Состояние соединения отдаётся через `useSyncExternalStore` и рисуется индикатором в шапке.
При обрыве — экспоненциальный backoff 1 → 2 → 4 → … → 30 с с джиттером 25 %.

## Поток данных: поиск

```
ввод (мгновенный) → дебаунс 250 мс
   ↓
короче 10 символов или без пробела? ──да──→ локальный парсер
   ↓ нет
ключ OPENAI_API_KEY есть? ──нет──→ локальный парсер
   ↓ да
POST /api/ai-search { query, stats }      stats — min/p25/медиана/p75/max по агрегатам
   ↓ ответ модели, как есть
AiSearchResponseSchema.safeParse ──не ok──→ локальный парсер
   ↓ ok
confidence unclear или пустой фильтр? ──да──→ локальный парсер + предупреждение
   ↓ нет
normalizeOrgSearchFilter → фильтр применяется к строкам таблицы
```

Фильтр — структура из контракта, применяется на клиенте (`matchesOrgSearchFilter`). Агрегаты
при фильтрации не пересчитываются.

## Обработка ошибок

```
сервер:  AppError → errorHandler → { error: { code, message } } + HTTP-статус
клиент:  axios interceptor → ApiError { code, message, status }
UI:      getOrgTreeErrorMessage(code) → текст, определённый на клиенте
```

Сообщения бэкенда в интерфейс не протекают: клиент подбирает формулировку по коду. Коды,
которых он не знает, уходят в общий fallback.

Ретраи React Query выключены для 4xx: клиентская ошибка от повтора не исправится.

## Границы валидации

| Где | Что проверяется |
|---|---|
| Сервер | только форма тела `POST /api/ai-search` вручную, без Zod |
| Клиент, ответ API | `GetOrgTreeResponseSchema`, `GetCapabilitiesResponseSchema`, `AiSearchResponseSchema` |
| Клиент, WebSocket | `LiveEventSchema` на каждое событие |
| Клиент, ответ модели | тот же `AiSearchResponseSchema` — LLM не привилегированный источник |

Ответ языковой модели проходит ровно ту же проверку, что и обычный HTTP-ответ. Сервер его
не разбирает и не чинит — отдаёт как есть, а решает клиент.

## Структура репозитория

```text
apps/
  server/            Koa API — 5 файлов, без модульности
    src/config.ts    ENV
    src/errors.ts    AppError + errorHandler → { error: { code, message } }
    src/live.ts      WebSocket-сервер и рассылка патчей
    src/aiSearch.ts  разбор поискового запроса через OpenAI
    src/orgData.ts   детерминированный сид орг-структуры
    src/routes.ts    GET /api/org-tree
    src/index.ts     бутстрап
  web/               клиент, Feature-Sliced Design
    src/app/         провайдеры (React Query, ThemeProvider, GlobalStyle)
    src/views/       страницы (dashboard)
    src/widgets/     крупные блоки (orgTree, orgTable)
    src/entities/    доменные сущности + data-access хуки (orgNode)
    src/features/    пользовательские сценарии (orgSearch)
    src/shared/      apiClient, ApiError, liveClient, queryClient, тема, UI-примитивы
packages/
  api-contract/      @staff-pulse/api-contract — общий контракт
docs/
  architecture.md    слои приложения, поток данных от API до UI
  data-model.md      дерево, алгоритм агрегации, контракт WebSocket-патча
  adr/               решения, которые дались не сразу
```

## Ключевые решения

- **Контракт в отдельном пакете.** `RouteDef`-мапа маршрутов типизирует `apiClient.get`:
  URL и тип ответа связаны на уровне типов, руками ничего не дублируется.
  Пакет потребляется из исходников (`exports → ./src/index.ts`), без шага сборки.
- **Валидация только на клиенте.** Сервер оперирует типами, клиент прогоняет ответ через
  `GetOrgTreeResponseSchema`; несоответствие превращается в `ApiError` с кодом
  `INVALID_RESPONSE` и рисует состояние ошибки, а не падает на рендере.
- **Кэш — React Query.** `staleTime` 5 с даёт stale-while-revalidate: повторный заход
  берёт данные из кэша и обновляет их в фоне. Ретраи выключены для 4xx.
- **Отмена запросов.** `queryFn` прокидывает `signal` из React Query в axios, поэтому
  размонтирование компонента отменяет HTTP-запрос.
- **Ошибки как в проде.** Сервер отдаёт `{ error: { code, message } }`, интерсептор axios
  превращает это в `ApiError { code, message, status }`, тексты для пользователя
  определяются на клиенте по коду — бэкендовые сообщения в UI не протекают.
- **Никакого inline-CSS.** Вся стилизация — styled-components и одна тема.
- **Агрегация считается один раз.** `aggregateOrgTree` — один пост-ордер обход дерева,
  `Map<id, { totalHeadcount, totalBudget, averagePerformance }>`, мемоизируется в
  `useOrgTreeQuery` рядом с деревом. Фильтр и сортировка таблицы её не пересчитывают.
- **Состояние выделения поднято во view.** Дерево и таблица — контролируемые виджеты
  на пропсах; выбор строки в таблице разворачивает предков узла в дереве и подсвечивает его.
- **Live-патч применяется точечно.** `applyOrgNodePatch` пересчитывает агрегаты только для
  затронутого узла и его предков: путь наверх идёт по `parentId`, то есть O(глубины), а не O(n).
  Полный `aggregateOrgTree` запускается один раз на загрузку данных.

## Команды

```bash
npm install
npm run dev          # клиент :5173, API :4001
npm run type-check   # три workspace: контракт, сервер, клиент
npm run lint
npm run test         # unit-тесты агрегации
npm run build        # сервер через esbuild, клиент через vite
```

Тест агрегации — `apps/web/src/entities/orgNode/lib/__tests__/aggregateOrgTree.test.ts`:
взвешенное среднее против арифметического, суммы по поддереву, нулевая численность,
потерянный родитель, совпадение инкрементального пересчёта с полным, список затронутых
патчем узлов.

