import type { OrgNode } from '@staff-pulse/api-contract'

import type { OrgTreeNode } from '@/entities/orgNode/model/types'

const ROOT_LEVEL = 1

const assignLevels = (nodes: OrgTreeNode[], level: number): void => {
  for (const node of nodes) {
    node.level = level
    assignLevels(node.children, level + 1)
  }
}

export const buildOrgTree = (nodes: OrgNode[]): OrgTreeNode[] => {
  const nodesById = new Map<string, OrgTreeNode>()

  for (const node of nodes) {
    nodesById.set(node.id, { ...node, level: ROOT_LEVEL, children: [] })
  }

  const roots: OrgTreeNode[] = []

  for (const node of nodesById.values()) {
    const parent = node.parentId === null ? undefined : nodesById.get(node.parentId)

    if (parent && parent.id !== node.id) {
      parent.children.push(node)
    } else {
      roots.push(node)
    }
  }

  assignLevels(roots, ROOT_LEVEL)

  return roots
}
