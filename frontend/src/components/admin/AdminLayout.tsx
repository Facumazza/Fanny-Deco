import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

interface Props {
  children: ReactNode;
}

const NAV = [
  { to: '/admin',            label: 'Inicio' },
  { to: '/admin/products',   label: 'Productos' },
  { to: '/admin/categories', label: 'Categorías' },
  { to: '/admin/orders',     label: 'Órdenes' },
];

export function AdminLayout({ children }: Props) {
  const { user, logout } = useAuth();
  const { pathname } = useLocation();

  return (
    <div className="min-h-screen bg-cream-bg">
      <header className="bg-brown-dark text-white">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/admin" className="flex flex-col leading-none" aria-label="FannyDeco — panel admin">
            {/* Admin bar is dark so the black-ink signature would disappear;
                invert to white with a CSS filter so the same asset works. */}
            <img
              src="/logo-fanny.png"
              alt="FannyDeco"
              className="h-8 w-auto object-contain invert brightness-0"
            />
            <span className="text-[10px] tracking-[0.3em] opacity-70">PANEL ADMIN</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm">
            {NAV.map(item => {
              const active = pathname === item.to
                || (item.to !== '/admin' && pathname.startsWith(item.to));
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={
                    'transition-colors ' +
                    (active ? 'text-white font-semibold' : 'text-white/70 hover:text-white')
                  }
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="flex items-center gap-4 text-sm">
            <span className="opacity-80 hidden sm:inline">{user?.email}</span>
            <button
              onClick={() => { void logout(); }}
              className="border border-white/40 px-4 py-1.5 hover:bg-white hover:text-brown-dark transition-colors"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10">
        {children}
      </main>
    </div>
  );
}
