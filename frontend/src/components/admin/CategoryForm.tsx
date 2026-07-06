import { FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import type { CategoryUpsertRequest } from '../../types/api';
import { ImageUploadField } from './ImageUploadField';

interface Props {
  initial: CategoryUpsertRequest;
  submitLabel: string;
  onSubmit: (req: CategoryUpsertRequest) => Promise<void>;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function CategoryForm({ initial, submitLabel, onSubmit }: Props) {
  const [form, setForm] = useState<CategoryUpsertRequest>(initial);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(initial.slug !== '');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function setName(name: string) {
    setForm(f => ({
      ...f,
      name,
      slug: slugManuallyEdited ? f.slug : slugify(name),
    }));
  }

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

      <Field label="Nombre" required>
        <input
          type="text"
          required
          value={form.name}
          onChange={e => setName(e.target.value)}
          className={inputCls}
        />
      </Field>

      <Field label="Slug" required hint="Se genera automáticamente. Podés editarlo.">
        <input
          type="text"
          required
          pattern="^[a-z0-9]+(-[a-z0-9]+)*$"
          value={form.slug}
          onChange={e => { setSlugManuallyEdited(true); setForm(f => ({ ...f, slug: e.target.value })); }}
          className={inputCls}
        />
      </Field>

      <Field label="Subtítulo" hint="Frase corta que aparece debajo del nombre en la tienda">
        <input
          type="text"
          value={form.subtitle ?? ''}
          onChange={e => setForm(f => ({ ...f, subtitle: e.target.value || null }))}
          className={inputCls}
        />
      </Field>

      <ImageUploadField
        required
        value={form.imageUrl}
        onChange={url => setForm(f => ({ ...f, imageUrl: url }))}
      />

      <Field label="Orden" required hint="Menor = aparece primero en la home">
        <input
          type="number"
          required
          min="0"
          step="1"
          value={form.displayOrder}
          onChange={e => setForm(f => ({ ...f, displayOrder: Number(e.target.value) }))}
          className={inputCls + ' max-w-[8rem]'}
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
        <Link to="/admin/categories" className="text-muted hover:text-ink">Cancelar</Link>
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
