import type { ApiErrorResponse, ApiGetRoutes, ApiPostRoutes } from '@staff-pulse/api-contract'
import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios'

import { ApiError, ClientErrorCode } from '@/shared/api/apiError'
import { env } from '@/shared/config'

type AllArgs<R> = Omit<R, 'response'>

type RequiredKeys<T> = {
  [K in keyof T]: undefined extends T[K] ? never : K
}[keyof T]

type OptionalKeys<T> = Exclude<keyof T, RequiredKeys<T>>

type ArgsFor<R> = Pick<AllArgs<R>, RequiredKeys<AllArgs<R>>> & Partial<Pick<AllArgs<R>, OptionalKeys<AllArgs<R>>>>

type GetArgs<P extends keyof ApiGetRoutes> = ArgsFor<ApiGetRoutes[P]>

type PostArgs<P extends keyof ApiPostRoutes> = ArgsFor<ApiPostRoutes[P]>

type NormalizedArgs = {
  query?: Record<string, unknown>
  params?: Record<string, unknown>
  body?: Record<string, unknown>
}

type RequestOptions = {
  signal?: AbortSignal
}

class ApiClient {
  private readonly instance: AxiosInstance

  constructor(baseURL: string) {
    this.instance = axios.create({
      baseURL,
      headers: { 'Content-Type': 'application/json' },
    })

    this.instance.interceptors.response.use(
      (response) => response,
      (error: unknown) => {
        if (axios.isAxiosError<ApiErrorResponse>(error)) {
          const status = error.response?.status

          return Promise.reject(
            new ApiError({
              code: error.response?.data?.error?.code ?? (status ? ClientErrorCode.UNKNOWN_ERROR : ClientErrorCode.NETWORK_ERROR),
              message: error.response?.data?.error?.message ?? error.message,
              status,
            }),
          )
        }

        return Promise.reject(error)
      },
    )
  }

  private buildUrl(pattern: string, pathParams?: Record<string, unknown>): string {
    if (!pathParams) return pattern

    return Object.entries(pathParams).reduce(
      (url, [key, value]) => url.replace(`:${key}`, encodeURIComponent(String(value))),
      pattern,
    )
  }

  private async request<T>(config: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.request<T>(config)
    return response.data
  }

  public get<P extends keyof ApiGetRoutes & string>(
    urlPattern: P,
    args?: GetArgs<P>,
    opts?: RequestOptions,
  ): Promise<ApiGetRoutes[P]['response']> {
    const { query, params } = (args ?? {}) as NormalizedArgs

    return this.request<ApiGetRoutes[P]['response']>({
      method: 'GET',
      url: this.buildUrl(urlPattern, params),
      params: query,
      signal: opts?.signal,
    })
  }

  public post<P extends keyof ApiPostRoutes & string>(
    urlPattern: P,
    args: PostArgs<P>,
    opts?: RequestOptions,
  ): Promise<ApiPostRoutes[P]['response']> {
    const { query, params, body } = args as NormalizedArgs

    return this.request<ApiPostRoutes[P]['response']>({
      method: 'POST',
      url: this.buildUrl(urlPattern, params),
      params: query,
      data: body,
      signal: opts?.signal,
    })
  }
}

export const apiClient = new ApiClient(env.API_URL)
