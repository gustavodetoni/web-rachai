import { FetcherAdapter } from './adapter/fetcher';
import { safeGetErrorMessage } from './adapter/get-error';

export type ExpenseSplitDetail = {
  userId: string;
  userName: string;
  amount: number;
  paid: boolean;
  paidAt?: string;
  evidence?: string;
};

export type TransactionDetailResponse = {
  id: string;
  groupId: string;
  groupName: string;
  userId: string;
  userName: string;
  type: 'EXPENSE' | 'PAYMENT' | 'RECEIVE' | 'TRANSFER' | 'MEMBER';
  category?: string;
  name: string;
  amount: number;
  createdAt: string;
  expenseId?: string;
  expenseTitle?: string;
  expenseInvoice?: string;
  splits?: ExpenseSplitDetail[];
};

const fetcher = new FetcherAdapter();

export async function getTransactionDetail(
  transactionId: string
): Promise<TransactionDetailResponse> {
  const response = await fetcher.get(`/api/transaction/detail/${transactionId}`);

  if (!response.ok) {
    const message = await safeGetErrorMessage(response);
    throw new Error(message || 'Não foi possível buscar os detalhes da transação.');
  }

  return response.json() as Promise<TransactionDetailResponse>;
}
