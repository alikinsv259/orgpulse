export type ApiErrorCode = string

export const ClientErrorCode = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  INVALID_RESPONSE: 'INVALID_RESPONSE',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
} as const

type ApiErrorParams = {
  code: ApiErrorCode
  message: string
  status?: number
}

export class ApiError extends Error {
  readonly code: ApiErrorCode
  readonly status?: number

  constructor({ code, message, status }: ApiErrorParams) {
    super(message)
    this.name = 'ApiError'
    this.code = code
    this.status = status
  }
}

export const isApiError = (error: unknown): error is ApiError => error instanceof ApiError

export const isClientError = (error: unknown): boolean =>
  isApiError(error) && error.status !== undefined && error.status >= 400 && error.status < 500
