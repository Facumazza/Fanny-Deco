import { ApiError, ApiRequestError } from '../types/api';

export interface UploadResponse {
  filename: string;
  url: string;
}

/**
 * Uploads a single image file via multipart. Uses `credentials: 'include'` so the
 * session cookie is attached — same auth surface as the rest of the admin API.
 */
export async function uploadImage(file: File): Promise<UploadResponse> {
  const form = new FormData();
  form.append('file', file);

  const res = await fetch('/api/admin/uploads', {
    method: 'POST',
    credentials: 'include',
    body: form,  // fetch sets multipart boundary + Content-Type automatically
  });

  if (!res.ok) {
    let body: ApiError | null = null;
    try { body = (await res.json()) as ApiError; } catch { /* not JSON */ }
    throw new ApiRequestError(res.status, body);
  }
  return res.json();
}
