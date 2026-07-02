import { useCallback, useEffect, useState } from 'react';
import type { Category, Page, ProductSummary } from '../types/api';
import { getCategories, getProducts } from '../api/catalog';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { CategoryCard } from '../components/catalog/CategoryCard';
import { ProductCard } from '../components/catalog/ProductCard';
import { CategoryTabs, type TabValue } from '../components/catalog/CategoryTabs';
import { Skeleton } from '../components/ui/Skeleton';
import { ErrorState } from '../components/ui/ErrorState';
import { Hero } from '../components/sections/Hero';
import { ProcessSection } from '../components/sections/ProcessSection';
import { ReviewsSection } from '../components/sections/ReviewsSection';
import { Newsletter } from '../components/sections/Newsletter';

type Status = 'loading' | 'error' | 'ok';

export default function HomePage() {
  const [status, setStatus] = useState<Status>('loading');
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<ProductSummary[]>([]);
  const [activeTab, setActiveTab] = useState<TabValue>(null);
  const [productsLoading, setProductsLoading] = useState(false);

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

  const changeTab = useCallback(async (next: TabValue) => {
    setActiveTab(next);
    setProductsLoading(true);
    try {
      const prods = await getProducts({
        size: 12,
        category: next ?? undefined,
      });
      setProducts(prods.content);
    } catch (e) {
      console.error(e);
    } finally {
      setProductsLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <>
      <Header />
      {status === 'ok' && <Hero />}
      <main className="max-w-7xl mx-auto px-6 py-16">
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
            <section className="mb-16">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {categories.map(c => <CategoryCard key={c.id} category={c} />)}
              </div>
            </section>
            <section id="coleccion">
              <p className="text-terracotta text-xs tracking-[0.3em] mb-2">TIENDA</p>
              <h2 className="font-display text-4xl mb-6">Nuestra Colección</h2>
              <CategoryTabs
                categories={categories}
                value={activeTab}
                onChange={changeTab}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 min-h-[200px]">
                {productsLoading
                  ? Array.from({ length: 4 }).map((_, i) => (
                      <Skeleton key={i} className="aspect-square" />
                    ))
                  : products.length > 0
                    ? products.map(p => <ProductCard key={p.id} product={p} />)
                    : (
                        <p className="col-span-full text-muted text-center py-12">
                          No hay productos en esta categoría.
                        </p>
                      )}
              </div>
            </section>
          </>
        )}
      </main>

      {status === 'ok' && (
        <>
          <ProcessSection />
          <ReviewsSection />
          <Newsletter />
        </>
      )}

      <Footer />
    </>
  );
}
