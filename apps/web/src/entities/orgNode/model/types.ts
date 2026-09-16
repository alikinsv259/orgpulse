import type { OrgNode } from '@staff-pulse/api-contract'

export type OrgTreeNode = OrgNode & {
  level: number
  children: OrgTreeNode[]
}

export type PerformanceTone = 'good' | 'warn' | 'bad'

export type OrgNodeAggregate = {
  totalHeadcount: number
  totalBudget: number
  averagePerformance: number
}

export type OrgNodeAggregates = Map<string, OrgNodeAggregate>
