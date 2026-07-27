import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { getOrderByReference, uploadReceipt } from '../api/orders';
import { ApiRequestError } from '../types/api';
import type { Order } from '../types/api';
import { formatArs } from '../lib/price';
import { BANK_INFO } from '../config/bank';

type Status = 'loading' | 'ok' | 'error';

export default function BankTransferPage() {
  const { reference = '' } = useParams<{ reference: string }>();
  const [status, setStatus] = useState<Status>('loading');
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    // Bank data is hardcoded (see src/config/bank.ts) so this only fetches
    // the order — the previous parallel promise was overkill once the bank
    // endpoint became a compile-time constant.
    getOrderByReference(reference)
      .then(o => { setOrder(o); setStatus('ok'); })
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

        {status === 'ok' && order && (
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
                <BankField label="Banco" value={BANK_INFO.bankName} />
                <BankField label="Titular" value={BANK_INFO.accountHolder} />
                <BankField label="CUIT" value={BANK_INFO.cuit} copyable />
                <BankField label="Alias" value={BANK_INFO.alias} copyable emphasize />
                <BankField label="CBU" value={BANK_INFO.cbu} copyable emphasize />
              </dl>
            </section>

            <section className="bg-cream-card/60 border border-cream-card rounded-card p-6 mb-6">
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
                  Subí el comprobante acá abajo.
                </li>
                <li>
                  Verificamos el ingreso y te enviamos el email de confirmación.
                  Suele tardar 1 día hábil.
                </li>
              </ol>
            </section>

            <ReceiptUploader
              orderReference={order.reference}
              initialReceiptUrl={order.receiptUrl}
              onUploaded={updated => setOrder(updated)}
            />

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

/**
 * Wrapped in its own component so the file input + upload state don't cause
 * the whole page to re-render on every keystroke of a picker or preview.
 */
function ReceiptUploader({ orderReference, initialReceiptUrl, onUploaded }: {
  orderReference: string;
  initialReceiptUrl: string | null;
  onUploaded: (o: Order) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [receiptUrl, setReceiptUrl] = useState<string | null>(initialReceiptUrl);
  const [justUploaded, setJustUploaded] = useState(false);

  async function handlePick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setUploading(true);
    try {
      const updated = await uploadReceipt(orderReference, file);
      setReceiptUrl(updated.receiptUrl);
      setJustUploaded(true);
      onUploaded(updated);
      // Toast auto-hides so re-uploads feel snappy.
      setTimeout(() => setJustUploaded(false), 4000);
    } catch (err) {
      const body = (err instanceof ApiRequestError) ? err.body : null;
      setError(body?.message ?? 'No se pudo subir el archivo. Intentá de nuevo.');
    } finally {
      setUploading(false);
      // Reset so the same file can be re-picked (change event only fires on change).
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  return (
    <section className="bg-white rounded-card p-6">
      <p className="text-xs tracking-[0.3em] text-muted mb-2">SUBIR COMPROBANTE</p>
      <p className="text-sm text-muted mb-4">
        Aceptamos JPG, PNG, WebP o PDF (máx 5 MB). Apenas lo subís se lo
        notificamos al equipo para que verifique tu pago.
      </p>

      {receiptUrl && !justUploaded && (
        <div className="mb-4 bg-cream-bg border border-cream-card px-4 py-3 rounded-card text-sm">
          Ya subiste un comprobante para esta orden.{' '}
          <a
            href={receiptUrl}
            target="_blank"
            rel="noreferrer"
            className="text-terracotta hover:underline"
          >
            Ver comprobante actual
          </a>
          . Podés subir otro si lo elegiste mal.
        </div>
      )}

      {justUploaded && (
        <div role="status" className="mb-4 bg-terracotta/10 border border-terracotta/40 text-terracotta px-4 py-3 rounded-card text-sm">
          Comprobante recibido. Te avisamos por email cuando verifiquemos el pago.
        </div>
      )}

      <label className="inline-flex items-center gap-3 cursor-pointer bg-brown-dark hover:bg-brown text-white px-5 py-3 text-sm tracking-wider font-semibold transition-colors">
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,application/pdf"
          onChange={handlePick}
          disabled={uploading}
          className="hidden"
        />
        {uploading ? 'SUBIENDO…' : (receiptUrl ? 'SUBIR OTRO ARCHIVO' : 'ELEGIR ARCHIVO')}
      </label>

      {error && (
        <p role="alert" className="text-terracotta text-xs mt-3">
          {error}
        </p>
      )}
    </section>
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
