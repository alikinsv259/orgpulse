import { z } from 'zod'

import type { RouteDef } from '@contract/types'

export const GetCapabilitiesResponseSchema = z.object({
  aiSearch: z.object({
    isLlmAvailable: z.boolean(),
    requiredEnvVar: z.string(),
    model: z.string().nullable(),
  }),
})

export type GetCapabilitiesResponse = z.infer<typeof GetCapabilitiesResponseSchema>

export type CapabilitiesGetRoutes = {
  '/api/capabilities': RouteDef<{ response: GetCapabilitiesResponse }>
}
