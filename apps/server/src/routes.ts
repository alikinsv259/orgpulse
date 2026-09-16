import Router from '@koa/router'
import type {
  AiSearchBody,
  GetCapabilitiesResponse,
  OrgSearchMetricStats,
  OrgSearchStats,
} from '@staff-pulse/api-contract'

import { interpretSearchQuery, isLlmSearchAvailable } from '~/aiSearch'
import { env } from '~/config'
import { AppError } from '~/errors'
import { getOrgNodes } from '~/orgData'

const MAX_QUERY_LENGTH = 200

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const readQuery = (body: unknown): string => {
  const query = (body as Partial<AiSearchBody> | undefined)?.query

  if (typeof query !== 'string' || query.trim().length === 0 || query.length > MAX_QUERY_LENGTH) {
    throw AppError.badRequest({ message: `"query" must be a non-empty string up to ${MAX_QUERY_LENGTH} characters` })
  }

  return query.trim()
}

const METRIC_KEYS = ['min', 'p25', 'median', 'p75', 'max'] as const

const isMetricStats = (value: unknown): value is OrgSearchMetricStats =>
  typeof value === 'object' &&
  value !== null &&
  METRIC_KEYS.every((key) => Number.isFinite((value as Record<string, unknown>)[key]))

/**
 * Статистика приходит с клиента и нужна только как подсказка модели для расплывчатых
 * запросов, поэтому невалидную мы не отвергаем — просто не передаём в промпт.
 */
const readStats = (body: unknown): OrgSearchStats | null => {
  const stats = (body as Partial<AiSearchBody> | undefined)?.stats

  if (!stats || typeof stats !== 'object') return null

  return isMetricStats(stats.headcount) && isMetricStats(stats.budget) && isMetricStats(stats.performance)
    ? stats
    : null
}

export const router = new Router()

router.get('/api/org-tree', async (ctx) => {
  if (env.LATENCY_MS > 0) await delay(env.LATENCY_MS)

  ctx.body = getOrgNodes()
})

router.get('/api/capabilities', (ctx) => {
  const isLlmAvailable = isLlmSearchAvailable()

  const body: GetCapabilitiesResponse = {
    aiSearch: {
      isLlmAvailable,
      requiredEnvVar: 'OPENAI_API_KEY',
      model: isLlmAvailable ? env.AI_SEARCH_MODEL : null,
    },
  }

  ctx.body = body
})

router.post('/api/ai-search', async (ctx) => {
  const body = ctx.request.body

  ctx.body = await interpretSearchQuery(readQuery(body), readStats(body))
})
