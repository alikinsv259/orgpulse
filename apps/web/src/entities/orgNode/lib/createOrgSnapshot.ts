import type { OrgNode } from '@staff-pulse/api-contract'

import { aggregateOrgTree } from '@/entities/orgNode/lib/aggregateOrgTree'
import { buildOrgTree } from '@/entities/orgNode/lib/buildOrgTree'
import { flattenOrgTree } from '@/entities/orgNode/lib/flattenOrgTree'
import type { OrgSnapshot } from '@/entities/orgNode/model/types'

export const createOrgSnapshot = (nodes: OrgNode[]): OrgSnapshot => {
  const tree = buildOrgTree(nodes)
  const flatNodes = flattenOrgTree(tree)

  return {
    tree,
    flatNodes,
    nodesById: new Map(flatNodes.map((node) => [node.id, node])),
    aggregates: aggregateOrgTree(tree),
  }
}
