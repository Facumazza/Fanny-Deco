import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { deleteAdminCategory, listAdminCategories } from '../../api/admin';
import { ApiRequestError } from '../../types/api';
import type { AdminCategory } from '../../types/api';

type Status = 'loading' | 'ok' | 'error';

export default function CategoriesListPage() {
  const [status, setStatus] = useState<Status>('loading');
  const [items, setItems] = useState<AdminCategory[]>([]);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const load = useCallback(async () => {
    setStatus('loading');
    try {
      const list = await listAdminCategories();
      setItems(list);
      setStatus('ok');
    } catch (e) {
      console.error(e);
      setStatus('error');
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  async function handleDelete(c: AdminCategory) {
    if (c.productCount > 0) {
      window.alert(
        `No podés borrar "${c.name}" porque tiene ${c.productCount} producto(s). ` +
        `Movelos o borralos primero.`
      );
      return;
    }
    const confirmed = window.confirm(`¿Borrar la categoría "${c.name}"?`);
    if (!confirmed) return;
    setDeletingId(c.id);
    try {
      await deleteAdminCategory(c.id);
      setItems(list => list.filter(x => x.id !== c.id));
      setFeedback(`"${c.name}" borrada.`);
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
          <p className="text-xs tracking-[0.3em] text-terracotta mb-2">CATÁLOGO</p>
          <h1 className="font-display text-4xl text-ink">Categorías</h1>
        </div>
        <Link
          to="/admin/categories/new"
          className="bg-brown-dark hover:bg-brown text-white px-5 py-3 text-sm tracking-wider font-semibold"
        >
          + NUEVA CATEGORÍA
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

      {status === 'ok' && (
        <div className="overflow-x-auto bg-white rounded-card">
          <table className="w-full text-sm">
            <thead className="bg-cream-card text-muted text-xs tracking-wider">
              <tr>
                <th className="text-left px-4 py-3 w-16">IMG</th>
                <th className="text-left px-4 py-3">NOMBRE</th>
                <th className="text-left px-4 py-3">SUBTÍTULO</th>
                <th className="text-center px-4 py-3">ORDEN</th>
                <th className="text-center px-4 py-3">PRODUCTOS</th>
                <th className="text-right px-4 py-3 w-40">ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              {items.map(c => (
                <tr key={c.id} className="border-t border-cream-card">
                  <td className="px-4 py-3">
                    <img src={c.imageUrl} alt="" loading="lazy"
                         className="w-12 h-12 object-cover rounded-sm bg-cream-card" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-ink font-medium">{c.name}</div>
                    <div className="text-xs text-muted">{c.slug}</div>
                  </td>
                  <td className="px-4 py-3 text-muted">{c.subtitle ?? '—'}</td>
                  <td className="px-4 py-3 text-center text-ink">{c.displayOrder}</td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-block bg-cream-card px-3 py-1 rounded-sm text-xs">
                      {c.productCount}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex gap-2">
                      <Link to={`/admin/categories/${c.id}/edit`}
                            className="text-brown-dark hover:underline text-sm">
                        Editar
                      </Link>
                      <span className="text-cream-card">|</span>
                      <button
                        onClick={() => void handleDelete(c)}
                        disabled={deletingId === c.id}
                        className="text-terracotta hover:underline text-sm disabled:opacity-40"
                        title={c.productCount > 0
                          ? `Tiene ${c.productCount} producto(s)` : 'Borrar'}
                      >
                        {deletingId === c.id ? 'Borrando…' : 'Borrar'}
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
