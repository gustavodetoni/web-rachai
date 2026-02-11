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
    body: Record<string, unknown>,
    init?: RequestInit | undefined,
  ): Promise<Response> {
    const url = `${this.host}/${input.toString().replace('/', '')}`
    await this.setHeaders()

    return await fetch(url, {
      method: 'POST',
      headers: body instanceof FormData ? undefined : this.headers,
      credentials: 'include',
      ...init,
      body: JSON.stringify(body),
    })
  }

  async put(
    input: string | URL | Request,
    body?: Record<string, unknown>,
    init?: RequestInit | undefined,
  ): Promise<Response> {
    const url = `${this.host}/${input.toString().replace('/', '')}`
    await this.setHeaders()

    return await fetch(url, {
      method: 'PUT',
      headers: this.headers,
      credentials: 'include',
      ...init,
      body: body ? JSON.stringify(body) : undefined,
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
    body: Record<string, unknown>,
    init?: RequestInit | undefined,
  ): Promise<Response> {
    const url = `${this.host}/${input.toString().replace('/', '')}`
    await this.setHeaders()

    return await fetch(url, {
      method: 'PATCH',
      headers: this.headers,
      credentials: 'include',
      ...init,
      body: JSON.stringify(body),
    })
  }

  async setHeaders() {
    const token = await AsyncStorage.getItem(JWT_NAME)

    if (token && token.trim().length > 0) {
      this.headers = {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      }
    } else {
      this.headers = {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      }
    }
  }
}
