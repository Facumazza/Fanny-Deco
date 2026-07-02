export type ProductBadge =
  | 'MAS_VENDIDO' | 'NUEVO' | 'ARTESANAL'
  | 'EDICION_LIMITADA' | 'SET_X3' | 'VERANO';

export interface Category {
  id: number;
  slug: string;
  name: string;
  subtitle: string | null;
  imageUrl: string;
}

export interface ProductSummary {
  id: number;
  slug: string;
  name: string;
  priceUsd: number;
  imageUrl: string;
  badge: ProductBadge | null;
  ratingAvg: number;
  ratingCount: number;
  categorySlug: string;
  colors: string[];
}

export interface ProductDetail extends ProductSummary {
  description: string | null;
  categoryName: string;
}

export interface Review {
  id: number;
  authorName: string;
  rating: number;
  body: string;
  location: string | null;
  productName: string | null;
  createdAt: string;
}

export interface Page<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface ApiError {
  code: string;
  message: string;
  timestamp: string;
}

export class ApiRequestError extends Error {
  status: number;
  body: ApiError | null;
  constructor(status: number, body: ApiError | null) {
    super(body?.message ?? `HTTP ${status}`);
    this.status = status;
    this.body = body;
  }
}
