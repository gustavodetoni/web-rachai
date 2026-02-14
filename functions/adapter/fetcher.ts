import { BACKEND_URL, JWT_NAME } from '@/constants/config'
import AsyncStorage from '@react-native-async-storage/async-storage'
import type { HttpAdapter } from './http'

export class FetcherAdapter implements HttpAdapter {
  private host = BACKEND_URL
  private headers = {}

  async get(
    input: string | URL | Request,
    init?: RequestInit | undefined,
  ): Promise<Response> {
    const url = `${this.host}/${input.toString().replace('/', '')}`
    await this.setHeaders()

    return await fetch(url, {
      method: 'GET',
      credentials: 'include',
      headers: this.headers,
      ...init,
    })
  }

  async post(
    input: string | URL | Request,
    body: Record<string, unknown> | FormData,
    init?: RequestInit | undefined,
  ): Promise<Response> {
    const url = `${this.host}/${input.toString().replace('/', '')}`
    await this.setHeaders(body instanceof FormData)

    return await fetch(url, {
      method: 'POST',
      headers: this.headers,
      credentials: 'include',
      ...init,
      body: body instanceof FormData ? body : JSON.stringify(body),
    })
  }

  async put(
    input: string | URL | Request,
    body?: Record<string, unknown> | FormData,
    init?: RequestInit | undefined,
  ): Promise<Response> {
    const url = `${this.host}/${input.toString().replace('/', '')}`
    await this.setHeaders(body instanceof FormData)

    return await fetch(url, {
      method: 'PUT',
      headers: this.headers,
      credentials: 'include',
      ...init,
      body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
    })
  }

  async delete(
    input: string | URL | Request,
    init?: RequestInit | undefined,
  ): Promise<Response> {
    const url = `${this.host}/${input.toString().replace('/', '')}`
    await this.setHeaders()

    return await fetch(url, {
      method: 'DELETE',
      headers: this.headers,
      credentials: 'include',
      ...init,
    })
  }

  async path(
    input: string | URL | Request,
    body: Record<string, unknown> | FormData,
    init?: RequestInit | undefined,
  ): Promise<Response> {
    const url = `${this.host}/${input.toString().replace('/', '')}`
    await this.setHeaders(body instanceof FormData)

    return await fetch(url, {
      method: 'PATCH',
      headers: this.headers,
      credentials: 'include',
      ...init,
      body: body instanceof FormData ? body : JSON.stringify(body),
    })
  }

  async setHeaders(isFormData: boolean = false) {
    const token = await AsyncStorage.getItem(JWT_NAME)
    const headers: Record<string, string> = {
      Accept: 'application/json',
    }

    if (!isFormData) {
      headers['Content-Type'] = 'application/json'
    }

    if (token && token.trim().length > 0) {
      headers.Authorization = `Bearer ${token}`
    }

    this.headers = headers
  }
}
