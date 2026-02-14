import { FetcherAdapter } from './adapter/fetcher'
import { safeGetErrorMessage } from './adapter/get-error'

export type TransactionType =
  | 'EXPENSE'
  | 'PAYMENT'
  | 'RECEIVE'
  | 'TRANSFER'
  | 'MEMBER'

export type TransactionResponse = {
  id: string
  groupId: string
  userId: string
  type: TransactionType
  category: string
  expenseId: string | null
  name: string
  amount: number
  createdAt: string
}

const fetcher = new FetcherAdapter()

export async function getTransactions(
  groupId: string,
): Promise<TransactionResponse[]> {
  const response = await fetcher.get(`/api/transaction/${groupId}`)

  if (!response.ok) {
    const message = await safeGetErrorMessage(response)
    throw new Error(message || 'Não foi possível buscar as transações.')
  }

  return response.json() as Promise<TransactionResponse[]>
}
