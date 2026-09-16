import type { OrgNodePatch } from '@staff-pulse/api-contract'
import { useEffect, useState } from 'react'

import { liveClient } from '@/shared/api'

export const useOrgTreeLiveUpdates = (): Map<string, OrgNodePatch> => {
  const [patchesById, setPatchesById] = useState<Map<string, OrgNodePatch>>(() => new Map())

  useEffect(
    () =>
      liveClient.subscribe((event) => {
        if (event.type !== 'orgNode.updated') return

        setPatchesById((prev) => {
          const next = new Map(prev)
          next.set(event.patch.id, event.patch)

          return next
        })
      }),
    [],
  )

  return patchesById
}
