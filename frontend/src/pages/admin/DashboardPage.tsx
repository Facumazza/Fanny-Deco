import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { getAdminStats } from '../../api/admin';
import type { AdminStats, OrderStatus } from '../../types/api';
import { formatArs } from '../../lib/price';

type Status = 'loading' | 'ok' | 'error';

const STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING:   'Pendientes',
  PAID:      'Pagadas',
  SHIPPED:   'Enviadas',
  DELIVERED: 'Entregadas',
  CANCELLED: 'Canceladas',
};

const STATUS_LINK: Record<OrderStatus, string> = {
  PENDING:   '/admin/orders?status=PENDING',
  PAID:      '/admin/orders?status=PAID',
  SHIPPED:   '/admin/orders?status=SHIPPED',
  DELIVERED: '/admin/orders?status=DELIVERED',
  CANCELLED: '/admin/orders?status=CANCELLED',
};

export default function DashboardPage() {
  const [status, setStatus] = useState<Status>('loading');
  const [stats, setStats] = useState<AdminStats | null>(null);

  useEffect(() => {
    getAdminStats()
      .then(s => { setStats(s); setStatus('ok'); })
      .catch(err => { console.error(err); setStatus('error'); });
  }, []);

  return (
    <AdminLayout>
      <h1 className="font-display text-4xl text-ink mb-2">Panel</h1>
      <p className="text-muted mb-8">Resumen de tu tienda al día de hoy.</p>

      {status === 'loading' && (
        <p className="text-muted py-12 text-center">Cargando estadísticas…</p>
      )}

      {status === 'error' && (
        <p className="text-terracotta py-12 text-center">
          No pudimos cargar las estadísticas.
        </p>
      )}

      {status === 'ok' && stats && (
        <>
          {/* Revenue tiles */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
            <RevenueTile
              label="Facturación de hoy"
              amount={stats.today.revenueArs}
              secondary={`${stats.today.orderCount} orden${stats.today.orderCount === 1 ? '' : 'es'}`}
            />
            <RevenueTile
              label="Últimos 7 días"
              amount={stats.last7Days.revenueArs}
              secondary={`${stats.last7Days.orderCount} orden${stats.last7Days.orderCount === 1 ? '' : 'es'}`}
            />
            <RevenueTile
              label="Este mes"
              amount={stats.thisMonth.revenueArs}
              secondary={`${stats.thisMonth.orderCount} orden${stats.thisMonth.orderCount === 1 ? '' : 'es'}`}
            />
          </section>

          {/* Status counts */}
          <section className="mb-10">
            <p className="text-xs tracking-[0.3em] text-muted mb-3">ÓRDENES POR ESTADO</p>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {(Object.keys(STATUS_LABEL) as OrderStatus[]).map(s => (
                <Link
                  key={s}
                  to={STATUS_LINK[s]}
                  className="bg-white p-4 rounded-card hover:shadow-md transition-shadow"
                >
                  <p className="text-xs tracking-wider text-muted">{STATUS_LABEL[s].toUpperCase()}</p>
                  <p className="font-display text-3xl text-ink mt-1">
                    {stats.orderCountsByStatus[s] ?? 0}
                  </p>
                </Link>
              ))}
            </div>
          </section>

          {/* Top products */}
          <section className="mb-10">
            <p className="text-xs tracking-[0.3em] text-muted mb-3">TOP 5 PRODUCTOS (últimos 30 días)</p>
            {stats.topProducts.length === 0 ? (
              <div className="bg-white p-6 rounded-card text-muted text-center">
                Todavía no hay ventas en los últimos 30 días.
              </div>
            ) : (
              <div className="bg-white rounded-card overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-cream-card text-muted text-xs tracking-wider">
                    <tr>
                      <th className="text-left px-4 py-3 w-8">#</th>
                      <th className="text-left px-4 py-3">PRODUCTO</th>
                      <th className="text-right px-4 py-3">UNIDADES</th>
                      <th className="text-right px-4 py-3">FACTURACIÓN</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.topProducts.map((p, i) => (
                      <tr key={p.productId} className="border-t border-cream-card">
                        <td className="px-4 py-3 text-muted">{i + 1}</td>
                        <td className="px-4 py-3">
                          <Link
                            to={`/producto/${p.slug}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-ink hover:text-terracotta"
                          >
                            {p.name}
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-right font-medium text-ink">
                          {p.unitsSold}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-terracotta">
                          {formatArs(p.revenueArs)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* Quick links */}
          <section>
            <p className="text-xs tracking-[0.3em] text-muted mb-3">GESTIONAR</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <QuickLink to="/admin/products"   title="Productos"   note="Crear, editar, borrar del catálogo" />
              <QuickLink to="/admin/categories" title="Categorías"  note="Organizar la estructura de la tienda" />
              <QuickLink to="/admin/orders"     title="Órdenes"     note="Ver ventas y cambiar su estado" />
            </div>
          </section>
        </>
      )}
    </AdminLayout>
  );
}

function RevenueTile({ label, amount, secondary }: {
  label: string; amount: number; secondary: string;
}) {
  return (
    <article className="bg-white p-6 rounded-card">
      <p className="text-xs tracking-[0.3em] text-muted mb-3">{label.toUpperCase()}</p>
      <p className="font-display text-3xl md:text-4xl text-ink mb-1">{formatArs(amount)}</p>
      <p className="text-sm text-muted">{secondary}</p>
    </article>
  );
}

function QuickLink({ to, title, note }: { to: string; title: string; note: string }) {
  return (
    <Link to={to} className="bg-white p-6 rounded-card hover:shadow-md transition-shadow">
      <p className="text-xs tracking-[0.3em] text-muted mb-2">{title.toUpperCase()}</p>
      <p className="font-display text-xl text-ink mb-1">{title}</p>
      <p className="text-sm text-muted">{note} →</p>
    </Link>
  );
}
