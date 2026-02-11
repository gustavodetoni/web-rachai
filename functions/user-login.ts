import { BACKEND_URL } from '@/constants/config';
import { safeGetErrorMessage } from './adapter/get-error';

export type LoginPayload = {
  email: string;
  password: string;
};

export type AuthResponse = {
  accessToken: string;
};

export async function loginUser(payload: LoginPayload): Promise<AuthResponse> {
  const response = await fetch(`${BACKEND_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const message = await safeGetErrorMessage(response);
    throw new Error(message || 'Não foi possível fazer login.');
  }

  return response.json() as Promise<AuthResponse>;
}
