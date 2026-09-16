import { useCallback, useMemo, useState } from 'react'

import { DEFAULT_EXPANDED_DEPTH, type OrgTreeNode } from '@/entities/orgNode'

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

  const toggleNode = useCallback((id: string) => {
    setOverrides((prev) => ({ ...prev, [id]: !(prev[id] ?? defaultExpandedIds.has(id)) }))
  }, [defaultExpandedIds])

  return { expandedIds, toggleNode }
}
