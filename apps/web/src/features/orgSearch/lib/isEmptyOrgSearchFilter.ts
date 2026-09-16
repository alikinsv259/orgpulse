import type { OrgSearchFilter } from '@staff-pulse/api-contract'

export const isEmptyOrgSearchFilter = (filter: OrgSearchFilter): boolean =>
  Object.values(filter).every((value) => value === null)
