export function Header() {
  return (
    <header>
      {/* Top-bar */}
      <div className="bg-brown-dark text-white text-xs">
        <div className="max-w-7xl mx-auto px-6 py-2 flex items-center justify-between">
          <nav className="flex items-center gap-6">
            <a href="#" className="hover:opacity-80">Política de cambio y devolución</a>
            <a href="#" className="hover:opacity-80">Opciones de pago</a>
            <a href="#" className="hover:opacity-80">Método de envío</a>
            <a href="#" className="hover:opacity-80">Contacto</a>
          </nav>
          <div className="flex items-center gap-3 text-lg" aria-label="Redes sociales">
            <a href="#" aria-label="Instagram">◎</a>
            <a href="#" aria-label="Facebook">f</a>
            <a href="#" aria-label="Twitter">𝕏</a>
            <a href="#" aria-label="YouTube">▶</a>
            <a href="#" aria-label="Chat">💬</a>
          </div>
        </div>
      </div>

      {/* Nav */}
      <div className="bg-cream-bg">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <a href="/" className="flex flex-col leading-none">
            <span className="font-display text-3xl tracking-widest text-ink">ARTESA</span>
            <span className="font-sans text-[10px] tracking-[0.3em] text-muted mt-1">CUERO &amp; CERÁMICA</span>
          </a>
          <nav className="flex items-center gap-10 text-sm text-ink">
            <a href="#" className="hover:text-terracotta">Colecciones</a>
            <a href="#" className="hover:text-terracotta">Cuero</a>
            <a href="#" className="hover:text-terracotta">Cerámica</a>
            <a href="#" className="hover:text-terracotta">Nosotros</a>
          </nav>
          <button aria-label="Carrito" className="text-2xl cursor-default">🛍</button>
        </div>
      </div>
    </header>
  );
}
