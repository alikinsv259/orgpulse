import { GetCapabilitiesResponseSchema } from '@staff-pulse/api-contract'
import { useQuery } from '@tanstack/react-query'

import { orgSearchQueryKeys } from '@/features/orgSearch/model'
import { ApiError, ClientErrorCode, apiClient } from '@/shared/api'

export const useAiSearchCapabilitiesQuery = () =>
  useQuery({
    queryKey: orgSearchQueryKeys.capabilities(),
    staleTime: Infinity,
    retry: false,
    queryFn: async ({ signal }) => {
      const response = await apiClient.get('/api/capabilities', undefined, { signal })
      const parsed = GetCapabilitiesResponseSchema.safeParse(response)

      if (!parsed.success) {
        throw new ApiError({
          code: ClientErrorCode.INVALID_RESPONSE,
          message: 'GET /api/capabilities response does not match the contract schema',
        })
      }

      return parsed.data
    },
  })
