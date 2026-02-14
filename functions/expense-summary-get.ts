import { FetcherAdapter } from './adapter/fetcher'
import { safeGetErrorMessage } from './adapter/get-error'

export type ExpenseSummaryResponse = {
  totalSpent: number
  totalToReceive: number
  totalToPay: number
}

const fetcher = new FetcherAdapter()

export async function getExpenseSummary(
  groupId: string,
): Promise<ExpenseSummaryResponse> {
  const response = await fetcher.get(`/api/expense/${groupId}/summary`)

  if (!response.ok) {
    const message = await safeGetErrorMessage(response)
    throw new Error(message || 'Não foi possível buscar o resumo das despesas.')
  }

  return response.json() as Promise<ExpenseSummaryResponse>
}
