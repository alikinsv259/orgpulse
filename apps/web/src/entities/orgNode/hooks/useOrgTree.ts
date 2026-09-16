import { useMemo } from 'react'

import { useOrgTreeLiveUpdates } from '@/entities/orgNode/hooks/useOrgTreeLiveUpdates'
import { useOrgTreeQuery } from '@/entities/orgNode/hooks/useOrgTreeQuery'
import { applyOrgNodePatch } from '@/entities/orgNode/lib/applyOrgNodePatch'
import { getNodePathIds } from '@/entities/orgNode/lib/getNodePathIds'

export const useOrgTree = () => {
  const { snapshot: baseSnapshot, ...query } = useOrgTreeQuery()
  const patchesById = useOrgTreeLiveUpdates()

  const snapshot = useMemo(() => {
    let patched = baseSnapshot

    for (const patch of patchesById.values()) {
      patched = applyOrgNodePatch(patched, patch)
    }

    return patched
  }, [baseSnapshot, patchesById])

  const liveUpdatedIds = useMemo(() => {
    const ids = new Set<string>()

    for (const patch of patchesById.values()) {
      for (const pathId of getNodePathIds(snapshot.nodesById, patch.id)) ids.add(pathId)
    }

    return ids
  }, [patchesById, snapshot])

  return { ...query, ...snapshot, liveUpdatedIds }
}
