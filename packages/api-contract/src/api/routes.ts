import type { AiSearchPostRoutes } from '@contract/api/aiSearch'
import type { CapabilitiesGetRoutes } from '@contract/api/capabilities'
import type { OrgTreeGetRoutes } from '@contract/api/orgTree'

export type ApiGetRoutes = OrgTreeGetRoutes & CapabilitiesGetRoutes

export type ApiPostRoutes = AiSearchPostRoutes
