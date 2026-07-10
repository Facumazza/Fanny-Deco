import { Link, useParams } from 'react-router-dom';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';

type Kind = 'success' | 'failure' | 'pending';

interface Props {
  kind: Kind;
}

/**
 * Post-MercadoPago return pages. MP redirects the customer here after they
 * finish (or bail on) the payment. We render a short status message and,
 * for success, link to the full receipt page.
 */
export default function OrderStatusPage({ kind }: Props) {
  const { reference = '' } = useParams<{ reference: string }>();

  const copy: Record<Kind, { icon: string; badge: string; title: string; body: string; cta: string }> = {
    success: {
      icon:  '✓',
      badge: 'PAGO APROBADO',
      title: '¡Gracias por tu compra!',
      body:  'Recibimos el pago y ya empezamos a preparar tu pedido. Te vamos a mandar el detalle por email.',
      cta:   'Ver detalle de la orden',
    },
    failure: {
      icon:  '✕',
      badge: 'PAGO RECHAZADO',
      title: 'El pago no se completó',
      body:  'MercadoPago no pudo procesar el pago. Podés intentar de nuevo con otra tarjeta o volver a tu carrito.',
      cta:   'Reintentar',
    },
    pending: {
      icon:  '⏳',
      badge: 'PAGO PENDIENTE',
      title: 'Tu pago está en proceso',
      body:  'Elegiste un medio que MercadoPago procesa en horas (efectivo, transferencia). Cuando se acredite, te avisamos por email.',
      cta:   'Ver estado de la orden',
    },
  };

  const c = copy[kind];
  const iconColor = kind === 'success'
    ? 'bg-terracotta/10 text-terracotta'
    : kind === 'failure'
      ? 'bg-red-100 text-red-700'
      : 'bg-yellow-100 text-yellow-700';

  return (
    <>
      <Header />
      <main className="max-w-2xl mx-auto px-6 py-16 text-center">
        <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full text-3xl mb-6 ${iconColor}`}>
          {c.icon}
        </div>
        <p className="text-terracotta text-xs tracking-[0.3em] mb-3">{c.badge}</p>
        <h1 className="font-display text-4xl text-ink mb-4">{c.title}</h1>
        <p className="text-muted mb-6 max-w-md mx-auto">{c.body}</p>

        {reference && (
          <p className="font-mono text-sm text-ink tracking-widest mb-8">
            Referencia: {reference}
          </p>
        )}

        <div className="flex items-center justify-center gap-4 flex-wrap">
          {kind === 'failure' ? (
            <Link
              to="/carrito"
              className="bg-brown-dark hover:bg-brown text-white px-6 py-3 text-sm tracking-wider font-semibold"
            >
              {c.cta.toUpperCase()}
            </Link>
          ) : (
            <Link
              to={`/orden/${reference}`}
              className="bg-brown-dark hover:bg-brown text-white px-6 py-3 text-sm tracking-wider font-semibold"
            >
              {c.cta.toUpperCase()}
            </Link>
          )}
          <Link to="/" className="text-muted hover:text-terracotta text-sm">
            Volver a la tienda
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
