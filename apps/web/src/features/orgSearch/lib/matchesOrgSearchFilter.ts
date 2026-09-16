import type { OrgSearchFilter } from '@staff-pulse/api-contract'

import type { OrgSearchCandidate } from '@/features/orgSearch/model/types'

export const matchesOrgSearchFilter = (candidate: OrgSearchCandidate, filter: OrgSearchFilter): boolean => {
  if (filter.text && !candidate.name.toLowerCase().includes(filter.text.toLowerCase())) return false
  if (filter.levels && !filter.levels.includes(candidate.level)) return false

  if (filter.headcountMin !== null && candidate.totalHeadcount < filter.headcountMin) return false
  if (filter.headcountMax !== null && candidate.totalHeadcount > filter.headcountMax) return false

  if (filter.budgetMin !== null && candidate.totalBudget < filter.budgetMin) return false
  if (filter.budgetMax !== null && candidate.totalBudget > filter.budgetMax) return false

  if (filter.performanceMin !== null && candidate.averagePerformance < filter.performanceMin) return false
  if (filter.performanceMax !== null && candidate.averagePerformance > filter.performanceMax) return false

  return true
}
