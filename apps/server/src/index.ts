import cors from '@koa/cors'
import Koa from 'koa'

import { env } from '~/config'
import { AppError, errorHandler } from '~/errors'
import { router } from '~/routes'

const app = new Koa()

app.use(errorHandler())
app.use(cors({ origin: env.CORS_ORIGIN }))
app.use(router.routes())
app.use(router.allowedMethods())
app.use(async (ctx) => {
  throw AppError.notFound({ message: `Route ${ctx.method} ${ctx.path} not found` })
})

app.listen(env.PORT, () => {
  console.log(`[server] listening on http://localhost:${env.PORT}`)
})
