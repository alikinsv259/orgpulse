import { z } from 'zod'

import { OrgNodeSchema } from '@contract/domain/orgNode'

export const LIVE_WS_PATH = '/api/live'

export const OrgNodePatchSchema = OrgNodeSchema.pick({
  id: true,
  headcount: true,
  budget: true,
  performance: true,
  updatedAt: true,
})

export type OrgNodePatch = z.infer<typeof OrgNodePatchSchema>

export const LiveEventSchema = z.object({
  type: z.literal('orgNode.updated'),
  patch: OrgNodePatchSchema,
})

export type LiveEvent = z.infer<typeof LiveEventSchema>
