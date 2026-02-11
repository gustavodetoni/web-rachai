import { FetcherAdapter } from './adapter/fetcher'
import { safeGetErrorMessage } from './adapter/get-error'

export type GroupMember = {
  id: string
  name: string
  thumbnail?: string | null
  pixKey?: string | null
}

const fetcher = new FetcherAdapter()

export async function getGroupMembers(groupId: string): Promise<GroupMember[]> {
  const response = await fetcher.get(`/api/groups/${groupId}/members`)

  if (!response.ok) {
    const message = await safeGetErrorMessage(response)
    throw new Error(message || 'Não foi possível buscar os membros do grupo.')
  }

  return response.json() as Promise<GroupMember[]>
}
