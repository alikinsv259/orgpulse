import type { ORG_TABLE_COLUMNS } from '@/widgets/orgTable/model/consts'

export type OrgTableColumn = (typeof ORG_TABLE_COLUMNS)[number]

export type OrgTableSortKey = OrgTableColumn['key']

export type OrgTableSortDirection = 'asc' | 'desc'

export type OrgTableSort = {
  key: OrgTableSortKey
  direction: OrgTableSortDirection
}

export type OrgTableRow = {
  id: string
  name: string
  level: number
  totalHeadcount: number
  totalBudget: number
  averagePerformance: number
}
