import { FetcherAdapter } from './adapter/fetcher'
import { safeGetErrorMessage } from './adapter/get-error'

export type ExpenseCategory =
  | 'FOOD'
  | 'FUEL'
  | 'DRINKS'
  | 'RENT'
  | 'ENTERTAINMENT'
  | 'OTHERS'

export type CreateExpenseRequest = {
  title: string
  amount: number
  category: ExpenseCategory
  divideTo: string[]
  invoice?: any
}

export type ExpenseResponse = {
  id: string
  groupId: string
  createdById: string
  title: string
  amount: number
  createdAt: string
}

const fetcher = new FetcherAdapter()

export async function createExpense(
  groupId: string,
  payload: FormData,
): Promise<ExpenseResponse> {
  const response = await fetcher.post(`/api/expense/${groupId}`, payload)

  if (!response.ok) {
    const message = await safeGetErrorMessage(response)
    throw new Error(message || 'Não foi possível criar a despesa.')
  }

  return response.json() as Promise<ExpenseResponse>
}
