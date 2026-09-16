import { bodyParser } from '@koa/bodyparser'
import cors from '@koa/cors'
import Koa from 'koa'

import { env } from '~/config'
import { AppError, errorHandler } from '~/errors'
import { startLiveUpdates } from '~/live'
import { router } from '~/routes'

const app = new Koa()

app.use(errorHandler())
app.use(cors({ origin: env.CORS_ORIGIN }))
app.use(bodyParser())
app.use(router.routes())
app.use(router.allowedMethods())
app.use(async (ctx) => {
  throw AppError.notFound({ message: `Route ${ctx.method} ${ctx.path} not found` })
})

const server = app.listen(env.PORT, () => {
  console.log(`[server] listening on http://localhost:${env.PORT}`)
  console.log(`[server] .env: ${env.ENV_FILES.length > 0 ? env.ENV_FILES.join(', ') : 'not found, using defaults'}`)
  console.log(`[server] ai search: ${env.OPENAI_API_KEY ? `openai (${env.AI_SEARCH_MODEL})` : 'local parser'}`)
})

startLiveUpdates(server)
