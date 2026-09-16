import type { ApiErrorResponse } from '@staff-pulse/api-contract'
import type { Middleware } from 'koa'

const ErrorCode = {
  BAD_REQUEST: 'BAD_REQUEST',
  NOT_FOUND: 'NOT_FOUND',
  INTERNAL: 'INTERNAL',
} as const

type AppErrorParams = {
  code?: string
  message?: string
  details?: unknown
}

export class AppError extends Error {
  readonly code: string
  readonly status: number
  readonly details?: unknown

  constructor(code: string, status: number, message: string, details?: unknown) {
    super(message)
    this.name = 'AppError'
    this.code = code
    this.status = status
    this.details = details
  }

  static badRequest(params?: AppErrorParams) {
    const { code = ErrorCode.BAD_REQUEST, message = 'Bad Request', details } = params ?? {}
    return new AppError(code, 400, message, details)
  }

  static notFound(params?: AppErrorParams) {
    const { code = ErrorCode.NOT_FOUND, message = 'Not Found', details } = params ?? {}
    return new AppError(code, 404, message, details)
  }

  static internal(params?: AppErrorParams) {
    const { code = ErrorCode.INTERNAL, message = 'Internal Server Error', details } = params ?? {}
    return new AppError(code, 500, message, details)
  }
}

const toHttpError = (err: unknown): { status: number; body: ApiErrorResponse } => {
  if (err instanceof AppError) {
    return {
      status: err.status,
      body: {
        error: {
          code: err.code,
          message: err.message,
          ...(err.details !== undefined ? { details: err.details } : {}),
        },
      },
    }
  }

  return {
    status: 500,
    body: { error: { code: ErrorCode.INTERNAL, message: 'Internal Server Error' } },
  }
}

export const errorHandler = (): Middleware => async (ctx, next) => {
  try {
    await next()
  } catch (err) {
    const { status, body } = toHttpError(err)
    ctx.status = status
    ctx.body = body

    if (status >= 500) {
      console.error('[server] unhandled error', { method: ctx.method, path: ctx.path, err })
    }
  }
}
