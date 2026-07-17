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
  priceArs: number;
  imageUrl: string;
  ratingAvg: number;
  ratingCount: number;
  categorySlug: string;
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

export interface ReviewUpsertRequest {
  authorName: string;
  rating: number;
  body: string;
  location: string | null;
  productName: string | null;
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
  priceArs: number;
  imageUrl: string;
  ratingAvg: number;
  ratingCount: number;
  categoryId: number;
  categoryName: string;
  createdAt: string;
}

export interface ProductUpsertRequest {
  name: string;
  slug: string;
  description: string | null;
  priceArs: number;
  imageUrl: string;
  ratingAvg: number;
  ratingCount: number;
  categoryId: number;
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

export type OrderStatus = 'PENDING' | 'PAID' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED';

export interface OrderItem {
  id: number;
  productId: number;
  productSlug: string;
  productName: string;
  productImageUrl: string;
  quantity: number;
  unitPriceArs: number;
  lineTotalArs: number;
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
  subtotalArs: number;
  status: OrderStatus;
  trackingInfo: string | null;
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
  }[];
}

export interface AdminStats {
  today:      { revenueArs: number; orderCount: number };
  last7Days:  { revenueArs: number; orderCount: number };
  thisMonth:  { revenueArs: number; orderCount: number };
  orderCountsByStatus: Record<OrderStatus, number>;
  topProducts: {
    productId: number;
    slug: string;
    name: string;
    unitsSold: number;
    revenueArs: number;
  }[];
}

export interface AdminOrderSummary {
  id: number;
  reference: string;
  customerEmail: string;
  customerName: string;
  subtotalArs: number;
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
