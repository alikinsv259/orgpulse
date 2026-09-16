import { z } from 'zod'

import { OrgNodeSchema } from '@contract/domain/orgNode'
import type { RouteDef } from '@contract/types'

export const GetOrgTreeResponseSchema = z.array(OrgNodeSchema)

export type GetOrgTreeResponse = z.infer<typeof GetOrgTreeResponseSchema>

export type OrgTreeGetRoutes = {
  '/api/org-tree': RouteDef<{ response: GetOrgTreeResponse }>
}
