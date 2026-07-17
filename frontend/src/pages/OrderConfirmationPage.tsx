import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { getOrderByReference } from '../api/orders';
import { ApiRequestError } from '../types/api';
import type { Order } from '../types/api';

import { formatArs } from '../lib/price';

type Status = 'loading' | 'ok' | 'not-found' | 'error';

export default function OrderConfirmationPage() {
  const { reference = '' } = useParams<{ reference: string }>();
  const [status, setStatus] = useState<Status>('loading');
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    getOrderByReference(reference)
      .then(o => { setOrder(o); setStatus('ok'); })
      .catch(err => {
        if (err instanceof ApiRequestError && err.status === 404) setStatus('not-found');
        else { console.error(err); setStatus('error'); }
      });
  }, [reference]);

  return (
    <>
      <Header />
      <main className="max-w-4xl mx-auto px-6 py-12">
        {status === 'loading' && <p className="text-muted py-16 text-center">Cargando orden…</p>}

        {status === 'not-found' && (
          <div className="text-center py-16">
            <h1 className="font-display text-3xl text-ink mb-4">Orden no encontrada</h1>
            <p className="text-muted mb-6">La referencia {reference} no corresponde a ninguna orden.</p>
            <Link to="/" className="text-terracotta hover:underline">Volver a la tienda</Link>
          </div>
        )}

        {status === 'error' && (
          <p className="text-terracotta py-16 text-center">Algo salió mal cargando la orden.</p>
        )}

        {status === 'ok' && order && (
          <>
            {/* Header */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-terracotta/10 text-terracotta text-3xl mb-4">
                ✓
              </div>
              <p className="text-terracotta text-xs tracking-[0.3em] mb-2">GRACIAS POR TU COMPRA</p>
              <h1 className="font-display text-4xl text-ink mb-4">Tu orden fue recibida</h1>
              <p className="text-muted mb-2">
                Guardá esta referencia para consultar el estado:
              </p>
              <p className="font-mono text-2xl text-ink tracking-widest">
                {order.reference}
              </p>
            </div>

            {/* Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
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

            {order.trackingInfo && (
              <section className="bg-cream-card rounded-card p-6 mb-8">
                <p className="text-xs tracking-[0.3em] text-terracotta mb-3">SEGUIMIENTO</p>
                <p className="text-sm text-muted mb-2">
                  Tu pedido ya está en camino con este código:
                </p>
                <p className="font-mono text-lg text-ink tracking-wide bg-white inline-block px-3 py-2 rounded-sm">
                  {order.trackingInfo}
                </p>
              </section>
            )}

            {/* Items */}
            <section className="bg-white rounded-card p-6 mb-6">
              <p className="text-xs tracking-[0.3em] text-muted mb-4">PRODUCTOS ({order.items.length})</p>
              <ul className="divide-y divide-cream-card">
                {order.items.map(it => (
                  <li key={it.id} className="py-3 flex items-center gap-4">
                    <img
                      src={it.productImageUrl}
                      alt=""
                      className="w-16 h-16 object-cover rounded-sm bg-cream-card"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-ink font-medium">{it.productName}</p>
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

            <div className="bg-cream-card p-6 rounded-card mb-8 text-sm text-ink">
              <p className="font-medium mb-1">Próximos pasos</p>
              <p className="text-muted">
                Vas a recibir un email en <strong>{order.customerEmail}</strong> con
                los detalles de pago y el seguimiento del envío en las próximas 24 horas.
              </p>
            </div>

            <div className="text-center">
              <Link
                to="/"
                className="inline-block bg-brown-dark hover:bg-brown text-white px-6 py-3 text-sm tracking-wider font-semibold"
              >
                SEGUIR COMPRANDO
              </Link>
            </div>
          </>
        )}
      </main>
      <Footer />
    </>
  );
}
