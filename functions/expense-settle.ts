import { FetcherAdapter } from './adapter/fetcher'
import { safeGetErrorMessage } from './adapter/get-error'

export type SettleExpenseSplitsPayload = {
  expenseSplitIds: string[]
  evidence?: any
}

const fetcher = new FetcherAdapter()

export async function settleExpenseSplits(
  payload: FormData,
): Promise<void> {
  const response = await fetcher.post('/api/expense/settle', payload)

  if (!response.ok) {
    const message = await safeGetErrorMessage(response)
    throw new Error(message || 'Não foi possível realizar o pagamento.')
  }
}
