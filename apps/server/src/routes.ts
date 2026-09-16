import Router from '@koa/router'

import { env } from '~/config'
import { getOrgNodes } from '~/orgData'

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export const router = new Router()

router.get('/api/org-tree', async (ctx) => {
  if (env.LATENCY_MS > 0) await delay(env.LATENCY_MS)

  ctx.body = getOrgNodes()
})
