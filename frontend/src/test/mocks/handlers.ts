import { http, HttpResponse } from 'msw';
import type { Category, Page, ProductSummary, Review } from '../../types/api';

export const mockCategories: Category[] = [
  { id: 1, slug: 'carteras-cuero', name: 'Carteras de Cuero',
    subtitle: 'Full-grain curtido al vegetal', imageUrl: 'https://x/1.jpg',
    requiresCompanion: false, isCompanion: true },
  { id: 2, slug: 'carteras-otros', name: 'Carteras Otros Materiales',
    subtitle: 'Lona, raffia y tejidos naturales', imageUrl: 'https://x/2.jpg',
    requiresCompanion: false, isCompanion: true },
  { id: 3, slug: 'ceramica-deco', name: 'Cerámica Deco',
    subtitle: 'Jarrones', imageUrl: 'https://x/3.jpg',
    requiresCompanion: false, isCompanion: false },
  { id: 4, slug: 'ceramica-casa', name: 'Cerámica Casa',
    subtitle: 'Tazas', imageUrl: 'https://x/4.jpg',
    requiresCompanion: false, isCompanion: false },
  { id: 5, slug: 'accesorios', name: 'Accesorios',
    subtitle: 'Se venden junto a una cartera', imageUrl: 'https://x/5.jpg',
    requiresCompanion: true, isCompanion: false },
];

export const mockProduct: ProductSummary = {
  id: 10, slug: 'bolso-tote-milano', name: 'Bolso Tote Milano',
  priceArs: 342000, imageUrl: 'https://x/p.jpg',
  ratingAvg: 5.0, ratingCount: 128,
  categorySlug: 'carteras-cuero',
  requiresCompanion: false, isCompanion: true,
};

/** Accesorio: no se puede comprar solo. */
export const mockAccessory: ProductSummary = {
  id: 11, slug: 'llavero-cuero', name: 'Llavero de Cuero',
  priceArs: 25000, imageUrl: 'https://x/a.jpg',
  ratingAvg: 5.0, ratingCount: 4,
  categorySlug: 'accesorios',
  requiresCompanion: true, isCompanion: false,
};

export const mockProductsPage: Page<ProductSummary> = {
  content: [mockProduct],
  page: 0, size: 16, totalElements: 1, totalPages: 1,
};

export const mockReviews: Review[] = [
  { id: 1, authorName: 'Valentina R.', rating: 5,
    body: 'El bolso Tote Milano llegó en una caja preciosa.',
    location: 'Buenos Aires', productName: 'BOLSO TOTE MILANO',
    createdAt: '2026-06-30T14:00:00Z' },
  { id: 2, authorName: 'Camilo S.', rating: 5,
    body: 'Compré el set de cuencos como regalo y fue un éxito total.',
    location: 'Medellín', productName: 'SET CUENCOS TIERRA',
    createdAt: '2026-06-23T14:00:00Z' },
  { id: 3, authorName: 'Lucía F.', rating: 5,
    body: 'La Cartera Minerva es perfecta.',
    location: 'Ciudad de México', productName: 'CARTERA MINERVA',
    createdAt: '2026-06-17T14:00:00Z' },
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
