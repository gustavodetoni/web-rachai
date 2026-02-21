import { FetcherAdapter } from './adapter/fetcher'
import { safeGetErrorMessage } from './adapter/get-error'
import type { Group } from './groups-create'

export type EditGroupPayload = {
  name?: string
  description?: string
  thumbnail?: any
}

const fetcher = new FetcherAdapter()

export async function editGroup(
  groupId: string,
  payload: FormData,
): Promise<Group> {
  const response = await fetcher.put(`/api/groups/${groupId}`, payload)

  if (!response.ok) {
    const message = await safeGetErrorMessage(response)
    throw new Error(message || 'Não foi possível editar o grupo.')
  }

  return response.json() as Promise<Group>
}
