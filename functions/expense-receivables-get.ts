import { FetcherAdapter } from './adapter/fetcher'
import { safeGetErrorMessage } from './adapter/get-error'

export type ReceivableResponse = {
  payerId: string
  payerName: string
  payerThumbnailUrl: string | null
  amount: number
}

const fetcher = new FetcherAdapter()

export async function getExpenseReceivables(
  groupId: string,
): Promise<ReceivableResponse[]> {
  const response = await fetcher.get(`/api/expense/${groupId}/receivables`)

  if (!response.ok) {
    const message = await safeGetErrorMessage(response)
    throw new Error(message || 'Não foi possível buscar os valores a receber.')
  }

  return response.json() as Promise<ReceivableResponse[]>
}
