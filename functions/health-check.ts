import { FetcherAdapter } from './adapter/fetcher'
import { safeGetErrorMessage } from './adapter/get-error'

const fetcher = new FetcherAdapter()

export async function check(): Promise<string> {
  const response = await fetcher.get('/check')

  if (!response.ok) {
    const message = await safeGetErrorMessage(response)
    throw new Error(message || 'Falha ao se comunicar com o servidor!')
  }

  return response.text()
}
