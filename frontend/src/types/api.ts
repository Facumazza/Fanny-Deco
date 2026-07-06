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

// -------- Admin --------

export interface AdminProduct {
  id: number;
  slug: string;
  name: string;
  description: string | null;
  priceUsd: number;
  imageUrl: string;
  badge: ProductBadge | null;
  ratingAvg: number;
  ratingCount: number;
  categoryId: number;
  categoryName: string;
  colors: string[];
  createdAt: string;
}

export interface ProductUpsertRequest {
  name: string;
  slug: string;
  description: string | null;
  priceUsd: number;
  imageUrl: string;
  badge: ProductBadge | null;
  ratingAvg: number;
  ratingCount: number;
  categoryId: number;
  colors: string[];
}

export interface AdminCategory {
  id: number;
  slug: string;
  name: string;
  subtitle: string | null;
  imageUrl: string;
  displayOrder: number;
  productCount: number;
}

export interface CategoryUpsertRequest {
  name: string;
  slug: string;
  subtitle: string | null;
  imageUrl: string;
  displayOrder: number;
}

// -------- Orders --------

export type OrderStatus = 'PENDING' | 'PAID' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

export interface OrderItem {
  id: number;
  productId: number;
  productSlug: string;
  productName: string;
  productImageUrl: string;
  color: string | null;
  quantity: number;
  unitPriceUsd: number;
  lineTotalUsd: number;
}

export interface Order {
  id: number;
  reference: string;
  customerEmail: string;
  customerName: string;
  shippingAddress: string;
  city: string;
  postalCode: string | null;
  country: string;
  phone: string | null;
  notes: string | null;
  subtotalUsd: number;
  status: OrderStatus;
  createdAt: string;
  items: OrderItem[];
}

export interface CreateOrderRequest {
  customerEmail: string;
  customerName: string;
  shippingAddress: string;
  city: string;
  postalCode?: string;
  country: string;
  phone?: string;
  notes?: string;
  items: {
    productId: number;
    quantity: number;
    color?: string | null;
  }[];
}

export interface AdminOrderSummary {
  id: number;
  reference: string;
  customerEmail: string;
  customerName: string;
  subtotalUsd: number;
  status: OrderStatus;
  itemCount: number;
  createdAt: string;
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
