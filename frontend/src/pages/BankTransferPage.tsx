import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { getBankTransferInfo, getOrderByReference, type BankTransferInfo } from '../api/orders';
import type { Order } from '../types/api';
import { formatArs } from '../lib/price';

type Status = 'loading' | 'ok' | 'error';

export default function BankTransferPage() {
  const { reference = '' } = useParams<{ reference: string }>();
  const [status, setStatus] = useState<Status>('loading');
  const [order, setOrder] = useState<Order | null>(null);
  const [bank, setBank] = useState<BankTransferInfo | null>(null);

  useEffect(() => {
    // Load order + bank config in parallel; either failing sends us to the
    // error state (a customer landing here without a valid ref is the main
    // legitimate reason this happens).
    Promise.all([getOrderByReference(reference), getBankTransferInfo()])
      .then(([o, b]) => {
        setOrder(o);
        setBank(b);
        setStatus(b ? 'ok' : 'error');
      })
      .catch(() => setStatus('error'));
  }, [reference]);

  return (
    <>
      <Header />
      <main className="max-w-3xl mx-auto px-6 py-12">
        <p className="text-terracotta text-xs tracking-[0.3em] mb-2">TRANSFERENCIA BANCARIA</p>
        <h1 className="font-display text-4xl text-ink mb-6">Datos para pagar</h1>

        {status === 'loading' && (
          <p className="text-muted py-12 text-center">Cargando datos…</p>
        )}

        {status === 'error' && (
          <div className="bg-white p-8 rounded-card text-center">
            <p className="text-terracotta mb-4">No pudimos cargar los datos.</p>
            <Link to="/" className="text-terracotta hover:underline">← Volver al inicio</Link>
          </div>
        )}

        {status === 'ok' && order && bank && (
          <>
            <section className="bg-white rounded-card p-6 mb-6">
              <p className="text-xs tracking-[0.3em] text-muted mb-2">TU ORDEN</p>
              <p className="font-mono text-ink text-lg mb-4">{order.reference}</p>
              <div className="flex justify-between items-baseline border-t border-cream-card pt-4">
                <span className="text-muted">Monto a transferir</span>
                <span className="font-display text-3xl text-terracotta">
                  {formatArs(order.subtotalArs)}
                </span>
              </div>
            </section>

            <section className="bg-white rounded-card p-6 mb-6">
              <p className="text-xs tracking-[0.3em] text-muted mb-4">DATOS DE LA CUENTA</p>
              <dl className="space-y-4">
                <BankField label="Banco" value={bank.bankName} />
                <BankField label="Titular" value={bank.accountHolder} />
                {bank.cuit && <BankField label="CUIT" value={bank.cuit} copyable />}
                {bank.alias && <BankField label="Alias" value={bank.alias} copyable emphasize />}
                {bank.cbu && <BankField label="CBU" value={bank.cbu} copyable emphasize />}
              </dl>
            </section>

            <section className="bg-cream-card/60 border border-cream-card rounded-card p-6">
              <p className="text-xs tracking-[0.3em] text-brown-dark mb-3">
                IMPORTANTE — CÓMO CONFIRMAR TU PAGO
              </p>
              <ol className="list-decimal list-inside space-y-2 text-ink text-sm">
                <li>
                  Transferí <strong>exactamente {formatArs(order.subtotalArs)}</strong>{' '}
                  desde tu home banking o app.
                </li>
                <li>
                  Incluí la referencia <strong className="font-mono">{order.reference}</strong>{' '}
                  en el concepto/observación de la transferencia.
                </li>
                <li>
                  Enviá el comprobante por {bank.contactMethod} indicando tu email
                  ({order.customerEmail}) para que asociemos el pago con tu orden.
                </li>
                <li>
                  Una vez que verifiquemos el ingreso te enviamos el email de
                  confirmación y coordinamos el envío. Tarda 1 día hábil.
                </li>
              </ol>
            </section>

            <div className="mt-8 text-center">
              <Link
                to="/"
                className="inline-block text-muted hover:text-terracotta text-sm"
              >
                ← Volver al inicio
              </Link>
            </div>
          </>
        )}
      </main>
      <Footer />
    </>
  );
}

function BankField({ label, value, copyable, emphasize }: {
  label: string;
  value: string;
  copyable?: boolean;
  emphasize?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard permission denied — no fallback, the value is right there */
    }
  }

  return (
    <div className="flex items-center justify-between gap-4 flex-wrap">
      <dt className="text-xs tracking-wider text-muted uppercase">{label}</dt>
      <dd className="flex items-center gap-2">
        <span
          className={
            (emphasize ? 'font-mono text-lg text-ink' : 'text-ink') +
            ' break-all text-right'
          }
        >
          {value}
        </span>
        {copyable && (
          <button
            type="button"
            onClick={() => void copy()}
            className="text-xs text-terracotta hover:underline whitespace-nowrap"
            aria-label={`Copiar ${label}`}
          >
            {copied ? '✓ copiado' : 'copiar'}
          </button>
        )}
      </dd>
    </div>
  );
}
