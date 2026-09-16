import {
  AI_SEARCH_ENV_VAR,
  EMPTY_ORG_SEARCH_FILTER,
  type OrgSearchConfidence,
  type OrgSearchFilter,
} from '@staff-pulse/api-contract'
import { useMemo, useState } from 'react'

import type { OrgNodeAggregates } from '@/entities/orgNode'
import { useAiSearchCapabilitiesQuery } from '@/features/orgSearch/hooks/useAiSearchCapabilitiesQuery'
import { useAiSearchInterpretationQuery } from '@/features/orgSearch/hooks/useAiSearchInterpretationQuery'
import { getOrgSearchStats } from '@/features/orgSearch/lib/getOrgSearchStats'
import { hasStructuredConstraints } from '@/features/orgSearch/lib/hasStructuredConstraints'
import { isEmptyOrgSearchFilter } from '@/features/orgSearch/lib/isEmptyOrgSearchFilter'
import { normalizeOrgSearchFilter } from '@/features/orgSearch/lib/normalizeOrgSearchFilter'
import { parseSearchQueryLocally } from '@/features/orgSearch/lib/parseSearchQueryLocally'
import { shouldAskLlm } from '@/features/orgSearch/lib/shouldAskLlm'
import { ORG_SEARCH_DEBOUNCE_MS } from '@/features/orgSearch/model'
import type { OrgSearchResolution } from '@/features/orgSearch/model/types'
import { useDebouncedValue } from '@/shared/lib'

export type OrgSearchState = {
  query: string
  filter: OrgSearchFilter
  resolution: OrgSearchResolution | null
  confidence: OrgSearchConfidence | null
  summary: string | null
  warning: string | null
  isInterpreting: boolean
  isLlmAvailable: boolean
  requiredEnvVar: string
  model: string | null
  setQuery: (query: string) => void
}

export const useOrgSearch = (aggregates: OrgNodeAggregates): OrgSearchState => {
  const [query, setQuery] = useState('')

  const debouncedQuery = useDebouncedValue(query.trim(), ORG_SEARCH_DEBOUNCE_MS)

  const capabilitiesQuery = useAiSearchCapabilitiesQuery()
  const aiSearch = capabilitiesQuery.data?.aiSearch
  const isLlmAvailable = aiSearch?.isLlmAvailable ?? false

  const stats = useMemo(() => getOrgSearchStats(aggregates), [aggregates])

  const isLlmWorthAsking = isLlmAvailable && shouldAskLlm(debouncedQuery)

  const interpretationQuery = useAiSearchInterpretationQuery(debouncedQuery, isLlmWorthAsking, stats)

  const interpretation = interpretationQuery.data ?? null
  const isUnclear = interpretation?.confidence === 'unclear'

  const llmFilter = useMemo(
    () => (interpretation ? normalizeOrgSearchFilter(interpretation.filter) : null),
    [interpretation],
  )

  const isUsable = llmFilter !== null && !isUnclear && !isEmptyOrgSearchFilter(llmFilter)

  const filter = useMemo(() => {
    if (debouncedQuery.length === 0) return EMPTY_ORG_SEARCH_FILTER
    if (isUsable) return llmFilter

    return parseSearchQueryLocally(debouncedQuery)
  }, [debouncedQuery, isUsable, llmFilter])

  const resolution = useMemo<OrgSearchResolution | null>(() => {
    if (debouncedQuery.length === 0) return null
    if (isUsable) return 'llm'

    return hasStructuredConstraints(filter) ? 'local' : 'text'
  }, [debouncedQuery, isUsable, filter])

  return {
    query,
    filter,
    resolution,
    confidence: isLlmAvailable ? (interpretation?.confidence ?? null) : null,
    summary: isLlmAvailable && isUsable ? (interpretation?.summary ?? null) : null,
    warning: isLlmAvailable && isUnclear ? (interpretation?.summary ?? null) : null,
    isInterpreting: interpretationQuery.isFetching,
    isLlmAvailable,
    requiredEnvVar: aiSearch?.requiredEnvVar ?? AI_SEARCH_ENV_VAR,
    model: aiSearch?.model ?? null,
    setQuery,
  }
}
