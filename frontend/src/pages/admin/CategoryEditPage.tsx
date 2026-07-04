import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { CategoryForm } from '../../components/admin/CategoryForm';
import { getAdminCategory, updateAdminCategory } from '../../api/admin';
import { ApiRequestError } from '../../types/api';
import type { AdminCategory, CategoryUpsertRequest } from '../../types/api';

type Status = 'loading' | 'ok' | 'not-found' | 'error';

export default function CategoryEditPage() {
  const { id = '' } = useParams<{ id: string }>();
  const categoryId = Number(id);
  const navigate = useNavigate();

  const [status, setStatus] = useState<Status>('loading');
  const [category, setCategory] = useState<AdminCategory | null>(null);

  useEffect(() => {
    getAdminCategory(categoryId)
      .then(c => { setCategory(c); setStatus('ok'); })
      .catch(err => {
        // CategoryNotFoundException currently returns 400 (see backend note).
        if (err instanceof ApiRequestError && (err.status === 404 || err.status === 400)) {
          setStatus('not-found');
        } else {
          console.error(err);
          setStatus('error');
        }
      });
  }, [categoryId]);

  async function handleSubmit(req: CategoryUpsertRequest) {
    await updateAdminCategory(categoryId, req);
    navigate('/admin/categories', { replace: true });
  }

  const initial: CategoryUpsertRequest | null = category && {
    name: category.name,
    slug: category.slug,
    subtitle: category.subtitle,
    imageUrl: category.imageUrl,
    displayOrder: category.displayOrder,
  };

  return (
    <AdminLayout>
      <nav aria-label="Breadcrumb" className="text-sm text-muted mb-4">
        <Link to="/admin/categories" className="hover:text-terracotta">← Categorías</Link>
      </nav>

      {status === 'loading' && <p className="text-muted py-12 text-center">Cargando…</p>}

      {status === 'not-found' && (
        <div className="py-12 text-center">
          <p className="font-display text-2xl text-ink mb-2">Categoría no encontrada</p>
          <Link to="/admin/categories" className="text-terracotta hover:underline">
            Volver al listado
          </Link>
        </div>
      )}

      {status === 'error' && (
        <p className="text-terracotta py-12 text-center">Error cargando la categoría.</p>
      )}

      {status === 'ok' && initial && category && (
        <>
          <h1 className="font-display text-4xl text-ink mb-2">Editar categoría</h1>
          <p className="text-muted mb-8">{category.name}</p>
          <CategoryForm initial={initial} submitLabel="Guardar cambios" onSubmit={handleSubmit} />
        </>
      )}
    </AdminLayout>
  );
}
