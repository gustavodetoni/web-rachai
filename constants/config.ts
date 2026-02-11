const DEFAULT_BACKEND_URL = 'http://10.0.0.111:8080';
const DEFAULT_JWT_NAME = 'racha_access_token';

export const BACKEND_URL =
  process.env.EXPO_PUBLIC_BACKEND_URL ?? DEFAULT_BACKEND_URL;

export const JWT_NAME =
  process.env.EXPO_PUBLIC_JWT_NAME ?? DEFAULT_JWT_NAME;