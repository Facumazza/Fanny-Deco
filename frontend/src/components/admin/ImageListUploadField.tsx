import { useRef, useState } from 'react';
import { uploadImage } from '../../api/uploads';
import { ApiRequestError } from '../../types/api';

interface Props {
  values: string[];
  onChange: (urls: string[]) => void;
  label?: string;
  hint?: string;
}

/**
 * Multi-image variant of ImageUploadField. Kept as its own component instead of
 * bolting a 'multiple' flag onto the single-image one because the concerns are
 * different: this one manages an ordered list, supports reorder + remove, and
 * shows a strip of thumbnails; the single-image version just cares about one
 * URL string.
 *
 * Usage in ProductForm for the extra gallery images. The primary image stays
 * in ImageUploadField because it's required and cards / order emails always
 * reference it — separating them keeps the form field types simple.
 */
export function ImageListUploadField({
  values,
  onChange,
  label = 'Imágenes adicionales',
  hint,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handlePick(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    setError(null);
    setUploading(true);
    try {
      // Sequential upload keeps error handling simple: if one fails we still
      // keep the ones that already went up. Also avoids R2 rate-limiting on
      // bursts (a real customer picking 10 files at once).
      const uploaded: string[] = [];
      for (const file of files) {
        const res = await uploadImage(file);
        uploaded.push(res.url);
      }
      onChange([...values, ...uploaded]);
    } catch (err) {
      const msg = err instanceof ApiRequestError && err.body?.message
        ? err.body.message
        : 'No se pudo subir una de las imágenes.';
      setError(msg);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  function removeAt(index: number) {
    onChange(values.filter((_, i) => i !== index));
  }

  function move(index: number, dir: -1 | 1) {
    const next = [...values];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }

  return (
    <div>
      <p className="block text-xs tracking-wider text-muted mb-1">
        {label.toUpperCase()}
      </p>
      {hint && <p className="text-xs text-muted mb-2">{hint}</p>}

      <label className="inline-flex items-center gap-2 text-sm cursor-pointer bg-cream-card hover:bg-brown-dark hover:text-white px-3 py-2 transition-colors mb-3">
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={handlePick}
          disabled={uploading}
          className="hidden"
        />
        {uploading ? 'Subiendo…' : '📎 Agregar imágenes (podés seleccionar varias)'}
      </label>

      {error && (
        <p role="alert" className="text-terracotta text-xs mb-2">{error}</p>
      )}

      {values.length > 0 ? (
        <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {values.map((url, i) => (
            <li
              key={`${url}-${i}`}
              className="relative group border border-cream-card rounded-sm overflow-hidden bg-cream-card"
            >
              <img
                src={url}
                alt={`Adicional ${i + 1}`}
                className="w-full h-28 object-cover"
              />
              {/* Reorder + delete overlay — always visible on touch, on hover for desktop */}
              <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/40 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                <button
                  type="button"
                  onClick={() => move(i, -1)}
                  disabled={i === 0}
                  aria-label="Mover hacia atrás"
                  className="bg-white text-ink w-8 h-8 flex items-center justify-center disabled:opacity-30"
                >
                  ←
                </button>
                <button
                  type="button"
                  onClick={() => move(i, 1)}
                  disabled={i === values.length - 1}
                  aria-label="Mover hacia adelante"
                  className="bg-white text-ink w-8 h-8 flex items-center justify-center disabled:opacity-30"
                >
                  →
                </button>
                <button
                  type="button"
                  onClick={() => removeAt(i)}
                  aria-label="Quitar imagen"
                  className="bg-terracotta text-white w-8 h-8 flex items-center justify-center"
                >
                  ×
                </button>
              </div>
              <span className="absolute top-1 left-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded">
                {i + 1}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-xs text-muted italic">Todavía no agregaste imágenes adicionales.</p>
      )}
    </div>
  );
}
