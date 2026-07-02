import { http, HttpResponse } from 'msw';
import type { Category, Page, ProductSummary, Review } from '../../types/api';

export const mockCategories: Category[] = [
  { id: 1, slug: 'carteras-cuero', name: 'Carteras de Cuero',
    subtitle: 'Full-grain curtido al vegetal', imageUrl: 'https://x/1.jpg' },
  { id: 2, slug: 'carteras-otros', name: 'Carteras Otros Materiales',
    subtitle: 'Lona, raffia y tejidos naturales', imageUrl: 'https://x/2.jpg' },
  { id: 3, slug: 'ceramica-deco', name: 'Cerámica Deco',
    subtitle: 'Jarrones', imageUrl: 'https://x/3.jpg' },
  { id: 4, slug: 'ceramica-casa', name: 'Cerámica Casa',
    subtitle: 'Tazas', imageUrl: 'https://x/4.jpg' },
];

export const mockProduct: ProductSummary = {
  id: 10, slug: 'bolso-tote-milano', name: 'Bolso Tote Milano',
  priceUsd: 285, imageUrl: 'https://x/p.jpg',
  badge: 'MAS_VENDIDO', ratingAvg: 5.0, ratingCount: 128,
  categorySlug: 'carteras-cuero',
  colors: ['#6B4029', '#2B2A28', '#C9B79C'],
};

export const mockProductsPage: Page<ProductSummary> = {
  content: [mockProduct],
  page: 0, size: 12, totalElements: 1, totalPages: 1,
};

export const mockReviews: Review[] = [
  { id: 1, authorName: 'María G.', rating: 5,
    body: 'Calidad impecable', createdAt: '2026-06-10T14:00:00Z' },
];

export const handlers = [
  http.get('/api/categories', () => HttpResponse.json(mockCategories)),
  http.get('/api/products',   () => HttpResponse.json(mockProductsPage)),
  http.get('/api/products/:slug', ({ params }) => {
    if (params.slug === 'no-existe') {
      return HttpResponse.json(
        { code: 'PRODUCT_NOT_FOUND', message: 'x', timestamp: 'x' },
        { status: 404 }
      );
    }
    return HttpResponse.json({ ...mockProduct, description: 'desc',
                                categoryName: 'Carteras de Cuero' });
  }),
  http.get('/api/reviews', () => HttpResponse.json(mockReviews)),
];
