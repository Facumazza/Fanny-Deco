import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { deleteAdminReview, listAdminReviews } from '../../api/admin';
import { ApiRequestError } from '../../types/api';
import type { Review } from '../../types/api';

type Status = 'loading' | 'ok' | 'error';

const dateFmt = new Intl.DateTimeFormat('es-AR', {
  day: '2-digit', month: 'short', year: 'numeric',
});

export default function ReviewsListPage() {
  const [status, setStatus] = useState<Status>('loading');
  const [items, setItems] = useState<Review[]>([]);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const load = useCallback(async () => {
    setStatus('loading');
    try {
      const list = await listAdminReviews();
      setItems(list);
      setStatus('ok');
    } catch (e) {
      console.error(e);
      setStatus('error');
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  async function handleDelete(r: Review) {
    const confirmed = window.confirm(
      `¿Borrar la reseña de "${r.authorName}"? Esto no se puede deshacer.`
    );
    if (!confirmed) return;
    setDeletingId(r.id);
    try {
      await deleteAdminReview(r.id);
      setItems(list => list.filter(x => x.id !== r.id));
      setFeedback(`Reseña de "${r.authorName}" borrada.`);
      setTimeout(() => setFeedback(null), 3000);
    } catch (e) {
      const body = (e instanceof ApiRequestError) ? e.body : null;
      setFeedback(body?.message ?? 'No se pudo borrar.');
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <div>
          <p className="text-xs tracking-[0.3em] text-terracotta mb-2">TESTIMONIOS</p>
          <h1 className="font-display text-4xl text-ink">Reseñas</h1>
        </div>
        <Link
          to="/admin/reviews/new"
          className="bg-brown-dark hover:bg-brown text-white px-5 py-3 text-sm tracking-wider font-semibold"
        >
          + NUEVA RESEÑA
        </Link>
      </div>

      {feedback && (
        <div role="status" className="mb-4 bg-cream-card text-ink px-4 py-3 rounded-card text-sm">
          {feedback}
        </div>
      )}

      {status === 'loading' && <p className="text-muted py-12 text-center">Cargando…</p>}
      {status === 'error' && (
        <p className="text-terracotta py-12 text-center">
          Algo salió mal. <button className="underline" onClick={() => void load()}>Reintentar</button>
        </p>
      )}

      {status === 'ok' && items.length === 0 && (
        <p className="text-muted py-16 text-center">
          Todavía no hay reseñas. <Link to="/admin/reviews/new" className="text-terracotta hover:underline">Cargá la primera →</Link>
        </p>
      )}

      {status === 'ok' && items.length > 0 && (
        <div className="overflow-x-auto bg-white rounded-card">
          <table className="w-full text-sm">
            <thead className="bg-cream-card text-muted text-xs tracking-wider">
              <tr>
                <th className="text-left px-4 py-3">AUTOR</th>
                <th className="text-center px-4 py-3 w-20">RATING</th>
                <th className="text-left px-4 py-3">TESTIMONIO</th>
                <th className="text-left px-4 py-3 w-40">PRODUCTO</th>
                <th className="text-left px-4 py-3 w-28">FECHA</th>
                <th className="text-right px-4 py-3 w-40">ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              {items.map(r => (
                <tr key={r.id} className="border-t border-cream-card align-top">
                  <td className="px-4 py-3">
                    <div className="text-ink font-medium">{r.authorName}</div>
                    <div className="text-xs text-muted">{r.location ?? '—'}</div>
                  </td>
                  <td className="px-4 py-3 text-center text-brown-dark font-semibold">
                    {r.rating} ★
                  </td>
                  <td className="px-4 py-3 text-muted">
                    <p className="line-clamp-2 max-w-md">{r.body}</p>
                  </td>
                  <td className="px-4 py-3 text-muted text-xs">{r.productName ?? '—'}</td>
                  <td className="px-4 py-3 text-muted text-xs whitespace-nowrap">
                    {dateFmt.format(new Date(r.createdAt))}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex gap-2">
                      <Link to={`/admin/reviews/${r.id}/edit`}
                            className="text-brown-dark hover:underline text-sm">
                        Editar
                      </Link>
                      <span className="text-cream-card">|</span>
                      <button
                        onClick={() => void handleDelete(r)}
                        disabled={deletingId === r.id}
                        className="text-terracotta hover:underline text-sm disabled:opacity-40"
                      >
                        {deletingId === r.id ? 'Borrando…' : 'Borrar'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  );
}
