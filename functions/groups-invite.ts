import { FetcherAdapter } from './adapter/fetcher'
import { safeGetErrorMessage } from './adapter/get-error'

export type MessageResponse = {
  message: string
}

const fetcher = new FetcherAdapter()

export async function generateInvite(
  groupId: string,
): Promise<MessageResponse> {
  const response = await fetcher.post(`/api/groups/${groupId}/invite`, {})

  if (!response.ok) {
    const message = await safeGetErrorMessage(response)
    throw new Error(message || 'Não foi possível gerar o convite.')
  }

  return response.json() as Promise<MessageResponse>
}
