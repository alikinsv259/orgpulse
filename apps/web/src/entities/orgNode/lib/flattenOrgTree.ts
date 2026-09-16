import type { OrgTreeNode } from '@/entities/orgNode/model/types'

export const flattenOrgTree = (tree: OrgTreeNode[]): OrgTreeNode[] => {
  const flat: OrgTreeNode[] = []

  const visit = (nodes: OrgTreeNode[]): void => {
    for (const node of nodes) {
      flat.push(node)
      visit(node.children)
    }
  }

  visit(tree)

  return flat
}
