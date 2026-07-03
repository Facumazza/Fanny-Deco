import { Link } from 'react-router-dom';
import { AdminLayout } from '../../components/admin/AdminLayout';

export default function DashboardPage() {
  return (
    <AdminLayout>
      <h1 className="font-display text-4xl text-ink mb-4">Bienvenido</h1>
      <p className="text-muted mb-8 max-w-xl">
        Panel de administración de ARTESA. Desde acá vas a gestionar los
        productos, categorías, órdenes y reseñas de la tienda.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link to="/admin/products"
              className="bg-white p-6 rounded-card hover:shadow-md transition-shadow">
          <p className="text-xs tracking-[0.3em] text-muted mb-2">PRODUCTOS</p>
          <p className="font-display text-2xl text-ink mb-1">Gestionar catálogo</p>
          <p className="text-sm text-muted">Crear, editar y borrar productos →</p>
        </Link>
        <PlaceholderCard title="Categorías" note="Próximamente" />
        <PlaceholderCard title="Reseñas"    note="Próximamente" />
      </div>
    </AdminLayout>
  );
}

function PlaceholderCard({ title, note }: { title: string; note: string }) {
  return (
    <article className="bg-white p-6 rounded-card opacity-60">
      <p className="text-xs tracking-[0.3em] text-muted mb-2">{title.toUpperCase()}</p>
      <p className="font-display text-2xl text-ink mb-1">{title}</p>
      <p className="text-sm text-muted">{note}</p>
    </article>
  );
}
