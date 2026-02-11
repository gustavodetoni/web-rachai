import { BACKEND_URL } from '@/constants/config';

export type RegisterPayload = {
  name: string;
  email: string;
  password: string;
  pixKey: string;
};

export type AuthResponse = {
  accessToken: string;
};

export async function registerUser(payload: RegisterPayload): Promise<AuthResponse> {
  const response = await fetch(`${BACKEND_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const message = await safeGetErrorMessage(response);
    throw new Error(message || 'Não foi possível criar conta.');
  }

  return response.json() as Promise<AuthResponse>;
}

async function safeGetErrorMessage(response: Response) {
  try {
    const data = (await response.json()) as { message?: string; error?: string };
    return data.message ?? data.error;
  } catch {
    return undefined;
  }
}

