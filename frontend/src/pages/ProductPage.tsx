import { useParams } from 'react-router-dom';

export default function ProductPage() {
  const { slug } = useParams<{ slug: string }>();
  return (
    <main className="max-w-3xl mx-auto px-6 py-16">
      <h1 className="font-display text-3xl">Detalle de producto</h1>
      <p className="mt-4 text-muted">
        Placeholder Fase 1 — se implementa en Fase 2. Slug solicitado:{' '}
        <code className="bg-cream-card px-2 py-1 rounded">{slug}</code>
      </p>
    </main>
  );
}
