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

export interface BankTransferInfo {
  bankName: string;
  accountHolder: string;
  cbu: string;
  alias: string;
  cuit: string;
  contactMethod: string;
}

/**
 * Fetches the shop's bank details for customers who choose to transfer
 * instead of paying by card. Returns null when the endpoint 404s — that
 * means the shop hasn't configured a bank account (or disabled the
 * option), so the checkout should hide the transfer radio.
 */
export async function getBankTransferInfo(): Promise<BankTransferInfo | null> {
  try {
    return await apiFetch<BankTransferInfo>('/payment-methods/bank-transfer');
  } catch (e) {
    return null;
  }
}
