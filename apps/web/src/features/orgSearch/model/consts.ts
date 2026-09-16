export const ORG_SEARCH_DEBOUNCE_MS = 250

export const MIN_LLM_QUERY_LENGTH = 10

export const orgSearchQueryKeys = {
  capabilities: () => ['orgSearch', 'capabilities'] as const,
  interpretation: (query: string) => ['orgSearch', 'interpretation', query] as const,
}
