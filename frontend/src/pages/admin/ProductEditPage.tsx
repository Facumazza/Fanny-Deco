import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { ProductForm } from '../../components/admin/ProductForm';
import { getAdminProduct, updateAdminProduct } from '../../api/admin';
import { ApiRequestError } from '../../types/api';
import type { AdminProduct, ProductUpsertRequest } from '../../types/api';

type Status = 'loading' | 'ok' | 'not-found' | 'error';

export default function ProductEditPage() {
  const { id = '' } = useParams<{ id: string }>();
  const productId = Number(id);
  const navigate = useNavigate();

  const [status, setStatus] = useState<Status>('loading');
  const [product, setProduct] = useState<AdminProduct | null>(null);

  useEffect(() => {
    getAdminProduct(productId)
      .then(p => { setProduct(p); setStatus('ok'); })
      .catch(err => {
        if (err instanceof ApiRequestError && err.status === 404) setStatus('not-found');
        else { console.error(err); setStatus('error'); }
      });
  }, [productId]);

  async function handleSubmit(req: ProductUpsertRequest) {
    await updateAdminProduct(productId, req);
    navigate('/admin/products', { replace: true });
  }

  const initial: ProductUpsertRequest | null = product && {
    name: product.name,
    slug: product.slug,
    description: product.description,
    priceArs: product.priceArs,
    imageUrl: product.imageUrl,
    ratingAvg: product.ratingAvg,
    ratingCount: product.ratingCount,
    categoryId: product.categoryId,
  };

  return (
    <AdminLayout>
      <nav aria-label="Breadcrumb" className="text-sm text-muted mb-4">
        <Link to="/admin/products" className="hover:text-terracotta">← Productos</Link>
      </nav>

      {status === 'loading' && (
        <p className="text-muted py-12 text-center">Cargando…</p>
      )}

      {status === 'not-found' && (
        <div className="py-12 text-center">
          <p className="font-display text-2xl text-ink mb-2">Producto no encontrado</p>
          <Link to="/admin/products" className="text-terracotta hover:underline">
            Volver al listado
          </Link>
        </div>
      )}

      {status === 'error' && (
        <p className="text-terracotta py-12 text-center">
          Error cargando el producto.
        </p>
      )}

      {status === 'ok' && initial && product && (
        <>
          <h1 className="font-display text-4xl text-ink mb-2">Editar producto</h1>
          <p className="text-muted mb-8">{product.name}</p>
          <ProductForm
            initial={initial}
            submitLabel="Guardar cambios"
            onSubmit={handleSubmit}
          />
        </>
      )}
    </AdminLayout>
  );
}
