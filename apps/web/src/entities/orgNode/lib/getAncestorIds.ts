import type { OrgTreeNode } from '@/entities/orgNode/model/types'

export const getAncestorIds = (tree: OrgTreeNode[], nodeId: string): string[] => {
  const ancestors: string[] = []

  const visit = (nodes: OrgTreeNode[], trail: string[]): boolean => {
    for (const node of nodes) {
      if (node.id === nodeId) {
        ancestors.push(...trail)
        return true
      }

      if (visit(node.children, [...trail, node.id])) return true
    }

    return false
  }

  visit(tree, [])

  return ancestors
}
