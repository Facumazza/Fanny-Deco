import { FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import type { ReviewUpsertRequest } from '../../types/api';

interface Props {
  initial: ReviewUpsertRequest;
  submitLabel: string;
  onSubmit: (req: ReviewUpsertRequest) => Promise<void>;
}

const RATINGS = [1, 2, 3, 4, 5];

export function ReviewForm({ initial, submitLabel, onSubmit }: Props) {
  const [form, setForm] = useState<ReviewUpsertRequest>(initial);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await onSubmit(form);
    } catch (err) {
      const body = (err as { body?: { message?: string; code?: string } }).body;
      setError(body?.message ?? body?.code ?? 'No se pudo guardar.');
    } finally {
      setSubmitting(false);
    }
  }

  const inputCls =
    'w-full border border-cream-card px-3 py-2 focus:outline-none focus:border-brown-dark bg-white';

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      {error && (
        <div role="alert" className="bg-terracotta/10 border border-terracotta/40 text-terracotta px-4 py-3 rounded-card text-sm">
          {error}
        </div>
      )}

      <Field label="Autor" required>
        <input
          type="text"
          required
          maxLength={120}
          value={form.authorName}
          onChange={e => setForm(f => ({ ...f, authorName: e.target.value }))}
          className={inputCls}
        />
      </Field>

      <Field label="Puntaje" required>
        <div className="flex gap-2">
          {RATINGS.map(n => (
            <button
              key={n}
              type="button"
              onClick={() => setForm(f => ({ ...f, rating: n }))}
              className={
                'px-4 py-2 border text-sm font-semibold transition-colors ' +
                (form.rating === n
                  ? 'bg-brown-dark text-white border-brown-dark'
                  : 'bg-white text-ink border-cream-card hover:border-brown-dark')
              }
              aria-pressed={form.rating === n}
            >
              {n} ★
            </button>
          ))}
        </div>
      </Field>

      <Field label="Testimonio" required hint="Texto que aparece en la sección de reseñas del sitio.">
        <textarea
          required
          maxLength={2000}
          rows={5}
          value={form.body}
          onChange={e => setForm(f => ({ ...f, body: e.target.value }))}
          className={inputCls + ' resize-y'}
        />
      </Field>

      <Field label="Ubicación" hint="Ciudad y país (ej: 'Buenos Aires').">
        <input
          type="text"
          maxLength={120}
          value={form.location ?? ''}
          onChange={e => setForm(f => ({ ...f, location: e.target.value || null }))}
          className={inputCls}
        />
      </Field>

      <Field label="Producto" hint="Nombre del producto reseñado (ej: 'CARTERA MINERVA').">
        <input
          type="text"
          maxLength={200}
          value={form.productName ?? ''}
          onChange={e => setForm(f => ({ ...f, productName: e.target.value || null }))}
          className={inputCls}
        />
      </Field>

      <div className="flex items-center gap-3 pt-4">
        <button
          type="submit"
          disabled={submitting}
          className="bg-brown-dark hover:bg-brown text-white px-6 py-3 text-sm tracking-wider font-semibold disabled:opacity-60"
        >
          {submitting ? 'GUARDANDO…' : submitLabel.toUpperCase()}
        </button>
        <Link to="/admin/reviews" className="text-muted hover:text-ink">Cancelar</Link>
      </div>
    </form>
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
