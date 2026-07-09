import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { deleteAdminProduct, listAdminProducts } from '../../api/admin';
import type { AdminProduct } from '../../types/api';

import { formatArs } from '../../lib/price';

type Status = 'loading' | 'ok' | 'error';

export default function ProductsListPage() {
  const [status, setStatus] = useState<Status>('loading');
  const [items, setItems] = useState<AdminProduct[]>([]);
  const [q, setQ] = useState('');
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const load = useCallback(async (query = q) => {
    setStatus('loading');
    try {
      const page = await listAdminProducts(query || undefined);
      setItems(page.content);
      setStatus('ok');
    } catch (e) {
      console.error(e);
      setStatus('error');
    }
  }, [q]);

  useEffect(() => { void load(''); /* initial load */ }, [load]);

  async function handleDelete(p: AdminProduct) {
    const confirmed = window.confirm(
      `¿Borrar el producto "${p.name}"?\nEsta acción no se puede deshacer.`
    );
    if (!confirmed) return;
    setDeletingId(p.id);
    try {
      await deleteAdminProduct(p.id);
      setItems(list => list.filter(x => x.id !== p.id));
      setFeedback(`"${p.name}" borrado.`);
      setTimeout(() => setFeedback(null), 3000);
    } catch (e) {
      console.error(e);
      setFeedback('No se pudo borrar. Intentá de nuevo.');
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <div>
          <p className="text-xs tracking-[0.3em] text-terracotta mb-2">CATÁLOGO</p>
          <h1 className="font-display text-4xl text-ink">Productos</h1>
        </div>
        <Link
          to="/admin/products/new"
          className="bg-brown-dark hover:bg-brown text-white px-5 py-3 text-sm tracking-wider font-semibold"
        >
          + NUEVO PRODUCTO
        </Link>
      </div>

      {feedback && (
        <div role="status" className="mb-4 bg-cream-card text-ink px-4 py-3 rounded-card text-sm">
          {feedback}
        </div>
      )}

      <div className="mb-6">
        <input
          type="search"
          value={q}
          onChange={e => setQ(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') void load(); }}
          placeholder="Buscar por nombre o slug… (Enter para buscar)"
          className="w-full max-w-md border border-cream-card px-4 py-2 focus:outline-none focus:border-brown-dark"
        />
      </div>

      {status === 'loading' && (
        <p className="text-muted py-12 text-center">Cargando productos…</p>
      )}

      {status === 'error' && (
        <p className="text-terracotta py-12 text-center">
          Algo salió mal. <button className="underline" onClick={() => void load()}>Reintentar</button>
        </p>
      )}

      {status === 'ok' && items.length === 0 && (
        <p className="text-muted py-12 text-center">Sin resultados.</p>
      )}

      {status === 'ok' && items.length > 0 && (
        <div className="overflow-x-auto bg-white rounded-card">
          <table className="w-full text-sm">
            <thead className="bg-cream-card text-muted text-xs tracking-wider">
              <tr>
                <th className="text-left px-4 py-3 w-16">IMG</th>
                <th className="text-left px-4 py-3">NOMBRE</th>
                <th className="text-left px-4 py-3">CATEGORÍA</th>
                <th className="text-left px-4 py-3">BADGE</th>
                <th className="text-right px-4 py-3">PRECIO</th>
                <th className="text-right px-4 py-3 w-40">ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              {items.map(p => (
                <tr key={p.id} className="border-t border-cream-card">
                  <td className="px-4 py-3">
                    <img
                      src={p.imageUrl}
                      alt=""
                      className="w-12 h-12 object-cover rounded-sm bg-cream-card"
                      loading="lazy"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-ink font-medium">{p.name}</div>
                    <div className="text-xs text-muted">{p.slug}</div>
                  </td>
                  <td className="px-4 py-3 text-ink">{p.categoryName}</td>
                  <td className="px-4 py-3">
                    {p.badge
                      ? <span className="inline-block bg-terracotta text-white text-[10px] font-semibold tracking-wider px-2 py-1 rounded-sm">
                          {p.badge.replace('_', ' ')}
                        </span>
                      : <span className="text-muted">—</span>}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-terracotta">
                    {formatArs(p.priceArs)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex gap-2">
                      <Link
                        to={`/admin/products/${p.id}/edit`}
                        className="text-brown-dark hover:underline text-sm"
                      >
                        Editar
                      </Link>
                      <span className="text-cream-card">|</span>
                      <button
                        onClick={() => void handleDelete(p)}
                        disabled={deletingId === p.id}
                        className="text-terracotta hover:underline text-sm disabled:opacity-40"
                      >
                        {deletingId === p.id ? 'Borrando…' : 'Borrar'}
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
