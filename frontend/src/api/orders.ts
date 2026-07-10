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
