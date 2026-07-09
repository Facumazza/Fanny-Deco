import { FormEvent, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Category, ProductBadge, ProductUpsertRequest } from '../../types/api';
import { getCategories } from '../../api/catalog';
import { ImageUploadField } from './ImageUploadField';

const BADGES: { value: ProductBadge; label: string }[] = [
  { value: 'MAS_VENDIDO',      label: 'Más vendido' },
  { value: 'NUEVO',            label: 'Nuevo' },
  { value: 'ARTESANAL',        label: 'Artesanal' },
  { value: 'EDICION_LIMITADA', label: 'Edición limitada' },
  { value: 'SET_X3',           label: 'Set x3' },
  { value: 'VERANO',           label: 'Verano' },
];

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
  const [colorsText, setColorsText] = useState(initial.colors.join(', '));
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

    // Parse colors from text.
    const colors = colorsText
      .split(/[,\n]/)
      .map(s => s.trim())
      .filter(s => s.length > 0);
    // Basic client-side hex format check to catch typos early.
    const bad = colors.find(c => !/^#[0-9A-Fa-f]{6}$/.test(c));
    if (bad) {
      setError(`Color inválido: "${bad}". Usá el formato #AABBCC.`);
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({ ...form, colors });
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

        <Field label="Badge">
          <select
            value={form.badge ?? ''}
            onChange={e => setForm(f => ({
              ...f,
              badge: (e.target.value || null) as ProductBadge | null,
            }))}
            className={inputCls}
          >
            <option value="">Ninguno</option>
            {BADGES.map(b => (
              <option key={b.value} value={b.value}>{b.label}</option>
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
            value={form.imageUrl}
            onChange={url => setForm(f => ({ ...f, imageUrl: url }))}
          />
        </div>

        <Field label="Rating promedio" hint="0.0 a 5.0" required>
          <input
            type="number"
            required
            min="0"
            max="5"
            step="0.1"
            value={form.ratingAvg}
            onChange={e => setForm(f => ({ ...f, ratingAvg: Number(e.target.value) }))}
            className={inputCls}
          />
        </Field>

        <Field label="Cantidad de reseñas" required>
          <input
            type="number"
            required
            min="0"
            step="1"
            value={form.ratingCount}
            onChange={e => setForm(f => ({ ...f, ratingCount: Number(e.target.value) }))}
            className={inputCls}
          />
        </Field>
      </div>

      <Field label="Descripción">
        <textarea
          rows={4}
          value={form.description ?? ''}
          onChange={e => setForm(f => ({ ...f, description: e.target.value || null }))}
          className={inputCls + ' resize-y'}
        />
      </Field>

      <Field label="Colores" hint="Hex codes separados por coma o salto de línea (ej: #6B4029, #2B2A28)">
        <textarea
          rows={2}
          value={colorsText}
          onChange={e => setColorsText(e.target.value)}
          className={inputCls + ' resize-y font-mono text-sm'}
        />
        {form.imageUrl && (
          <div className="mt-3 flex gap-2 items-center flex-wrap">
            {colorsText
              .split(/[,\n]/)
              .map(s => s.trim())
              .filter(s => /^#[0-9A-Fa-f]{6}$/.test(s))
              .map((hex, i) => (
                <span
                  key={i}
                  style={{ backgroundColor: hex }}
                  title={hex}
                  className="w-6 h-6 rounded-sm border border-black/10"
                />
              ))}
          </div>
        )}
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
