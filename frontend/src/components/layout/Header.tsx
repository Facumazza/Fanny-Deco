import { FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';
import { InstagramIcon, INSTAGRAM_URL } from '../icons/InstagramIcon';

export function Header() {
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  // Reflect the URL's ?q= so the input stays in sync when the user hits back,
  // clears the search from the collection heading, or types a new query.
  const urlQ = searchParams.get('q') ?? '';
  const [query, setQuery] = useState(urlQ);
  useEffect(() => { setQuery(urlQ); }, [urlQ]);

  function submitSearch(e: FormEvent) {
    e.preventDefault();
    const trimmed = query.trim();
    // Empty submit clears the search and lands on the plain home.
    navigate(trimmed ? `/?q=${encodeURIComponent(trimmed)}#coleccion` : '/');
  }

  return (
    <header>
      {/* Top-bar */}
      <div className="bg-brown-dark text-white text-xs">
        <div className="max-w-7xl mx-auto px-6 py-2 flex items-center justify-between">
          <nav className="flex items-center gap-6">
            <Link to="/politica-de-cambio-y-devolucion" className="hover:opacity-80">Política de cambio y devolución</Link>
            <Link to="/opciones-de-pago" className="hover:opacity-80">Opciones de pago</Link>
            <Link to="/metodo-de-envio" className="hover:opacity-80">Método de envío</Link>
            <Link to="/contacto" className="hover:opacity-80">Contacto</Link>
          </nav>
          <div className="flex items-center gap-3 text-lg" aria-label="Redes sociales">
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram — @fanny.deco"
              className="inline-flex items-center hover:opacity-80"
            >
              <InstagramIcon size={18} />
            </a>
          </div>
        </div>
      </div>

      {/* Nav */}
      <div className="bg-cream-bg">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <Link to="/" className="flex flex-col leading-none" aria-label="FannyDeco — inicio">
            <img
              src="/logo-fanny.png"
              alt="FannyDeco"
              className="h-12 w-auto object-contain"
            />
            <span className="font-sans text-[10px] tracking-[0.3em] text-muted mt-1">CUERO &amp; CERÁMICA</span>
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm text-ink">
            <Link to="/#coleccion" className="hover:text-terracotta">Colecciones</Link>
            <Link to="/?categoria=carteras-cuero" className="hover:text-terracotta">Cuero</Link>
            <Link to="/?categoria=ceramica-deco" className="hover:text-terracotta">Cerámica</Link>
            <Link to="/nosotros" className="hover:text-terracotta">Nosotros</Link>
          </nav>
          <form
            role="search"
            onSubmit={submitSearch}
            className="hidden md:flex items-center bg-white border border-cream-card focus-within:border-brown-dark transition-colors"
          >
            <input
              type="search"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Buscar productos…"
              aria-label="Buscar productos"
              className="px-3 py-2 w-40 lg:w-56 text-sm focus:outline-none bg-transparent"
            />
            <button
              type="submit"
              aria-label="Buscar"
              className="px-3 py-2 text-muted hover:text-terracotta"
            >
              🔍
            </button>
          </form>
          <Link
            to="/carrito"
            aria-label={`Carrito (${itemCount} ${itemCount === 1 ? 'ítem' : 'ítems'})`}
            className="relative text-2xl hover:text-terracotta transition-colors"
          >
            🛍
            {itemCount > 0 && (
              <span
                data-cart-count
                className="absolute -top-1 -right-2 bg-terracotta text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] px-1 flex items-center justify-center"
              >
                {itemCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
