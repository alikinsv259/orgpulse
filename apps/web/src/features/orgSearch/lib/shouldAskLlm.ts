import { MIN_LLM_QUERY_LENGTH } from '@/features/orgSearch/model/consts'

/**
 * Короткий или однословный запрос — это почти всегда название подразделения, а не фраза
 * на естественном языке. Локальный поиск справится с ним точнее, мгновенно и бесплатно,
 * поэтому модель в таких случаях не зовём вовсе.
 */
export const shouldAskLlm = (query: string): boolean => {
  const trimmed = query.trim()

  return trimmed.length >= MIN_LLM_QUERY_LENGTH && /\s/.test(trimmed)
}
