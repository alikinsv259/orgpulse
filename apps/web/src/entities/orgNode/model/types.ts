import type { OrgNode } from '@staff-pulse/api-contract'

import type { ThemeTone } from '@/shared/styles'

export type OrgTreeNode = OrgNode & {
  level: number
  children: OrgTreeNode[]
}

export type PerformanceTone = ThemeTone

export type OrgNodeAggregate = {
  totalHeadcount: number
  totalBudget: number
  weightedPerformance: number
  averagePerformance: number
}

export type OrgNodeAggregates = Map<string, OrgNodeAggregate>

export type OrgSnapshot = {
  tree: OrgTreeNode[]
  flatNodes: OrgTreeNode[]
  nodesById: Map<string, OrgTreeNode>
  aggregates: OrgNodeAggregates
}
