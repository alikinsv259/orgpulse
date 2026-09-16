import type { OrgSearchFilter } from '@staff-pulse/api-contract'

export const hasStructuredConstraints = (filter: OrgSearchFilter): boolean =>
  Object.entries(filter).some(([key, value]) => key !== 'text' && value !== null)
