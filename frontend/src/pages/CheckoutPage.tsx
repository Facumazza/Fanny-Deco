import { FormEvent, useEffect, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { useCart } from '../hooks/useCart';
import { createOrder, initiatePayment, getBankTransferInfo } from '../api/orders';
import { ApiRequestError } from '../types/api';

import { formatArs } from '../lib/price';

type PaymentMethod = 'mercadopago' | 'bank_transfer';

const inputCls =
  'w-full border border-cream-card px-3 py-2 focus:outline-none focus:border-brown-dark bg-white';

interface FormState {
  customerEmail: string;
  customerName: string;
  shippingAddress: string;
  city: string;
  postalCode: string;
  country: string;
  phone: string;
  notes: string;
}

const INITIAL: FormState = {
  customerEmail: '',
  customerName: '',
  shippingAddress: '',
  city: '',
  postalCode: '',
  country: 'Argentina',
  phone: '',
  notes: '',
};

export default function CheckoutPage() {
  const { items, subtotalArs, itemCount, clear } = useCart();
  const navigate = useNavigate();

  const [form, setForm] = useState<FormState>(INITIAL);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('mercadopago');
  const [bankTransferAvailable, setBankTransferAvailable] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Poll the shop's bank-transfer config once on mount. Endpoint 404s (→ null)
  // when the shop doesn't offer transfers, in which case we don't render the radio.
  useEffect(() => {
    getBankTransferInfo().then(info => setBankTransferAvailable(info !== null));
  }, []);

  // If the user lands here with an empty cart, send them back — nothing to check out.
  if (items.length === 0) {
    return <Navigate to="/carrito" replace />;
  }

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm(f => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const order = await createOrder({
        customerEmail: form.customerEmail.trim(),
        customerName: form.customerName.trim(),
        shippingAddress: form.shippingAddress.trim(),
        city: form.city.trim(),
        postalCode: form.postalCode.trim() || undefined,
        country: form.country.trim(),
        phone: form.phone.trim() || undefined,
        notes: form.notes.trim() || undefined,
        items: items.map(it => ({
          productId: it.productId,
          quantity: it.quantity,
        })),
      });

      // Both branches: empty the cart only after order creation succeeded,
      // so a network hiccup on that first call doesn't wipe the user's items.
      if (paymentMethod === 'bank_transfer') {
        clear();
        navigate(`/orden/${order.reference}/transferencia`);
        return;
      }

      // MP branch: initiate MP preference; only clear cart once we know we're
      // bouncing to their checkout (if init fails we keep the cart for retry).
      const initiation = await initiatePayment(order.reference);
      clear();
      window.location.href = initiation.initPoint;
    } catch (err) {
      if (err instanceof ApiRequestError && err.body?.message) {
        setError(err.body.message);
      } else {
        setError('No se pudo crear la orden. Intentá de nuevo.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Header />
      <main className="max-w-6xl mx-auto px-6 py-12">
        <nav className="text-sm text-muted mb-4">
          <Link to="/carrito" className="hover:text-terracotta">← Volver al carrito</Link>
        </nav>

        <p className="text-terracotta text-xs tracking-[0.3em] mb-2">CHECKOUT</p>
        <h1 className="font-display text-4xl text-ink mb-8">Finalizar compra</h1>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2 space-y-8">
            {error && (
              <div role="alert" className="bg-terracotta/10 border border-terracotta/40 text-terracotta px-4 py-3 rounded-card text-sm">
                {error}
              </div>
            )}

            <section className="bg-white p-6 rounded-card">
              <h2 className="font-display text-2xl text-ink mb-4">Datos de contacto</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Email" required>
                  <input
                    type="email" required
                    value={form.customerEmail}
                    onChange={e => set('customerEmail', e.target.value)}
                    className={inputCls}
                  />
                </Field>
                <Field label="Nombre completo" required>
                  <input
                    type="text" required maxLength={200}
                    value={form.customerName}
                    onChange={e => set('customerName', e.target.value)}
                    className={inputCls}
                  />
                </Field>
                <Field label="Teléfono" hint="Opcional. Para coordinar la entrega.">
                  <input
                    type="tel" maxLength={60}
                    value={form.phone}
                    onChange={e => set('phone', e.target.value)}
                    className={inputCls}
                  />
                </Field>
              </div>
            </section>

            <section className="bg-white p-6 rounded-card">
              <h2 className="font-display text-2xl text-ink mb-4">Dirección de envío</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Field label="Dirección" required hint="Calle, número, piso, departamento">
                    <input
                      type="text" required maxLength={500}
                      value={form.shippingAddress}
                      onChange={e => set('shippingAddress', e.target.value)}
                      className={inputCls}
                    />
                  </Field>
                </div>
                <Field label="Ciudad" required>
                  <input
                    type="text" required maxLength={120}
                    value={form.city}
                    onChange={e => set('city', e.target.value)}
                    className={inputCls}
                  />
                </Field>
                <Field label="Código postal">
                  <input
                    type="text" maxLength={20}
                    value={form.postalCode}
                    onChange={e => set('postalCode', e.target.value)}
                    className={inputCls}
                  />
                </Field>
                <Field label="País" required>
                  <input
                    type="text" required maxLength={120}
                    value={form.country}
                    onChange={e => set('country', e.target.value)}
                    className={inputCls}
                  />
                </Field>
              </div>
            </section>

            <section className="bg-white p-6 rounded-card">
              <h2 className="font-display text-2xl text-ink mb-4">Notas para el envío</h2>
              <textarea
                rows={3} maxLength={500}
                value={form.notes}
                onChange={e => set('notes', e.target.value)}
                placeholder="Ej: Tocar timbre 3B, entregar entre 10 y 15hs..."
                className={inputCls + ' resize-y'}
              />
            </section>

            {/* Payment method — only render the choice when the shop actually
                offers bank transfer; otherwise there's nothing to pick. */}
            {bankTransferAvailable && (
              <section className="bg-white p-6 rounded-card">
                <h2 className="font-display text-2xl text-ink mb-4">Método de pago</h2>
                <div className="space-y-3">
                  <PaymentOption
                    id="pm-mp"
                    label="Mercado Pago"
                    description="Tarjeta de crédito / débito, saldo Mercado Pago, Rapipago, PagoFácil. Cuotas disponibles."
                    checked={paymentMethod === 'mercadopago'}
                    onChange={() => setPaymentMethod('mercadopago')}
                  />
                  <PaymentOption
                    id="pm-bt"
                    label="Transferencia bancaria"
                    description="Te mostramos CBU + Alias en el paso siguiente. Coordiná el envío del comprobante para confirmar tu pago."
                    checked={paymentMethod === 'bank_transfer'}
                    onChange={() => setPaymentMethod('bank_transfer')}
                  />
                </div>
              </section>
            )}
          </div>

          {/* Summary */}
          <aside className="bg-white rounded-card p-6 h-fit lg:sticky lg:top-6">
            <p className="text-xs tracking-[0.3em] text-muted mb-4">TU ORDEN</p>
            <ul className="space-y-3 mb-4">
              {items.map(it => (
                <li key={it.productId} className="flex items-center gap-3 text-sm">
                  <img src={it.imageUrl} alt="" className="w-12 h-12 object-cover rounded-sm bg-cream-card" />
                  <div className="flex-1 min-w-0">
                    <p className="text-ink truncate">{it.name}</p>
                    <p className="text-muted text-xs">×{it.quantity}</p>
                  </div>
                  <p className="text-terracotta font-semibold">
                    {formatArs(it.priceArs * it.quantity)}
                  </p>
                </li>
              ))}
            </ul>
            <div className="border-t border-cream-card pt-4 mb-4">
              <div className="flex justify-between text-ink text-sm mb-1">
                <span>{itemCount} {itemCount === 1 ? 'ítem' : 'ítems'}</span>
                <span>{formatArs(subtotalArs)}</span>
              </div>
              <p className="text-xs text-muted">
                {paymentMethod === 'bank_transfer'
                  ? 'Te mostramos los datos bancarios en el paso siguiente.'
                  : 'Al continuar te redirigimos a MercadoPago para completar el pago.'}
              </p>
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-brown-dark hover:bg-brown text-white py-4 text-sm tracking-wider font-semibold transition-colors disabled:opacity-60"
            >
              {submitting
                ? (paymentMethod === 'bank_transfer' ? 'CREANDO ORDEN…' : 'YENDO A MERCADOPAGO…')
                : (paymentMethod === 'bank_transfer' ? 'CONTINUAR CON TRANSFERENCIA →' : 'PAGAR CON MERCADOPAGO →')
              }
            </button>
          </aside>
        </form>
      </main>
      <Footer />
    </>
  );
}

function Field({ label, hint, required, children }: {
  label: string; hint?: string; required?: boolean; children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-xs tracking-wider text-muted mb-1">
        {label.toUpperCase()}{required && <span className="text-terracotta"> *</span>}
      </span>
      {children}
      {hint && <span className="block text-xs text-muted mt-1">{hint}</span>}
    </label>
  );
}

function PaymentOption({ id, label, description, checked, onChange }: {
  id: string;
  label: string;
  description: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label
      htmlFor={id}
      className={
        'flex items-start gap-3 border p-4 rounded-card cursor-pointer transition-colors ' +
        (checked ? 'border-brown-dark bg-cream-bg' : 'border-cream-card hover:border-brown/40')
      }
    >
      <input
        id={id}
        type="radio"
        name="paymentMethod"
        checked={checked}
        onChange={onChange}
        className="mt-1 accent-brown-dark"
      />
      <div>
        <p className="font-medium text-ink">{label}</p>
        <p className="text-xs text-muted mt-1">{description}</p>
      </div>
    </label>
  );
}
