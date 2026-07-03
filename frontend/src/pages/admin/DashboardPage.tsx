import { useAuth } from '../../hooks/useAuth';

export default function DashboardPage() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-cream-bg">
      {/* Top bar */}
      <header className="bg-brown-dark text-white">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <p className="font-display text-xl tracking-widest">ARTESA</p>
            <p className="text-[10px] tracking-[0.3em] opacity-70">PANEL ADMIN</p>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span className="opacity-80">{user?.email}</span>
            <button
              onClick={() => { void logout(); }}
              className="border border-white/40 px-4 py-1.5 hover:bg-white hover:text-brown-dark transition-colors"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>

      {/* Content placeholder */}
      <main className="max-w-6xl mx-auto px-6 py-16">
        <h1 className="font-display text-4xl text-ink mb-4">Bienvenido</h1>
        <p className="text-muted mb-8 max-w-xl">
          Estás en el panel de administración de ARTESA. El CRUD completo de
          productos, categorías y reseñas se implementa en la Fase 5. Por ahora
          esta pantalla confirma que la autenticación funciona.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <PlaceholderCard title="Productos"   count={12} note="12 productos activos" />
          <PlaceholderCard title="Categorías"  count={4}  note="4 categorías" />
          <PlaceholderCard title="Reseñas"     count={6}  note="6 reseñas" />
        </div>
      </main>
    </div>
  );
}

function PlaceholderCard({ title, count, note }: {
  title: string; count: number; note: string;
}) {
  return (
    <article className="bg-white p-6 rounded-card">
      <p className="text-xs tracking-[0.3em] text-muted mb-2">{title.toUpperCase()}</p>
      <p className="font-display text-4xl text-ink mb-1">{count}</p>
      <p className="text-sm text-muted">{note}</p>
    </article>
  );
}
