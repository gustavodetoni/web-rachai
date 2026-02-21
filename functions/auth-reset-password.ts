import { FetcherAdapter } from './adapter/fetcher'
import { safeGetErrorMessage } from './adapter/get-error'

export type ResetPasswordRequest = {
  email: string
}

export type ValidateResetCodeRequest = {
  email: string
  code: string
}

export type ResetPasswordConfirmRequest = {
  email: string
  code: string
  newPassword: string
}

export type ProvisionalResetPasswordRequest = {
  email: string
  newPassword: string
}

export type MessageResponse = {
  message: string
}

const fetcher = new FetcherAdapter()

export async function requestPasswordReset(
  payload: ResetPasswordRequest,
): Promise<MessageResponse> {
  const response = await fetcher.post('/auth/reset-password/request', payload)

  if (!response.ok) {
    const message = await safeGetErrorMessage(response)
    throw new Error(message || 'Não foi possível solicitar o reset de senha.')
  }

  return response.json() as Promise<MessageResponse>
}

export async function validateResetCode(
  payload: ValidateResetCodeRequest,
): Promise<MessageResponse> {
  const response = await fetcher.post('/auth/reset-password/validate', payload)

  if (!response.ok) {
    const message = await safeGetErrorMessage(response)
    throw new Error(message || 'Código de reset inválido.')
  }

  return response.json() as Promise<MessageResponse>
}

export async function confirmPasswordReset(
  payload: ResetPasswordConfirmRequest,
): Promise<MessageResponse> {
  const response = await fetcher.post('/auth/reset-password/confirm', payload)

  if (!response.ok) {
    const message = await safeGetErrorMessage(response)
    throw new Error(message || 'Não foi possível redefinir a senha.')
  }

  return response.json() as Promise<MessageResponse>
}

export async function provisionalResetPassword(
  payload: ProvisionalResetPasswordRequest,
): Promise<MessageResponse> {
  const response = await fetcher.post('/auth/reset-password/provisor', payload)

  if (!response.ok) {
    const message = await safeGetErrorMessage(response)
    throw new Error(message || 'Não foi possível realizar o reset provisório.')
  }

  return response.json() as Promise<MessageResponse>
}
