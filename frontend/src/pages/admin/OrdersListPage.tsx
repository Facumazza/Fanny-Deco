import { useCallback, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { listAdminOrders } from '../../api/admin';
import type { AdminOrderSummary, OrderStatus } from '../../types/api';

import { formatArs } from '../../lib/price';

const VALID_STATUS: OrderStatus[] = ['PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
function parseStatus(raw: string | null): OrderStatus | '' {
  if (!raw) return '';
  return (VALID_STATUS as string[]).includes(raw) ? (raw as OrderStatus) : '';
}

const STATUSES: OrderStatus[] = ['PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'];

const STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING:   'Pendiente',
  PAID:      'Pagada',
  SHIPPED:   'Enviada',
  DELIVERED: 'Entregada',
  CANCELLED: 'Cancelada',
  REFUNDED:  'Reembolsada',
};

const STATUS_STYLES: Record<OrderStatus, string> = {
  PENDING:   'bg-yellow-100 text-yellow-800',
  PAID:      'bg-blue-100 text-blue-800',
  SHIPPED:   'bg-purple-100 text-purple-800',
  DELIVERED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-gray-200 text-gray-600',
  REFUNDED:  'bg-orange-100 text-orange-800',
};

const dateFmt = new Intl.DateTimeFormat('es-AR', {
  day: '2-digit', month: 'short', year: 'numeric',
  hour: '2-digit', minute: '2-digit',
});

type Status = 'loading' | 'ok' | 'error';

export default function OrdersListPage() {
  const [status, setStatus] = useState<Status>('loading');
  const [items, setItems] = useState<AdminOrderSummary[]>([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const [q, setQ] = useState(searchParams.get('q') ?? '');

  // Status filter lives in the URL so dashboard cards can deep-link into a filter.
  const statusFilter: OrderStatus | '' = parseStatus(searchParams.get('status'));

  function updateStatusFilter(next: OrderStatus | '') {
    const params = new URLSearchParams(searchParams);
    if (next) params.set('status', next);
    else      params.delete('status');
    setSearchParams(params, { replace: true });
  }

  const load = useCallback(async () => {
    setStatus('loading');
    try {
      const page = await listAdminOrders({
        status: statusFilter || undefined,
        q: q || undefined,
      });
      setItems(page.content);
      setStatus('ok');
    } catch (e) {
      console.error(e);
      setStatus('error');
    }
  }, [statusFilter, q]);

  useEffect(() => { void load(); }, [load]);

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <div>
          <p className="text-xs tracking-[0.3em] text-terracotta mb-2">VENTAS</p>
          <h1 className="font-display text-4xl text-ink">Órdenes</h1>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <select
          value={statusFilter}
          onChange={e => updateStatusFilter(e.target.value as OrderStatus | '')}
          className="border border-cream-card bg-white px-3 py-2 focus:outline-none focus:border-brown-dark"
        >
          <option value="">Todos los estados</option>
          {STATUSES.map(s => (
            <option key={s} value={s}>{STATUS_LABEL[s]}</option>
          ))}
        </select>
        <input
          type="search"
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="Buscar por referencia, email o nombre…"
          className="flex-1 min-w-[240px] max-w-md border border-cream-card bg-white px-4 py-2 focus:outline-none focus:border-brown-dark"
        />
      </div>

      {status === 'loading' && (
        <p className="text-muted py-12 text-center">Cargando…</p>
      )}

      {status === 'error' && (
        <p className="text-terracotta py-12 text-center">
          Algo salió mal. <button className="underline" onClick={() => void load()}>Reintentar</button>
        </p>
      )}

      {status === 'ok' && items.length === 0 && (
        <p className="text-muted py-12 text-center">Sin órdenes que coincidan.</p>
      )}

      {status === 'ok' && items.length > 0 && (
        <div className="overflow-x-auto bg-white rounded-card">
          <table className="w-full text-sm">
            <thead className="bg-cream-card text-muted text-xs tracking-wider">
              <tr>
                <th className="text-left px-4 py-3">REFERENCIA</th>
                <th className="text-left px-4 py-3">CLIENTE</th>
                <th className="text-center px-4 py-3">ÍTEMS</th>
                <th className="text-right px-4 py-3">TOTAL</th>
                <th className="text-center px-4 py-3">ESTADO</th>
                <th className="text-right px-4 py-3">FECHA</th>
              </tr>
            </thead>
            <tbody>
              {items.map(o => (
                <tr key={o.id} className="border-t border-cream-card hover:bg-cream-card/50">
                  <td className="px-4 py-3">
                    <Link
                      to={`/admin/orders/${o.id}`}
                      className="text-brown-dark font-mono text-xs hover:underline"
                    >
                      {o.reference}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-ink">{o.customerName}</div>
                    <div className="text-xs text-muted">{o.customerEmail}</div>
                  </td>
                  <td className="px-4 py-3 text-center text-ink">{o.itemCount}</td>
                  <td className="px-4 py-3 text-right font-semibold text-terracotta">
                    {formatArs(o.subtotalArs)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-block px-2 py-1 rounded-sm text-[10px] font-semibold tracking-wider ${STATUS_STYLES[o.status]}`}>
                      {STATUS_LABEL[o.status].toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-muted text-xs">
                    {dateFmt.format(new Date(o.createdAt))}
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
