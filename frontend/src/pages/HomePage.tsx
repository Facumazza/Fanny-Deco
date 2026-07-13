import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
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

/**
 * URL is the source of truth for the active category filter (?categoria=slug).
 * That way the header/footer nav links land deep-into a filtered view instead
 * of just visually changing the URL. Empty/absent -> "TODOS".
 */
export default function HomePage() {
  const [status, setStatus] = useState<Status>('loading');
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<ProductSummary[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const collectionRef = useRef<HTMLElement | null>(null);

  const activeTab: TabValue = searchParams.get('categoria') || null;

  // Tab-change fetch: swallows errors so a transient failure doesn't wipe the
  // category grid we already had. Only used AFTER initial load succeeded.
  const refetchProductsForTab = useCallback(async (category: TabValue) => {
    setProductsLoading(true);
    try {
      const prods = await getProducts({
        size: 12,
        category: category ?? undefined,
      });
      setProducts((prods as Page<ProductSummary>).content);
    } catch (e) {
      console.error(e);
    } finally {
      setProductsLoading(false);
    }
  }, []);

  // Initial load: any failure surfaces the ErrorState with a retry button.
  const initialLoad = useCallback(async () => {
    setStatus('loading');
    try {
      const [cats, prods] = await Promise.all([
        getCategories(),
        getProducts({ size: 12, category: activeTab ?? undefined }),
      ]);
      setCategories(cats);
      setProducts((prods as Page<ProductSummary>).content);
      setStatus('ok');
    } catch (e) {
      console.error(e);
      setStatus('error');
    }
  }, [activeTab]);

  // First mount only — hydrates both lists.
  useEffect(() => { void initialLoad(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  // React to URL changes after the first load (e.g. user clicks a category link
  // in the header — only the query param changes, no full navigation).
  useEffect(() => {
    if (status !== 'ok') return;
    void refetchProductsForTab(activeTab);
    // Scroll the collection into view when the user arrived via a category link.
    if (searchParams.get('categoria')) {
      collectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // Also scroll when arriving with #coleccion in the URL (e.g. header "Colecciones").
  useEffect(() => {
    if (status !== 'ok') return;
    if (location.hash === '#coleccion') {
      collectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [location.hash, status]);

  const changeTab = useCallback((next: TabValue) => {
    // Writing to the URL is enough — the effect above listens and refetches.
    const params = new URLSearchParams(searchParams);
    if (next) params.set('categoria', next);
    else      params.delete('categoria');
    setSearchParams(params, { replace: false });
  }, [searchParams, setSearchParams]);

  return (
    <>
      <Header />
      {status === 'ok' && <Hero />}
      <main className="max-w-7xl mx-auto px-6 py-16">
        {status === 'error' && <ErrorState onRetry={() => void initialLoad()} />}

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
            <section id="coleccion" ref={collectionRef} className="scroll-mt-24">
              <p className="text-terracotta text-xs tracking-[0.3em] mb-2">TIENDA</p>
              <h2 className="font-display text-4xl mb-6">
                {activeTab
                  ? categories.find(c => c.slug === activeTab)?.name ?? 'Nuestra Colección'
                  : 'Nuestra Colección'}
              </h2>
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
