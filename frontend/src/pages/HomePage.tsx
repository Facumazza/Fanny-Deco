import { useCallback, useEffect, useState } from 'react';
import type { Category, Page, ProductSummary } from '../types/api';
import { getCategories, getProducts } from '../api/catalog';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { CategoryCard } from '../components/catalog/CategoryCard';
import { ProductCard } from '../components/catalog/ProductCard';
import { Skeleton } from '../components/ui/Skeleton';
import { ErrorState } from '../components/ui/ErrorState';

type Status = 'loading' | 'error' | 'ok';

export default function HomePage() {
  const [status, setStatus] = useState<Status>('loading');
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<ProductSummary[]>([]);

  const load = useCallback(async () => {
    setStatus('loading');
    try {
      const [cats, prods] = await Promise.all([
        getCategories(),
        getProducts({ size: 12 }),
      ]);
      setCategories(cats);
      setProducts((prods as Page<ProductSummary>).content);
      setStatus('ok');
    } catch (e) {
      console.error(e);
      setStatus('error');
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <>
      <Header />
      <main className="max-w-7xl mx-auto px-6 py-10">
        <h1 className="font-display text-2xl mb-6">ARTESA</h1>

        {status === 'error' && <ErrorState onRetry={load} />}

        {status === 'loading' && (
          <>
            <section className="mb-12">
              <h2 className="font-display text-3xl mb-4">Nuestras categorías</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="aspect-[3/4]" />
                ))}
              </div>
            </section>
            <section>
              <h2 className="font-display text-3xl mb-4">Nuestra Colección</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Skeleton key={i} className="aspect-square" />
                ))}
              </div>
            </section>
          </>
        )}

        {status === 'ok' && (
          <>
            <section className="mb-12">
              <h2 className="font-display text-3xl mb-4">Nuestras categorías</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {categories.map(c => <CategoryCard key={c.id} category={c} />)}
              </div>
            </section>
            <section>
              <p className="text-terracotta text-xs tracking-[0.3em] mb-2">TIENDA</p>
              <h2 className="font-display text-4xl mb-6">Nuestra Colección</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {products.map(p => <ProductCard key={p.id} product={p} />)}
              </div>
            </section>
          </>
        )}
      </main>
      <Footer />
    </>
  );
}
