import { AiSearchResponseSchema, type OrgSearchStats } from '@staff-pulse/api-contract'
import { useQuery } from '@tanstack/react-query'

import { orgSearchQueryKeys } from '@/features/orgSearch/model'
import { ApiError, ClientErrorCode, apiClient } from '@/shared/api'

const INTERPRETATION_STALE_TIME_MS = 5 * 60_000

export const useAiSearchInterpretationQuery = (
  query: string,
  isEnabled: boolean,
  stats: OrgSearchStats | null,
) =>
  useQuery({
    // Статистика намеренно не входит в ключ: она меняется на каждом live-патче,
    // а переспрашивать модель из-за сдвига порогов на пару процентов незачем.
    queryKey: orgSearchQueryKeys.interpretation(query),
    enabled: isEnabled && query.length > 0,
    staleTime: INTERPRETATION_STALE_TIME_MS,
    retry: false,
    queryFn: async ({ signal }) => {
      const response = await apiClient.post('/api/ai-search', { body: { query, stats } }, { signal })
      const parsed = AiSearchResponseSchema.safeParse(response)

      if (!parsed.success) {
        throw new ApiError({
          code: ClientErrorCode.INVALID_RESPONSE,
          message: 'POST /api/ai-search response does not match the contract schema',
        })
      }

      return parsed.data
    },
  })
