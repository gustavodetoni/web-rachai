const DEFAULT_BACKEND_URL = 'http://10.0.0.111:8080';
const DEFAULT_JWT_NAME = 'racha_access_token';
const DEFAULT_JWT_EXPIRES_AT_NAME = 'racha_access_token_expires_at';

export const BACKEND_URL =
  process.env.EXPO_PUBLIC_BACKEND_URL ?? DEFAULT_BACKEND_URL;

export const JWT_NAME =
  process.env.EXPO_PUBLIC_JWT_NAME ?? DEFAULT_JWT_NAME;

export const JWT_EXPIRES_AT_NAME =
  process.env.EXPO_PUBLIC_JWT_EXPIRES_AT_NAME ?? DEFAULT_JWT_EXPIRES_AT_NAME;