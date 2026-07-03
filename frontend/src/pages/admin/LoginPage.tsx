import { FormEvent, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { ApiRequestError } from '../../types/api';

export default function LoginPage() {
  const { status, login } = useAuth();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } } | null)?.from?.pathname ?? '/admin';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (status === 'authenticated') {
    return <Navigate to={from} replace />;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email, password);
      // The redirect happens on next render via the status change above.
    } catch (err) {
      if (err instanceof ApiRequestError && err.status === 401) {
        setError('Email o contraseña inválidos.');
      } else {
        setError('Algo salió mal. Intentá de nuevo.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-cream-bg flex items-center justify-center px-6">
      <div className="w-full max-w-sm bg-white p-8 rounded-card shadow-sm">
        <div className="text-center mb-8">
          <p className="font-display text-2xl tracking-widest text-ink">ARTESA</p>
          <p className="text-xs tracking-[0.3em] text-muted mt-1">PANEL ADMIN</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs tracking-wider text-muted mb-1">EMAIL</label>
            <input
              type="email"
              required
              autoFocus
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full border border-cream-card px-3 py-2 focus:outline-none focus:border-brown-dark"
            />
          </div>
          <div>
            <label className="block text-xs tracking-wider text-muted mb-1">CONTRASEÑA</label>
            <input
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full border border-cream-card px-3 py-2 focus:outline-none focus:border-brown-dark"
            />
          </div>

          {error && (
            <p role="alert" className="text-sm text-terracotta">{error}</p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-brown-dark hover:bg-brown text-white py-3 text-sm tracking-wider font-semibold disabled:opacity-60"
          >
            {submitting ? 'INGRESANDO…' : 'INGRESAR'}
          </button>
        </form>
      </div>
    </main>
  );
}
