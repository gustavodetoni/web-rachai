import { FetcherAdapter } from './adapter/fetcher';
import { safeGetErrorMessage } from './adapter/get-error';

export type Group = {
  id: string;
  name: string;
  description?: string | null;
  thumbnail?: string | null;
  ownerId: string;
  ownerName: string;
  createdAt: string;
};

const fetcher = new FetcherAdapter();

export async function getGroups(): Promise<Group[]> {
  const response = await fetcher.get('/api/groups');

  if (!response.ok) {
    const message = await safeGetErrorMessage(response);
    throw new Error(message || 'Não foi possível buscar os grupos.');
  }

  return response.json() as Promise<Group[]>;
}
