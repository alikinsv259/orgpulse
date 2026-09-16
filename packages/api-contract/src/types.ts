export type OkResponse = {
  status: 'ok'
}

type RouteOptions = {
  response?: unknown
  query?: unknown
  params?: unknown
  body?: unknown
}

export type RouteDef<T extends RouteOptions = Record<string, never>> = {
  response: 'response' extends keyof T ? T['response'] : OkResponse
  query: 'query' extends keyof T ? T['query'] : undefined
  params: 'params' extends keyof T ? T['params'] : undefined
  body: 'body' extends keyof T ? T['body'] : undefined
}
