import type { OrgNodePatch } from '@staff-pulse/api-contract'

import { flattenOrgTree } from '@/entities/orgNode/lib/flattenOrgTree'
import { getNodePathIds } from '@/entities/orgNode/lib/getNodePathIds'
import type { OrgNodeAggregates, OrgSnapshot, OrgTreeNode } from '@/entities/orgNode/model/types'

type PatchResult = {
  nodes: OrgTreeNode[]
  isPatched: boolean
}

const patchTreeBranch = (nodes: OrgTreeNode[], patch: OrgNodePatch): PatchResult => {
  let isPatched = false

  const nextNodes = nodes.map((node) => {
    if (node.id === patch.id) {
      isPatched = true

      return {
        ...node,
        headcount: patch.headcount,
        budget: patch.budget,
        performance: patch.performance,
        updatedAt: patch.updatedAt,
      }
    }

    const childResult = patchTreeBranch(node.children, patch)

    if (!childResult.isPatched) return node

    isPatched = true

    return { ...node, children: childResult.nodes }
  })

  return { nodes: isPatched ? nextNodes : nodes, isPatched }
}

export const applyOrgNodePatch = (snapshot: OrgSnapshot, patch: OrgNodePatch): OrgSnapshot => {
  const current = snapshot.nodesById.get(patch.id)

  if (!current) return snapshot
  if (Date.parse(patch.updatedAt) <= Date.parse(current.updatedAt)) return snapshot

  const headcountDelta = patch.headcount - current.headcount
  const budgetDelta = patch.budget - current.budget
  const weightedPerformanceDelta = patch.headcount * patch.performance - current.headcount * current.performance

  const aggregates: OrgNodeAggregates = new Map(snapshot.aggregates)

  for (const pathId of getNodePathIds(snapshot.nodesById, patch.id)) {
    const aggregate = aggregates.get(pathId)

    if (!aggregate) continue

    const totalHeadcount = aggregate.totalHeadcount + headcountDelta
    const weightedPerformance = aggregate.weightedPerformance + weightedPerformanceDelta

    aggregates.set(pathId, {
      totalHeadcount,
      totalBudget: aggregate.totalBudget + budgetDelta,
      weightedPerformance,
      averagePerformance: totalHeadcount === 0 ? 0 : weightedPerformance / totalHeadcount,
    })
  }

  const tree = patchTreeBranch(snapshot.tree, patch).nodes
  const flatNodes = flattenOrgTree(tree)

  return {
    tree,
    flatNodes,
    nodesById: new Map(flatNodes.map((node) => [node.id, node])),
    aggregates,
  }
}
