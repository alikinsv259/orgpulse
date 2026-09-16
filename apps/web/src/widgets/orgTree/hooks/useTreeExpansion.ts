import { useCallback, useMemo, useState } from 'react'

import { DEFAULT_EXPANDED_DEPTH, getAncestorIds, type OrgTreeNode } from '@/entities/orgNode'

const collectDefaultExpandedIds = (nodes: OrgTreeNode[], maxLevel: number): Set<string> => {
  const ids = new Set<string>()

  const walk = (items: OrgTreeNode[]): void => {
    for (const item of items) {
      if (item.level <= maxLevel && item.children.length > 0) ids.add(item.id)
      walk(item.children)
    }
  }

  walk(nodes)

  return ids
}

export const useTreeExpansion = (tree: OrgTreeNode[]) => {
  const [overrides, setOverrides] = useState<Record<string, boolean>>({})

  const defaultExpandedIds = useMemo(() => collectDefaultExpandedIds(tree, DEFAULT_EXPANDED_DEPTH), [tree])

  const expandedIds = useMemo(() => {
    const ids = new Set(defaultExpandedIds)

    for (const [id, isExpanded] of Object.entries(overrides)) {
      if (isExpanded) ids.add(id)
      else ids.delete(id)
    }

    return ids
  }, [defaultExpandedIds, overrides])

  const toggleNode = useCallback(
    (id: string) => {
      setOverrides((prev) => ({ ...prev, [id]: !(prev[id] ?? defaultExpandedIds.has(id)) }))
    },
    [defaultExpandedIds],
  )

  const expandAncestors = useCallback(
    (nodeId: string) => {
      const ancestorIds = getAncestorIds(tree, nodeId)

      if (ancestorIds.length === 0) return

      setOverrides((prev) => {
        const collapsedIds = ancestorIds.filter((id) => prev[id] !== true)

        if (collapsedIds.length === 0) return prev

        const next = { ...prev }
        for (const id of collapsedIds) next[id] = true

        return next
      })
    },
    [tree],
  )

  return { expandedIds, toggleNode, expandAncestors }
}
