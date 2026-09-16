import { z } from 'zod'

import type { RouteDef } from '@contract/types'

export const AI_SEARCH_ENV_VAR = 'OPENAI_API_KEY'

export const MAX_AI_SEARCH_QUERY_LENGTH = 200

export const OrgSearchFilterSchema = z.object({
  text: z.string().max(MAX_AI_SEARCH_QUERY_LENGTH).nullable(),
  levels: z.array(z.number().int().min(1).max(3)).nullable(),
  headcountMin: z.number().min(0).nullable(),
  headcountMax: z.number().min(0).nullable(),
  budgetMin: z.number().min(0).nullable(),
  budgetMax: z.number().min(0).nullable(),
  performanceMin: z.number().min(0).max(100).nullable(),
  performanceMax: z.number().min(0).max(100).nullable(),
})

export type OrgSearchFilter = z.infer<typeof OrgSearchFilterSchema>

export const EMPTY_ORG_SEARCH_FILTER: OrgSearchFilter = {
  text: null,
  levels: null,
  headcountMin: null,
  headcountMax: null,
  budgetMin: null,
  budgetMax: null,
  performanceMin: null,
  performanceMax: null,
}

export const OrgSearchMetricStatsSchema = z.object({
  min: z.number(),
  p25: z.number(),
  median: z.number(),
  p75: z.number(),
  max: z.number(),
})

export type OrgSearchMetricStats = z.infer<typeof OrgSearchMetricStatsSchema>

export const OrgSearchStatsSchema = z.object({
  headcount: OrgSearchMetricStatsSchema,
  budget: OrgSearchMetricStatsSchema,
  performance: OrgSearchMetricStatsSchema,
})

export type OrgSearchStats = z.infer<typeof OrgSearchStatsSchema>

export const AiSearchBodySchema = z.object({
  query: z.string().min(1).max(MAX_AI_SEARCH_QUERY_LENGTH),
  stats: OrgSearchStatsSchema.nullable(),
})

export type AiSearchBody = z.infer<typeof AiSearchBodySchema>

/**
 * exact   — в запросе есть явные числа, уровни или название.
 * guess   — формулировка расплывчатая, пороги выведены из распределения данных.
 * unclear — понять запрос невозможно; клиент показывает предупреждение и ищет по тексту.
 */
export const ORG_SEARCH_CONFIDENCE = ['exact', 'guess', 'unclear'] as const

export const OrgSearchConfidenceSchema = z.enum(ORG_SEARCH_CONFIDENCE)

export type OrgSearchConfidence = z.infer<typeof OrgSearchConfidenceSchema>

export const AiSearchResponseSchema = z.object({
  filter: OrgSearchFilterSchema,
  summary: z.string().max(MAX_AI_SEARCH_QUERY_LENGTH),
  confidence: OrgSearchConfidenceSchema,
})

export type AiSearchResponse = z.infer<typeof AiSearchResponseSchema>

export type AiSearchPostRoutes = {
  '/api/ai-search': RouteDef<{ body: AiSearchBody; response: AiSearchResponse }>
}
