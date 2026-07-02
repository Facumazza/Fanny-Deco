import { describe, expect, it } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '../test/setup';
import { apiFetch } from './client';
import { ApiRequestError } from '../types/api';

describe('apiFetch', () => {
  it('parses JSON on 2xx', async () => {
    server.use(http.get('/api/x', () => HttpResponse.json({ ok: true })));
    const res = await apiFetch<{ ok: boolean }>('/x');
    expect(res).toEqual({ ok: true });
  });

  it('throws ApiRequestError on non-2xx with ApiError body', async () => {
    server.use(http.get('/api/x', () => HttpResponse.json(
      { code: 'BOOM', message: 'kaboom', timestamp: '2026' },
      { status: 500 }
    )));
    await expect(apiFetch('/x')).rejects.toBeInstanceOf(ApiRequestError);
  });

  it('throws ApiRequestError with null body when response is not JSON', async () => {
    server.use(http.get('/api/x', () => new HttpResponse('nope',
      { status: 500 })));
    await expect(apiFetch('/x')).rejects.toMatchObject({
      status: 500, body: null,
    });
  });
});
