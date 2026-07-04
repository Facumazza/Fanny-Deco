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
