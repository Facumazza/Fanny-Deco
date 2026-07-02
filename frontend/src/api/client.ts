import { ApiError, ApiRequestError } from '../types/api';

const BASE_URL = '/api';

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      'Accept': 'application/json',
      ...(init?.headers ?? {}),
    },
  });

  if (!res.ok) {
    let body: ApiError | null = null;
    try { body = (await res.json()) as ApiError; } catch { /* not JSON */ }
    throw new ApiRequestError(res.status, body);
  }

  return res.json() as Promise<T>;
}
