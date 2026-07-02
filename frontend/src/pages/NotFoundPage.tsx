import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <main className="max-w-md mx-auto text-center py-24 px-6">
      <h1 className="font-display text-4xl mb-3">404</h1>
      <p className="text-muted mb-6">La página que buscás no existe.</p>
      <Link to="/" className="text-terracotta hover:underline">Volver al inicio</Link>
    </main>
  );
}
