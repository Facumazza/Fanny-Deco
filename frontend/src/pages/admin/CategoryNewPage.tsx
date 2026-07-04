import { Link, useNavigate } from 'react-router-dom';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { CategoryForm } from '../../components/admin/CategoryForm';
import { createAdminCategory } from '../../api/admin';
import type { CategoryUpsertRequest } from '../../types/api';

const EMPTY: CategoryUpsertRequest = {
  name: '',
  slug: '',
  subtitle: '',
  imageUrl: '',
  displayOrder: 10,
};

export default function CategoryNewPage() {
  const navigate = useNavigate();

  async function handleSubmit(req: CategoryUpsertRequest) {
    await createAdminCategory(req);
    navigate('/admin/categories', { replace: true });
  }

  return (
    <AdminLayout>
      <nav aria-label="Breadcrumb" className="text-sm text-muted mb-4">
        <Link to="/admin/categories" className="hover:text-terracotta">← Categorías</Link>
      </nav>
      <h1 className="font-display text-4xl text-ink mb-8">Nueva categoría</h1>
      <CategoryForm initial={EMPTY} submitLabel="Crear categoría" onSubmit={handleSubmit} />
    </AdminLayout>
  );
}
