import type { AiSearchResponse, OrgSearchStats } from '@staff-pulse/api-contract'
import OpenAI from 'openai'

import { env } from '~/config'
import { AppError } from '~/errors'

const MAX_COMPLETION_TOKENS = 2048

// Промпт написан на русском, поскольку ЦА для запросов будет на русском языке.
const SYSTEM_PROMPT = `Ты превращаешь поисковый запрос на естественном языке в структурированный фильтр для таблицы орг-структуры компании.

Уровни: 1 — дивизион, 2 — отдел, 3 — команда.
Метрики агрегированы по узлу и всем его потомкам:
- headcount — суммарная численность сотрудников,
- budget — суммарный бюджет в рублях,
- performance — средняя эффективность, 0..100.

Базовые правила:
- Заполняй только те поля, которые следуют из запроса. Всё остальное — null.
- Слова «дивизион», «отдел», «команда» и их формы — это levels, а НЕ text. В text их писать нельзя.
- levels заполняй ТОЛЬКО если такое слово прямо есть в запросе. Нет его — levels null.
  Никогда не угадывай уровень по названию подразделения и не подставляй [1,2,3] вместо null.
- text — только собственное название подразделения («Ядро», «Первая линия»). Нет названия — null.
- Слово или фраза без метрик и уровней — это название подразделения, даже неполное и незнакомое
  («инже», «перв», «ядр»): text = запрос как есть, confidence "exact". Пользователь просто печатает.
- Бюджет переводи в рубли целиком: «10 млн» → 10000000.
- summary — одно короткое предложение по-русски, не длиннее 120 символов.

Явное важнее выведенного:
- Если для метрики в запросе есть конкретное число — бери именно его, распределение не трогай.
- Распределение применяй только к тем метрикам, для которых числа в запросе нет.

Расплывчатые формулировки не повод отказываться — выводи пороги из распределения:
- «мало», «маленький», «небольшой», «низкий», «слабый» → верхняя граница на уровне p25;
- «много», «большой», «крупный», «высокий», «сильный» → нижняя граница на уровне p75;
- «средний» → диапазон от p25 до p75.
Если распределение не передано, возьми разумные пороги сам.

Поле confidence:
- "exact" — все ограничения заданы явно: числа, уровни или название;
- "guess" — хотя бы один порог пришлось вывести из распределения. В summary укажи подставленные пороги;
- "unclear" — запрос вообще не про поиск подразделений («хочу пиццу», «который час»). Тогда все
  поля фильтра — null, а в summary одним предложением объясни, чего не хватает, и предложи, как
  переформулировать. Неполное название — это НЕ unclear.

Примеры:
- «команды с эффективностью ниже 60» → levels [3], performanceMax 60, остальное null, confidence "exact"
- «отделы больше 30 человек» → levels [2], headcountMin 30, confidence "exact"
- «ядро» → text "ядро", levels null, confidence "exact"
- «инже» → text "инже", levels null, confidence "exact"
- «мало сотрудников» → headcountMax = p25, levels null и text null, confidence "guess"
- «большой бюджет» → budgetMin = p75, levels null и text null, confidence "guess"
- «хочу пиццу» → все поля null, confidence "unclear"`

const FILTER_JSON_SCHEMA = {
  type: 'object',
  properties: {
    filter: {
      type: 'object',
      properties: {
        text: { type: ['string', 'null'] },
        levels: { type: ['array', 'null'], items: { type: 'integer', enum: [1, 2, 3] } },
        headcountMin: { type: ['number', 'null'] },
        headcountMax: { type: ['number', 'null'] },
        budgetMin: { type: ['number', 'null'] },
        budgetMax: { type: ['number', 'null'] },
        performanceMin: { type: ['number', 'null'] },
        performanceMax: { type: ['number', 'null'] },
      },
      required: [
        'text',
        'levels',
        'headcountMin',
        'headcountMax',
        'budgetMin',
        'budgetMax',
        'performanceMin',
        'performanceMax',
      ],
      additionalProperties: false,
    },
    summary: { type: 'string' },
    confidence: { type: 'string', enum: ['exact', 'guess', 'unclear'] },
  },
  required: ['filter', 'summary', 'confidence'],
  additionalProperties: false,
}

export const isLlmSearchAvailable = (): boolean => env.OPENAI_API_KEY.length > 0

let client: OpenAI | null = null

const getClient = (): OpenAI => {
  client ??= new OpenAI({ apiKey: env.OPENAI_API_KEY })
  return client
}

const toAppError = (err: unknown): AppError => {
  if (err instanceof OpenAI.AuthenticationError) {
    return AppError.serviceUnavailable({
      code: 'AI_SEARCH_UNAVAILABLE',
      message: 'LLM rejected the configured API key',
      cause: err,
    })
  }

  if (err instanceof OpenAI.RateLimitError) {
    return AppError.serviceUnavailable({
      code: 'AI_SEARCH_RATE_LIMITED',
      message: 'LLM rate limit reached',
      cause: err,
    })
  }

  if (err instanceof OpenAI.APIError) {
    return AppError.serviceUnavailable({
      code: 'AI_SEARCH_FAILED',
      message: `LLM request failed with status ${err.status}`,
      cause: err,
    })
  }

  return AppError.serviceUnavailable({
    code: 'AI_SEARCH_FAILED',
    message: 'LLM request failed',
    cause: err,
  })
}

const formatStats = (stats: OrgSearchStats): string => {
  const line = (label: string, metric: OrgSearchStats['headcount']) =>
    `- ${label}: min ${metric.min}, p25 ${metric.p25}, медиана ${metric.median}, p75 ${metric.p75}, max ${metric.max}`

  return [
    'Распределение значений в текущей таблице:',
    line('headcount', stats.headcount),
    line('budget', stats.budget),
    line('performance', stats.performance),
  ].join('\n')
}

export const interpretSearchQuery = async (
  query: string,
  stats: OrgSearchStats | null,
): Promise<AiSearchResponse> => {
  if (!isLlmSearchAvailable()) {
    throw AppError.serviceUnavailable({
      code: 'AI_SEARCH_UNAVAILABLE',
      message: 'LLM search is not configured on the server',
    })
  }

  let completion

  try {
    completion = await getClient().chat.completions.create({
      model: env.AI_SEARCH_MODEL,
      max_completion_tokens: MAX_COMPLETION_TOKENS,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...(stats ? [{ role: 'system' as const, content: formatStats(stats) }] : []),
        { role: 'user', content: query },
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'org_search_filter',
          strict: true,
          schema: FILTER_JSON_SCHEMA,
        },
      },
    })
  } catch (err) {
    throw toAppError(err)
  }

  const choice = completion.choices[0]

  if (choice?.message.refusal) {
    throw AppError.serviceUnavailable({
      code: 'AI_SEARCH_FAILED',
      message: 'LLM refused the request',
      details: choice.message.refusal,
    })
  }

  if (choice?.finish_reason === 'length') {
    throw AppError.serviceUnavailable({
      code: 'AI_SEARCH_FAILED',
      message: 'LLM response was cut off before the filter was complete',
    })
  }

  const content = choice?.message.content

  if (!content) {
    throw AppError.serviceUnavailable({
      code: 'AI_SEARCH_FAILED',
      message: 'LLM returned an empty response',
    })
  }

  try {
    return JSON.parse(content) as AiSearchResponse
  } catch (err) {
    throw AppError.serviceUnavailable({
      code: 'AI_SEARCH_FAILED',
      message: 'LLM returned a non-JSON payload',
      cause: err,
    })
  }
}
