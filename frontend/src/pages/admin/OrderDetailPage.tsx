import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { getAdminOrder, updateOrderStatus } from '../../api/admin';
import { ApiRequestError } from '../../types/api';
import type { Order, OrderStatus } from '../../types/api';

import { formatArs } from '../../lib/price';

const STATUSES: OrderStatus[] = ['PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

const STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING:   'Pendiente',
  PAID:      'Pagada',
  SHIPPED:   'Enviada',
  DELIVERED: 'Entregada',
  CANCELLED: 'Cancelada',
};

const dateFmt = new Intl.DateTimeFormat('es-AR', {
  dateStyle: 'long', timeStyle: 'short',
});

type Status = 'loading' | 'ok' | 'not-found' | 'error';

export default function OrderDetailPage() {
  const { id = '' } = useParams<{ id: string }>();
  const orderId = Number(id);
  const [status, setStatus] = useState<Status>('loading');
  const [order, setOrder] = useState<Order | null>(null);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    getAdminOrder(orderId)
      .then(o => { setOrder(o); setStatus('ok'); })
      .catch(err => {
        if (err instanceof ApiRequestError && err.status === 404) setStatus('not-found');
        else { console.error(err); setStatus('error'); }
      });
  }, [orderId]);

  async function handleStatusChange(next: OrderStatus) {
    if (!order || next === order.status) return;
    setSaving(true);
    setFeedback(null);
    try {
      const updated = await updateOrderStatus(orderId, next);
      setOrder(updated);
      setFeedback(`Estado cambiado a "${STATUS_LABEL[next]}".`);
      setTimeout(() => setFeedback(null), 3000);
    } catch (e) {
      console.error(e);
      setFeedback('No se pudo actualizar el estado.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <AdminLayout>
      <nav aria-label="Breadcrumb" className="text-sm text-muted mb-4">
        <Link to="/admin/orders" className="hover:text-terracotta">← Órdenes</Link>
      </nav>

      {status === 'loading' && <p className="text-muted py-12 text-center">Cargando…</p>}

      {status === 'not-found' && (
        <div className="py-12 text-center">
          <p className="font-display text-2xl text-ink mb-2">Orden no encontrada</p>
          <Link to="/admin/orders" className="text-terracotta hover:underline">
            Volver al listado
          </Link>
        </div>
      )}

      {status === 'error' && (
        <p className="text-terracotta py-12 text-center">Error cargando la orden.</p>
      )}

      {status === 'ok' && order && (
        <>
          <div className="mb-6">
            <p className="text-xs tracking-[0.3em] text-terracotta mb-2">ORDEN</p>
            <h1 className="font-display text-4xl text-ink font-mono">{order.reference}</h1>
            <p className="text-muted text-sm mt-1">
              Creada el {dateFmt.format(new Date(order.createdAt))}
            </p>
          </div>

          {feedback && (
            <div role="status" className="mb-6 bg-cream-card text-ink px-4 py-3 rounded-card text-sm">
              {feedback}
            </div>
          )}

          {/* Status changer */}
          <section className="bg-white rounded-card p-6 mb-6">
            <p className="text-xs tracking-[0.3em] text-muted mb-3">ESTADO ACTUAL</p>
            <div className="flex items-center gap-3 flex-wrap">
              {STATUSES.map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => void handleStatusChange(s)}
                  disabled={saving || s === order.status}
                  className={
                    'px-4 py-2 text-xs tracking-wider font-semibold border transition-colors ' +
                    (s === order.status
                      ? 'bg-brown-dark text-white border-brown-dark cursor-default'
                      : 'bg-white text-ink border-cream-card hover:border-brown-dark disabled:opacity-40')
                  }
                >
                  {STATUS_LABEL[s].toUpperCase()}
                </button>
              ))}
            </div>
          </section>

          {/* Customer + shipping */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <section className="bg-white rounded-card p-6">
              <p className="text-xs tracking-[0.3em] text-muted mb-3">CONTACTO</p>
              <p className="text-ink font-medium">{order.customerName}</p>
              <p className="text-muted text-sm">{order.customerEmail}</p>
              {order.phone && <p className="text-muted text-sm">{order.phone}</p>}
            </section>

            <section className="bg-white rounded-card p-6">
              <p className="text-xs tracking-[0.3em] text-muted mb-3">ENVÍO</p>
              <p className="text-ink">{order.shippingAddress}</p>
              <p className="text-muted text-sm">
                {order.city}
                {order.postalCode && ` · ${order.postalCode}`}
              </p>
              <p className="text-muted text-sm">{order.country}</p>
              {order.notes && (
                <p className="text-xs text-muted mt-3 italic">"{order.notes}"</p>
              )}
            </section>
          </div>

          {/* Items */}
          <section className="bg-white rounded-card p-6">
            <p className="text-xs tracking-[0.3em] text-muted mb-4">
              PRODUCTOS ({order.items.length})
            </p>
            <ul className="divide-y divide-cream-card">
              {order.items.map(it => (
                <li key={it.id} className="py-3 flex items-center gap-4">
                  <img
                    src={it.productImageUrl}
                    alt=""
                    className="w-16 h-16 object-cover rounded-sm bg-cream-card"
                  />
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/producto/${it.productSlug}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-ink font-medium hover:text-terracotta"
                    >
                      {it.productName}
                    </Link>
                    {it.color && (
                      <p className="text-xs text-muted flex items-center gap-2 mt-1">
                        Color
                        <span
                          style={{ backgroundColor: it.color }}
                          className="inline-block w-3 h-3 rounded-sm border border-black/10"
                        />
                        {it.color}
                      </p>
                    )}
                    <p className="text-xs text-muted mt-1">
                      {formatArs(it.unitPriceArs)} × {it.quantity}
                    </p>
                  </div>
                  <p className="font-semibold text-terracotta w-24 text-right">
                    {formatArs(it.lineTotalArs)}
                  </p>
                </li>
              ))}
            </ul>
            <div className="border-t border-cream-card pt-4 mt-4 flex justify-between items-center">
              <span className="text-ink font-medium">Total</span>
              <span className="font-display text-2xl text-terracotta">
                {formatArs(order.subtotalArs)}
              </span>
            </div>
          </section>
        </>
      )}
    </AdminLayout>
  );
}
