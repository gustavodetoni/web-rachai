import { FetcherAdapter } from './adapter/fetcher'
import { safeGetErrorMessage } from './adapter/get-error'

const fetcher = new FetcherAdapter()

export async function leaveOrDeleteGroup(
  groupId: string,
): Promise<void> {
  const response = await fetcher.delete(`/api/groups/${groupId}`)

  if (!response.ok) {
    const message = await safeGetErrorMessage(response)
    throw new Error(message || 'Não foi possível sair ou deletar o grupo.')
  }
}
