import type { OrgNodeAggregates, OrgTreeNode } from '@/entities/orgNode/model/types'

type Totals = {
  headcount: number
  budget: number
  weightedPerformance: number
}

export const aggregateOrgTree = (tree: OrgTreeNode[]): OrgNodeAggregates => {
  const aggregates: OrgNodeAggregates = new Map()

  const visit = (node: OrgTreeNode): Totals => {
    const totals: Totals = {
      headcount: node.headcount,
      budget: node.budget,
      weightedPerformance: node.headcount * node.performance,
    }

    for (const child of node.children) {
      const childTotals = visit(child)

      totals.headcount += childTotals.headcount
      totals.budget += childTotals.budget
      totals.weightedPerformance += childTotals.weightedPerformance
    }

    aggregates.set(node.id, {
      totalHeadcount: totals.headcount,
      totalBudget: totals.budget,
      weightedPerformance: totals.weightedPerformance,
      averagePerformance: totals.headcount === 0 ? 0 : totals.weightedPerformance / totals.headcount,
    })

    return totals
  }

  for (const root of tree) visit(root)

  return aggregates
}
