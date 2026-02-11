import { FetcherAdapter } from './adapter/fetcher'
import { safeGetErrorMessage } from './adapter/get-error'

export type User = {
  id: string
  name: string
  email: string
  password?: string
  thumbnail?: string | null
  pixKey?: string | null
  resetCode?: string | null
  resetCodeExpiresAt?: string | null
  createdAt: string
  updatedAt: string
  deletedAt?: string | null
}

const fetcher = new FetcherAdapter()

export async function getUser(): Promise<User> {
  const response = await fetcher.get('/api/user')

  if (!response.ok) {
    const message = await safeGetErrorMessage(response)
    throw new Error(message || 'Não foi possível buscar o usuário.')
  }

  return response.json() as Promise<User>
}
