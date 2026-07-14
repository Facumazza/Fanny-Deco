import { Link, useNavigate } from 'react-router-dom';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { ReviewForm } from '../../components/admin/ReviewForm';
import { createAdminReview } from '../../api/admin';
import type { ReviewUpsertRequest } from '../../types/api';

const EMPTY: ReviewUpsertRequest = {
  authorName: '',
  rating: 5,
  body: '',
  location: null,
  productName: null,
};

export default function ReviewNewPage() {
  const navigate = useNavigate();

  async function handleSubmit(req: ReviewUpsertRequest) {
    await createAdminReview(req);
    navigate('/admin/reviews', { replace: true });
  }

  return (
    <AdminLayout>
      <nav aria-label="Breadcrumb" className="text-sm text-muted mb-4">
        <Link to="/admin/reviews" className="hover:text-terracotta">← Reseñas</Link>
      </nav>
      <h1 className="font-display text-4xl text-ink mb-8">Nueva reseña</h1>
      <ReviewForm initial={EMPTY} submitLabel="Crear reseña" onSubmit={handleSubmit} />
    </AdminLayout>
  );
}
