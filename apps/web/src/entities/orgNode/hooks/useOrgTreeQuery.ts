import { GetOrgTreeResponseSchema } from '@staff-pulse/api-contract'
import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'

import { aggregateOrgTree } from '@/entities/orgNode/lib/aggregateOrgTree'
import { buildOrgTree } from '@/entities/orgNode/lib/buildOrgTree'
import { flattenOrgTree } from '@/entities/orgNode/lib/flattenOrgTree'
import { ORG_TREE_STALE_TIME_MS } from '@/entities/orgNode/model/consts'
import { orgNodeQueryKeys } from '@/entities/orgNode/model/queryKeys'
import { ApiError, ClientErrorCode, apiClient } from '@/shared/api'

export const useOrgTreeQuery = () => {
  const query = useQuery({
    queryKey: orgNodeQueryKeys.tree(),
    staleTime: ORG_TREE_STALE_TIME_MS,
    queryFn: async ({ signal }) => {
      const response = await apiClient.get('/api/org-tree', undefined, { signal })
      const parsed = GetOrgTreeResponseSchema.safeParse(response)

      if (!parsed.success) {
        throw new ApiError({
          code: ClientErrorCode.INVALID_RESPONSE,
          message: 'GET /api/org-tree response does not match the contract schema',
        })
      }

      return parsed.data
    },
  })

  const { data } = query

  const tree = useMemo(() => buildOrgTree(data ?? []), [data])

  const flatNodes = useMemo(() => flattenOrgTree(tree), [tree])

  const aggregates = useMemo(() => aggregateOrgTree(tree), [tree])

  return { ...query, tree, flatNodes, aggregates }
}
