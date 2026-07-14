import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { ReviewForm } from '../../components/admin/ReviewForm';
import { getAdminReview, updateAdminReview } from '../../api/admin';
import type { ReviewUpsertRequest } from '../../types/api';

type Status = 'loading' | 'ok' | 'error';

export default function ReviewEditPage() {
  const { id } = useParams<{ id: string }>();
  const reviewId = Number(id);
  const navigate = useNavigate();
  const [status, setStatus] = useState<Status>('loading');
  const [initial, setInitial] = useState<ReviewUpsertRequest | null>(null);

  useEffect(() => {
    let cancelled = false;
    setStatus('loading');
    getAdminReview(reviewId)
      .then(r => {
        if (cancelled) return;
        setInitial({
          authorName: r.authorName,
          rating: r.rating,
          body: r.body,
          location: r.location,
          productName: r.productName,
        });
        setStatus('ok');
      })
      .catch(e => { console.error(e); if (!cancelled) setStatus('error'); });
    return () => { cancelled = true; };
  }, [reviewId]);

  async function handleSubmit(req: ReviewUpsertRequest) {
    await updateAdminReview(reviewId, req);
    navigate('/admin/reviews', { replace: true });
  }

  return (
    <AdminLayout>
      <nav aria-label="Breadcrumb" className="text-sm text-muted mb-4">
        <Link to="/admin/reviews" className="hover:text-terracotta">← Reseñas</Link>
      </nav>
      <h1 className="font-display text-4xl text-ink mb-8">Editar reseña</h1>

      {status === 'loading' && <p className="text-muted">Cargando…</p>}
      {status === 'error' && (
        <p className="text-terracotta">No se pudo cargar la reseña.</p>
      )}
      {status === 'ok' && initial && (
        <ReviewForm initial={initial} submitLabel="Guardar cambios" onSubmit={handleSubmit} />
      )}
    </AdminLayout>
  );
}
