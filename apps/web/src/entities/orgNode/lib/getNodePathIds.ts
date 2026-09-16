import type { OrgTreeNode } from '@/entities/orgNode/model/types'

export const getNodePathIds = (nodesById: Map<string, OrgTreeNode>, nodeId: string): string[] => {
  const pathIds: string[] = []
  const visited = new Set<string>()

  let currentId: string | null = nodeId

  while (currentId && !visited.has(currentId)) {
    const node: OrgTreeNode | undefined = nodesById.get(currentId)

    if (!node) break

    visited.add(currentId)
    pathIds.push(currentId)
    currentId = node.parentId
  }

  return pathIds
}
