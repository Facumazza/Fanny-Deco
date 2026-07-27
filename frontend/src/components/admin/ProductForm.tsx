import { FormEvent, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Category, ProductUpsertRequest } from '../../types/api';
import { getCategories } from '../../api/catalog';
import { ImageUploadField } from './ImageUploadField';
import { ImageListUploadField } from './ImageListUploadField';

interface Props {
  initial: ProductUpsertRequest;
  submitLabel: string;
  onSubmit: (req: ProductUpsertRequest) => Promise<void>;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')  // strip diacritics
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function ProductForm({ initial, submitLabel, onSubmit }: Props) {
  const [form, setForm] = useState<ProductUpsertRequest>(initial);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(initial.slug !== '');
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getCategories().then(setCategories).catch(console.error);
  }, []);

  function setName(name: string) {
    setForm(f => ({
      ...f,
      name,
      slug: slugManuallyEdited ? f.slug : slugify(name),
    }));
  }

  function setSlug(slug: string) {
    setSlugManuallyEdited(true);
    setForm(f => ({ ...f, slug }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await onSubmit(form);
    } catch (err) {
      setError(extractError(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
      {error && (
        <div role="alert" className="bg-terracotta/10 border border-terracotta/40 text-terracotta px-4 py-3 rounded-card text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Field label="Nombre" required>
          <input
            type="text"
            required
            value={form.name}
            onChange={e => setName(e.target.value)}
            className={inputCls}
          />
        </Field>

        <Field label="Slug" hint="Se genera automáticamente. Podés editarlo.">
          <input
            type="text"
            required
            pattern="^[a-z0-9]+(-[a-z0-9]+)*$"
            value={form.slug}
            onChange={e => setSlug(e.target.value)}
            className={inputCls}
          />
        </Field>

        <Field label="Categoría" required>
          <select
            required
            value={form.categoryId || ''}
            onChange={e => setForm(f => ({ ...f, categoryId: Number(e.target.value) }))}
            className={inputCls}
          >
            <option value="">— Elegí una —</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </Field>

        <Field label="Precio (ARS)" required>
          <input
            type="number"
            required
            min="0"
            step="0.01"
            value={form.priceArs}
            onChange={e => setForm(f => ({ ...f, priceArs: Number(e.target.value) }))}
            className={inputCls}
          />
        </Field>

        <div>
          <ImageUploadField
            required
            label="Imagen principal"
            value={form.imageUrl}
            onChange={url => setForm(f => ({ ...f, imageUrl: url }))}
          />
        </div>

      </div>

      <ImageListUploadField
        values={form.additionalImages}
        onChange={urls => setForm(f => ({ ...f, additionalImages: urls }))}
        hint="Se muestran en la galería de la ficha del producto. La principal (arriba) es la que aparece en las cards del catálogo y en emails."
      />

      <Field label="Descripción">
        <textarea
          rows={4}
          value={form.description ?? ''}
          onChange={e => setForm(f => ({ ...f, description: e.target.value || null }))}
          className={inputCls + ' resize-y'}
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
        <Link
          to="/admin/products"
          className="text-muted hover:text-ink"
        >
          Cancelar
        </Link>
      </div>
    </form>
  );
}

// ---- Presentational helpers ----

const inputCls =
  'w-full border border-cream-card px-3 py-2 focus:outline-none focus:border-brown-dark bg-white';

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

function extractError(err: unknown): string {
  if (err && typeof err === 'object') {
    const body = (err as { body?: { code?: string; message?: string } }).body;
    if (body?.message) return body.message;
    if (body?.code) return body.code;
  }
  return 'No se pudo guardar. Verificá los datos e intentá de nuevo.';
}
