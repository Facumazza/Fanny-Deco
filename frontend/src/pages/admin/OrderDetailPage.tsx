import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { getAdminOrder, refundOrder, updateOrderStatus, updateOrderTracking } from '../../api/admin';
import { ApiRequestError } from '../../types/api';
import type { Order, OrderStatus } from '../../types/api';
import { formatArs } from '../../lib/price';

// Statuses the admin can flip TO with the status buttons. REFUNDED is intentionally
// excluded — it's set only via the refund action so the money-movement side effect
// isn't accidentally triggered by clicking a chip.
const STATUSES: OrderStatus[] = ['PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

const STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING:   'Pendiente',
  PAID:      'Pagada',
  SHIPPED:   'Enviada',
  DELIVERED: 'Entregada',
  CANCELLED: 'Cancelada',
  REFUNDED:  'Reembolsada',
};

/** Terminal statuses where "cambiar estado" doesn't make sense anymore. */
const TERMINAL: OrderStatus[] = ['CANCELLED', 'REFUNDED'];

/** Statuses where a refund still makes sense (payment came through and hasn't been reversed). */
const REFUNDABLE: OrderStatus[] = ['PAID', 'SHIPPED', 'DELIVERED'];

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
          <StatusChanger order={order} saving={saving} onChange={handleStatusChange} />

          {/* Refund action — only relevant while the payment is live. */}
          {REFUNDABLE.includes(order.status) && (
            <RefundPanel order={order} onRefunded={o => {
              setOrder(o);
              setFeedback('Reembolso procesado. Se le notificó al cliente por email.');
              setTimeout(() => setFeedback(null), 3500);
            }} />
          )}

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

          {order.receiptUrl && (
            <section className="bg-white rounded-card p-6 mb-6 border-l-4 border-terracotta">
              <p className="text-xs tracking-[0.3em] text-terracotta mb-2">COMPROBANTE DE TRANSFERENCIA</p>
              <p className="text-sm text-muted mb-3">
                El cliente subió un comprobante. Verificalo en el banco antes de marcar la orden como pagada.
              </p>
              <a
                href={order.receiptUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-block bg-brown-dark hover:bg-brown text-white px-5 py-2 text-sm tracking-wider font-semibold transition-colors"
              >
                VER COMPROBANTE →
              </a>
            </section>
          )}

          <TrackingEditor
            order={order}
            onUpdated={updated => { setOrder(updated); setFeedback('Seguimiento guardado.'); setTimeout(() => setFeedback(null), 3000); }}
          />

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

function StatusChanger({ order, saving, onChange }: {
  order: Order;
  saving: boolean;
  onChange: (next: OrderStatus) => void | Promise<void>;
}) {
  const [pending, setPending] = useState<OrderStatus>(order.status);
  useEffect(() => { setPending(order.status); }, [order.status]);

  const dirty = pending !== order.status;
  const terminal = TERMINAL.includes(order.status);

  return (
    <section className="bg-white rounded-card p-6 mb-6">
      <p className="text-xs tracking-[0.3em] text-muted mb-3">ESTADO</p>
      {terminal ? (
        <p className="text-sm text-muted">
          Esta orden está en estado terminal (
          <strong>{STATUS_LABEL[order.status]}</strong>) y no se puede
          cambiar más.
        </p>
      ) : (
        <div className="flex items-center gap-3 flex-wrap">
          <select
            value={pending}
            onChange={e => setPending(e.target.value as OrderStatus)}
            disabled={saving}
            className="min-w-[220px] border border-cream-card px-3 py-2 focus:outline-none focus:border-brown-dark bg-white text-ink"
            aria-label="Cambiar estado de la orden"
          >
            {STATUSES.map(s => (
              <option key={s} value={s}>{STATUS_LABEL[s]}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => void onChange(pending)}
            disabled={!dirty || saving}
            className="bg-brown-dark hover:bg-brown text-white px-5 py-2 text-sm tracking-wider font-semibold disabled:opacity-40"
          >
            {saving ? 'GUARDANDO…' : 'GUARDAR'}
          </button>
        </div>
      )}
    </section>
  );
}

function RefundPanel({ order, onRefunded }: {
  order: Order;
  onRefunded: (o: Order) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRefund() {
    const ok = window.confirm(
      `¿Reembolsar ${formatArs(order.subtotalArs)} al cliente?\n\n` +
      `MercadoPago va a devolver el importe al medio de pago original y le vamos ` +
      `a notificar por email. Esta acción no se puede deshacer.`
    );
    if (!ok) return;
    setBusy(true);
    setError(null);
    try {
      const refunded = await refundOrder(order.id);
      onRefunded(refunded);
    } catch (e) {
      console.error(e);
      const body = (e as { body?: { message?: string } }).body;
      setError(body?.message ?? 'No se pudo procesar el reembolso.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="bg-white rounded-card p-6 mb-6 border border-orange-100">
      <p className="text-xs tracking-[0.3em] text-muted mb-2">REEMBOLSO</p>
      <p className="text-sm text-muted mb-4 max-w-2xl">
        Devuelve el importe total al medio de pago original vía MercadoPago.
        El cliente recibe el email de confirmación automáticamente.
      </p>
      <button
        type="button"
        onClick={() => void handleRefund()}
        disabled={busy}
        className="bg-white text-terracotta border border-terracotta hover:bg-terracotta hover:text-white px-5 py-2 text-sm tracking-wider font-semibold transition-colors disabled:opacity-40"
      >
        {busy ? 'REEMBOLSANDO…' : `REEMBOLSAR ${formatArs(order.subtotalArs)}`}
      </button>
      {error && <p role="alert" className="text-terracotta text-xs mt-3">{error}</p>}
    </section>
  );
}

function TrackingEditor({ order, onUpdated }: {
  order: Order;
  onUpdated: (o: Order) => void;
}) {
  const [value, setValue] = useState(order.trackingInfo ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset when the parent flips to a different order.
  useEffect(() => { setValue(order.trackingInfo ?? ''); }, [order.id, order.trackingInfo]);

  const dirty = (value.trim() || null) !== (order.trackingInfo ?? null);

  async function save() {
    setSaving(true);
    setError(null);
    try {
      const updated = await updateOrderTracking(order.id, value.trim() || null);
      onUpdated(updated);
    } catch (e) {
      console.error(e);
      setError('No se pudo guardar. Revisá el campo (máx 300 caracteres).');
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="bg-white rounded-card p-6 mb-6">
      <p className="text-xs tracking-[0.3em] text-muted mb-3">SEGUIMIENTO DEL ENVÍO</p>
      <p className="text-xs text-muted mb-3">
        Código del correo (OCA, Andreani, Correo Argentino, etc.). Si lo dejás
        acá, el próximo email que reciba el cliente lo incluye automáticamente.
      </p>
      <div className="flex items-center gap-3 flex-wrap">
        <input
          type="text"
          maxLength={300}
          value={value}
          onChange={e => setValue(e.target.value)}
          placeholder="ej: OCA E1234567AR"
          className="flex-1 min-w-[260px] border border-cream-card px-3 py-2 focus:outline-none focus:border-brown-dark bg-white"
        />
        <button
          type="button"
          onClick={() => void save()}
          disabled={!dirty || saving}
          className="bg-brown-dark hover:bg-brown text-white px-5 py-2 text-sm tracking-wider font-semibold disabled:opacity-40"
        >
          {saving ? 'GUARDANDO…' : 'GUARDAR'}
        </button>
      </div>
      {error && <p role="alert" className="text-terracotta text-xs mt-2">{error}</p>}
    </section>
  );
}
