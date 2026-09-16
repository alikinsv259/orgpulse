import type { ApiErrorResponse } from '@staff-pulse/api-contract'
import type { Middleware } from 'koa'

const ErrorCode = {
  BAD_REQUEST: 'BAD_REQUEST',
  NOT_FOUND: 'NOT_FOUND',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  INTERNAL: 'INTERNAL',
} as const

type AppErrorParams = {
  code?: string
  message?: string
  details?: unknown
  cause?: unknown
}

export class AppError extends Error {
  readonly code: string
  readonly status: number
  readonly details?: unknown

  constructor(code: string, status: number, message: string, details?: unknown, cause?: unknown) {
    super(message, cause !== undefined ? { cause } : undefined)
    this.name = 'AppError'
    this.code = code
    this.status = status
    this.details = details
  }

  static badRequest(params?: AppErrorParams) {
    const { code = ErrorCode.BAD_REQUEST, message = 'Bad Request', details, cause } = params ?? {}
    return new AppError(code, 400, message, details, cause)
  }

  static notFound(params?: AppErrorParams) {
    const { code = ErrorCode.NOT_FOUND, message = 'Not Found', details, cause } = params ?? {}
    return new AppError(code, 404, message, details, cause)
  }

  static serviceUnavailable(params?: AppErrorParams) {
    const { code = ErrorCode.SERVICE_UNAVAILABLE, message = 'Service Unavailable', details, cause } = params ?? {}
    return new AppError(code, 503, message, details, cause)
  }

  static internal(params?: AppErrorParams) {
    const { code = ErrorCode.INTERNAL, message = 'Internal Server Error', details, cause } = params ?? {}
    return new AppError(code, 500, message, details, cause)
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
