import { apiFetch } from './client';
import type { CreateOrderRequest, Order } from '../types/api';

export function createOrder(req: CreateOrderRequest): Promise<Order> {
  return apiFetch<Order>('/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  });
}

export function getOrderByReference(reference: string): Promise<Order> {
  return apiFetch<Order>(`/orders/${encodeURIComponent(reference)}`);
}

export interface PaymentInitiation {
  preferenceId: string;
  initPoint: string;  // MercadoPago redirect URL
}

/**
 * Creates a MercadoPago preference for the order and returns the URL the customer
 * should be redirected to.
 */
export function initiatePayment(reference: string): Promise<PaymentInitiation> {
  return apiFetch<PaymentInitiation>(
    `/orders/${encodeURIComponent(reference)}/payment`,
    { method: 'POST' }
  );
}

/**
 * Uploads a transfer receipt for the given order. Multipart POST — the fetch
 * client below sets the boundary automatically (we don't set Content-Type
 * manually, that would break the multipart form).
 */
export async function uploadReceipt(reference: string, file: File): Promise<Order> {
  const form = new FormData();
  form.append('file', file);
  const res = await fetch(`/api/orders/${encodeURIComponent(reference)}/receipt`, {
    method: 'POST',
    body: form,
  });
  if (!res.ok) {
    // Use the same shape apiFetch uses so callers can inspect ApiRequestError.
    let body = null;
    try { body = await res.json(); } catch { /* not JSON */ }
    const { ApiRequestError } = await import('../types/api');
    throw new ApiRequestError(res.status, body);
  }
  return res.json() as Promise<Order>;
}
