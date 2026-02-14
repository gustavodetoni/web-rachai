import { FetcherAdapter } from './adapter/fetcher'
import { safeGetErrorMessage } from './adapter/get-error'

export type UpdateExpenseSplitRequest = {
  paid: boolean
}

const fetcher = new FetcherAdapter()

export async function updateExpenseSplit(
  expenseSplitId: string,
  payload: UpdateExpenseSplitRequest,
): Promise<void> {
  const response = await fetcher.put(`/api/expense/split/${expenseSplitId}`, payload)

  if (!response.ok) {
    const message = await safeGetErrorMessage(response)
    throw new Error(message || 'Não foi possível atualizar o status do pagamento.')
  }
}
