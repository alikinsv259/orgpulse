import { useMemo } from 'react'

import type { OrgNodeAggregates, OrgTreeNode } from '@/entities/orgNode'
import type { OrgTableRow, OrgTableSort, OrgTableSortKey } from '@/widgets/orgTable/model'

type Params = {
  nodes: OrgTreeNode[]
  aggregates: OrgNodeAggregates
  search: string
  sort: OrgTableSort | null
}

const compareRows = (a: OrgTableRow, b: OrgTableRow, key: OrgTableSortKey): number => {
  if (key === 'name') return a.name.localeCompare(b.name, 'ru')

  return a[key] - b[key]
}

export const useOrgTableRows = ({ nodes, aggregates, search, sort }: Params): OrgTableRow[] => {
  const rows = useMemo<OrgTableRow[]>(
    () =>
      nodes.map((node) => {
        const aggregate = aggregates.get(node.id)

        return {
          id: node.id,
          name: node.name,
          level: node.level,
          totalHeadcount: aggregate?.totalHeadcount ?? node.headcount,
          totalBudget: aggregate?.totalBudget ?? node.budget,
          averagePerformance: aggregate?.averagePerformance ?? node.performance,
        }
      }),
    [nodes, aggregates],
  )

  const filteredRows = useMemo(() => {
    const query = search.trim().toLowerCase()

    if (query.length === 0) return rows

    return rows.filter((row) => row.name.toLowerCase().includes(query))
  }, [rows, search])

  return useMemo(() => {
    if (!sort) return filteredRows

    const direction = sort.direction === 'asc' ? 1 : -1

    return [...filteredRows].sort((a, b) => direction * compareRows(a, b, sort.key))
  }, [filteredRows, sort])
}
