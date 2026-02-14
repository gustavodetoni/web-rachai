export type HttpAdapter = {
  get: (
    input: string | URL | Request,
    init?: RequestInit | undefined,
  ) => Promise<Response>
  post: (
    input: string | URL | Request,
    body: Record<string, unknown> | FormData,
    init?: RequestInit | undefined,
  ) => Promise<Response>
  put: (
    input: string | URL | Request,
    body?: Record<string, unknown> | FormData,
    init?: RequestInit | undefined,
  ) => Promise<Response>
  delete: (
    input: string | URL | Request,
    init?: RequestInit | undefined,
  ) => Promise<Response>
}
