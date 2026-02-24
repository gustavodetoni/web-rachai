import { FetcherAdapter } from './adapter/fetcher'
import { safeGetErrorMessage } from './adapter/get-error'
import type { User } from './user-get'

export type EditUserRequest = {
  name?: string
  email?: string
  thumbnail?: string
  pixKey?: string
}

const fetcher = new FetcherAdapter()

export async function updateUser(payload: FormData): Promise<User> {
  const response = await fetcher.put('/api/user', payload)

  if (!response.ok) {
    const message = await safeGetErrorMessage(response)
    throw new Error(message || 'Não foi possível atualizar o usuário.')
  }

  return response.json() as Promise<User>
}
