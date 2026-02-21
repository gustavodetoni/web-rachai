import { FetcherAdapter } from './adapter/fetcher'
import { safeGetErrorMessage } from './adapter/get-error'
import { MessageResponse } from './groups-invite'

const fetcher = new FetcherAdapter()

export async function getInvite(
  groupId: string,
): Promise<MessageResponse> {
  const response = await fetcher.get(`/api/groups/${groupId}/invite`, {})

  if (!response.ok) {
    const message = await safeGetErrorMessage(response)
    throw new Error(message || 'Não foi possível buscar o convite.')
  }

  return response.json() as Promise<MessageResponse>
}
