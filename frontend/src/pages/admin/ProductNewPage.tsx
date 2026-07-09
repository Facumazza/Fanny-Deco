import { Link, useNavigate } from 'react-router-dom';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { ProductForm } from '../../components/admin/ProductForm';
import { createAdminProduct } from '../../api/admin';
import type { ProductUpsertRequest } from '../../types/api';

const EMPTY: ProductUpsertRequest = {
  name: '',
  slug: '',
  description: '',
  priceArs: 0,
  imageUrl: '',
  badge: null,
  ratingAvg: 5,
  ratingCount: 0,
  categoryId: 0,
  colors: [],
};

export default function ProductNewPage() {
  const navigate = useNavigate();

  async function handleSubmit(req: ProductUpsertRequest) {
    await createAdminProduct(req);
    navigate('/admin/products', { replace: true });
  }

  return (
    <AdminLayout>
      <nav aria-label="Breadcrumb" className="text-sm text-muted mb-4">
        <Link to="/admin/products" className="hover:text-terracotta">← Productos</Link>
      </nav>
      <h1 className="font-display text-4xl text-ink mb-8">Nuevo producto</h1>
      <ProductForm
        initial={EMPTY}
        submitLabel="Crear producto"
        onSubmit={handleSubmit}
      />
    </AdminLayout>
  );
}
