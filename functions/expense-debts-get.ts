import { FetcherAdapter } from './adapter/fetcher'
import { safeGetErrorMessage } from './adapter/get-error'

export type Debt = {
  expenseSplitIds: string[]
  userId: string
  userName: string
  userPix: string | null
  userThumbnail: string | null
  totalAmount: number
}

export type ExpenseDebtsResponse = {
  debts: Debt[]
}

const fetcher = new FetcherAdapter()

export async function getExpenseDebts(
  groupId: string,
): Promise<ExpenseDebtsResponse> {
  const response = await fetcher.get(`/api/expense/${groupId}/debts`)

  if (!response.ok) {
    const message = await safeGetErrorMessage(response)
    throw new Error(message || 'Não foi possível buscar as dívidas.')
  }

  return response.json() as Promise<ExpenseDebtsResponse>
}
