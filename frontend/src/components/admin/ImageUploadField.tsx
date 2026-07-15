import { useRef, useState } from 'react';
import { uploadImage } from '../../api/uploads';
import { ApiRequestError } from '../../types/api';

interface Props {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  required?: boolean;
}

/**
 * A dual-mode image input: either paste a URL or upload a file. On successful
 * upload the returned URL is written back into the parent form via onChange.
 * We keep the URL text field visible because seed data uses Unsplash URLs and
 * the admin may want to reuse them without uploading.
 */
export function ImageUploadField({ value, onChange, label = 'URL de imagen', required }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handlePick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setUploading(true);
    try {
      const res = await uploadImage(file);
      onChange(res.url);
    } catch (err) {
      if (err instanceof ApiRequestError && err.body?.message) {
        setError(err.body.message);
      } else {
        setError('No se pudo subir la imagen.');
      }
    } finally {
      setUploading(false);
      // Reset the input so the same file can be picked twice in a row if needed.
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  return (
    <div>
      <label className="block">
        <span className="block text-xs tracking-wider text-muted mb-1">
          {label.toUpperCase()}{required && <span className="text-terracotta"> *</span>}
        </span>
        <input
          // Not type="url": the backend returns relative paths like "/uploads/xxx.jpg"
          // after upload, which browsers reject as invalid URLs and block the submit.
          type="text"
          required={required}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="https://... o subí un archivo abajo"
          className="w-full border border-cream-card px-3 py-2 focus:outline-none focus:border-brown-dark bg-white"
        />
      </label>

      <div className="mt-2 flex items-center gap-3 flex-wrap">
        <label className="inline-flex items-center gap-2 text-sm cursor-pointer bg-cream-card hover:bg-brown-dark hover:text-white px-3 py-2 transition-colors">
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handlePick}
            disabled={uploading}
            className="hidden"
          />
          {uploading ? 'Subiendo…' : '📎 Subir archivo (JPG, PNG, WebP, GIF, máx 5MB)'}
        </label>

        {value && (
          <img
            src={value}
            alt="Vista previa"
            className="w-16 h-16 object-cover rounded-sm border border-cream-card bg-cream-card"
          />
        )}
      </div>

      {error && (
        <p role="alert" className="text-terracotta text-xs mt-2">{error}</p>
      )}
    </div>
  );
}
