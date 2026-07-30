import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import type { ProductDetail } from '../types/api';
import { ApiRequestError } from '../types/api';
import { getProduct } from '../api/catalog';
import { useCart } from '../hooks/useCart';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { Skeleton } from '../components/ui/Skeleton';
import { formatArs } from '../lib/price';

type Status = 'loading' | 'ok' | 'not-found' | 'error';

export default function ProductPage() {
  const { slug = '' } = useParams<{ slug: string }>();
  const { items, addItem } = useCart();
  const [status, setStatus] = useState<Status>('loading');
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [addedFeedback, setAddedFeedback] = useState(false);

  // Every piece is one-of-a-kind, so a product is either "add" or "already
  // in cart" — no quantity picker needed.
  const alreadyInCart = product ? items.some(i => i.productId === product.id) : false;

  function handleAddToCart() {
    if (!product) return;
    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      imageUrl: product.imageUrl,
      priceArs: product.priceArs,
    });
    setAddedFeedback(true);
    setTimeout(() => setAddedFeedback(false), 2500);
  }

  useEffect(() => {
    setStatus('loading');
    setActiveImage(null);
    getProduct(slug)
      .then(p => {
        setProduct(p);
        setActiveImage(p.imageUrl);
        setStatus('ok');
      })
      .catch(err => {
        if (err instanceof ApiRequestError && err.status === 404) {
          setStatus('not-found');
        } else {
          console.error(err);
          setStatus('error');
        }
      });
  }, [slug]);

  return (
    <>
      <Header />
      <main className="max-w-7xl mx-auto px-6 py-10">
        {status === 'loading' && <LoadingSkeleton />}

        {status === 'not-found' && (
          <div className="text-center py-24 max-w-md mx-auto">
            <p className="text-terracotta text-xs tracking-[0.3em] mb-4">404</p>
            <h1 className="font-display text-3xl mb-4">Producto no encontrado</h1>
            <p className="text-muted mb-6">El producto que buscás no existe o fue removido.</p>
            <Link to="/" className="text-terracotta hover:underline">
              Volver a la tienda
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div className="text-center py-16">
            <p className="text-ink">Algo salió mal cargando el producto.</p>
          </div>
        )}

        {status === 'ok' && product && (
          <>
            {/* Breadcrumbs */}
            <nav aria-label="Breadcrumb" className="text-sm text-muted mb-8">
              <ol className="flex items-center gap-2">
                <li><Link to="/" className="hover:text-terracotta">Inicio</Link></li>
                <li aria-hidden>›</li>
                <li className="uppercase tracking-wider text-xs">{product.categoryName}</li>
                <li aria-hidden>›</li>
                <li className="text-ink">{product.name}</li>
              </ol>
            </nav>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Image gallery — primary is imageUrl, extras come from additionalImages */}
              <div className="relative">
                <div className="aspect-square bg-cream-card overflow-hidden rounded-sm">
                  <img
                    src={activeImage ?? product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                {(product.additionalImages?.length ?? 0) > 0 && (
                  <ul className="mt-4 grid grid-cols-5 gap-2">
                    {[product.imageUrl, ...(product.additionalImages ?? [])].map((url, i) => {
                      const isActive = (activeImage ?? product.imageUrl) === url;
                      return (
                        <li key={`${url}-${i}`}>
                          <button
                            type="button"
                            onClick={() => setActiveImage(url)}
                            aria-label={`Ver imagen ${i + 1}`}
                            aria-pressed={isActive}
                            className={
                              'aspect-square block w-full overflow-hidden rounded-sm bg-cream-card border-2 transition-colors ' +
                              (isActive ? 'border-brown-dark' : 'border-transparent hover:border-cream-card')
                            }
                          >
                            <img
                              src={url}
                              alt=""
                              loading="lazy"
                              className="w-full h-full object-cover"
                            />
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>

              {/* Info */}
              <div className="flex flex-col">
                <p className="text-terracotta text-xs tracking-[0.3em] mb-3">
                  {product.categoryName.toUpperCase()}
                </p>
                <h1 className="font-display text-5xl leading-tight text-ink mb-4">
                  {product.name}
                </h1>

                <p className="text-3xl font-semibold text-terracotta mb-8">
                  {formatArs(product.priceArs)}
                </p>

                {product.description && (
                  <div className="mb-8">
                    <p className="text-xs tracking-wider text-muted mb-3">DESCRIPCIÓN</p>
                    <p className="text-ink leading-relaxed">{product.description}</p>
                  </div>
                )}

                <p className="text-xs text-muted mb-4 italic">
                  Pieza única, hecha a mano. Stock: 1.
                </p>

                <div className="mt-auto">
                  {alreadyInCart ? (
                    <Link
                      to="/carrito"
                      className="block w-full bg-cream-card text-ink border border-brown-dark py-4 text-sm tracking-wider font-semibold text-center hover:bg-brown-dark hover:text-white transition-colors"
                    >
                      YA ESTÁ EN TU CARRITO — VER CARRITO →
                    </Link>
                  ) : (
                    <button
                      type="button"
                      onClick={handleAddToCart}
                      className="w-full bg-brown-dark hover:bg-brown text-white py-4 text-sm tracking-wider font-semibold transition-colors"
                    >
                      AGREGAR AL CARRITO
                    </button>
                  )}
                </div>

                {addedFeedback && (
                  <div
                    role="status"
                    className="mt-4 bg-cream-card text-ink px-4 py-3 rounded-card text-sm flex items-center justify-between"
                  >
                    <span>Agregado al carrito.</span>
                    <Link to="/carrito" className="text-terracotta hover:underline">
                      Ver carrito →
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </main>
      <Footer />
    </>
  );
}

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
      <Skeleton className="aspect-square" />
      <div className="space-y-4">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-12 w-3/4" />
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-14 w-full" />
      </div>
    </div>
  );
}
