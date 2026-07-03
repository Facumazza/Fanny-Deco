import { ApiError, ApiRequestError } from '../types/api';

// Admin client uses cookies for session auth. Every fetch needs `credentials: 'include'`
// so the browser attaches the session cookie set by the login endpoint.
const BASE = '/api/admin';

async function adminFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    credentials: 'include',
    headers: {
      'Accept': 'application/json',
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
      ...(init.headers ?? {}),
    },
  });

  if (!res.ok) {
    let body: ApiError | null = null;
    try { body = (await res.json()) as ApiError; } catch { /* not JSON */ }
    throw new ApiRequestError(res.status, body);
  }

  // Some endpoints return 204 No Content.
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export interface CurrentUser {
  email: string;
}

export function login(email: string, password: string): Promise<CurrentUser> {
  return adminFetch<CurrentUser>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export function logout(): Promise<void> {
  return adminFetch<void>('/auth/logout', { method: 'POST' });
}

export function getCurrentUser(): Promise<CurrentUser> {
  return adminFetch<CurrentUser>('/auth/me');
}
