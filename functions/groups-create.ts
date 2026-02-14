import { FetcherAdapter } from './adapter/fetcher';
import { safeGetErrorMessage } from './adapter/get-error';

export type CreateGroupPayload = {
  name: string;
  description?: string;
  /**
   * URL ou identificador da thumbnail.
   * Se for necessário enviar arquivo binário (multipart/form-data),
   * será preciso ajustar o adapter para suportar FormData.
   */
  thumbnail?: string;
};

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

export async function createGroup(
  payload: FormData,
): Promise<Group> {
  const response = await fetcher.post('/api/groups', payload);

  if (!response.ok) {
    const message = await safeGetErrorMessage(response);
    throw new Error(message || 'Não foi possível criar o grupo.');
  }

  return response.json() as Promise<Group>;
}
