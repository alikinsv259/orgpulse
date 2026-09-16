import type { OrgNode } from '@staff-pulse/api-contract'

export type OrgTreeNode = OrgNode & {
  level: number
  children: OrgTreeNode[]
}

export type PerformanceTone = 'good' | 'warn' | 'bad'
