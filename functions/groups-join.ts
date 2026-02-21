import { FetcherAdapter } from './adapter/fetcher'
import { safeGetErrorMessage } from './adapter/get-error'

export type MessageResponse = {
  message: string
}

const fetcher = new FetcherAdapter()

export async function joinGroup(
  token: string,
): Promise<MessageResponse> {
  const response = await fetcher.post(`/api/groups/join/${token}`, {})

  if (!response.ok) {
    const message = await safeGetErrorMessage(response)
    throw new Error(message || 'Não foi possível entrar no grupo.')
  }

  return response.json() as Promise<MessageResponse>
}
