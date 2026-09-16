import type { OrgSearchMetricStats, OrgSearchStats } from '@staff-pulse/api-contract'

import type { OrgNodeAggregates } from '@/entities/orgNode'

const percentile = (sortedValues: number[], ratio: number): number => {
  const index = Math.round(ratio * (sortedValues.length - 1))

  return sortedValues[Math.min(Math.max(index, 0), sortedValues.length - 1)]
}

const toMetricStats = (values: number[]): OrgSearchMetricStats => {
  const sorted = [...values].sort((a, b) => a - b)

  return {
    min: Math.round(percentile(sorted, 0)),
    p25: Math.round(percentile(sorted, 0.25)),
    median: Math.round(percentile(sorted, 0.5)),
    p75: Math.round(percentile(sorted, 0.75)),
    max: Math.round(percentile(sorted, 1)),
  }
}

/**
 * Модели нужны пороги для расплывчатых формулировок вроде «мало сотрудников».
 * Считаем их по агрегатам — именно в этих величинах работает фильтр таблицы.
 */
export const getOrgSearchStats = (aggregates: OrgNodeAggregates): OrgSearchStats | null => {
  if (aggregates.size === 0) return null

  const headcount: number[] = []
  const budget: number[] = []
  const performance: number[] = []

  for (const aggregate of aggregates.values()) {
    headcount.push(aggregate.totalHeadcount)
    budget.push(aggregate.totalBudget)
    performance.push(aggregate.averagePerformance)
  }

  return {
    headcount: toMetricStats(headcount),
    budget: toMetricStats(budget),
    performance: toMetricStats(performance),
  }
}
