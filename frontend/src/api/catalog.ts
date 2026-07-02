import { apiFetch } from './client';
import type { Category, Page, ProductBadge, ProductDetail, ProductSummary, Review } from '../types/api';

export interface ProductFilters {
  category?: string;
  badge?: ProductBadge;
  q?: string;
  page?: number;
  size?: number;
  sort?: 'created_at,desc' | 'price,asc' | 'price,desc';
}

export function getCategories(): Promise<Category[]> {
  return apiFetch<Category[]>('/categories');
}

export function getProducts(filters: ProductFilters = {}): Promise<Page<ProductSummary>> {
  const qs = new URLSearchParams();
  if (filters.category) qs.set('category', filters.category);
  if (filters.badge)    qs.set('badge', filters.badge);
  if (filters.q)        qs.set('q', filters.q);
  if (filters.page !== undefined) qs.set('page', String(filters.page));
  if (filters.size !== undefined) qs.set('size', String(filters.size));
  if (filters.sort)     qs.set('sort', filters.sort);
  const suffix = qs.toString() ? `?${qs}` : '';
  return apiFetch<Page<ProductSummary>>(`/products${suffix}`);
}

export function getProduct(slug: string): Promise<ProductDetail> {
  return apiFetch<ProductDetail>(`/products/${encodeURIComponent(slug)}`);
}

export function getReviews(limit = 6): Promise<Review[]> {
  return apiFetch<Review[]>(`/reviews?limit=${limit}`);
}
