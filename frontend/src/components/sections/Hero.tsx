export function Hero() {
  return (
    <section className="bg-cream-bg overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 py-12 lg:py-16 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Left column: copy */}
        <div className="max-w-lg">
          <p className="text-terracotta text-xs tracking-[0.3em] mb-6">COLECCIÓN VERANO 2025</p>
          <h1 className="font-display text-6xl lg:text-7xl leading-[1.05] text-ink mb-8">
            Hecho a mano,<br />
            <span className="italic">para durar.</span>
          </h1>
          <p className="text-muted text-lg leading-relaxed mb-10 max-w-md">
            Bolsos de cuero curtido al vegetal y cerámica artesanal. Cada pieza
            nace de manos expertas y materiales seleccionados.
          </p>
          <div className="flex items-center gap-6">
            <a
              href="#coleccion"
              className="inline-flex items-center gap-3 bg-brown-dark hover:bg-brown text-white px-6 py-4 text-sm tracking-wider font-semibold"
            >
              VER COLECCIÓN <span aria-hidden>→</span>
            </a>
            <a href="#" className="text-ink underline underline-offset-4 hover:no-underline">
              Sobre nosotros
            </a>
          </div>
        </div>

        {/* Right column: featured product image with floating card */}
        <div className="relative">
          <div className="aspect-square overflow-hidden rounded-sm">
            <img
              src="https://pub-7896d0aa228b4afab2513f70f3375892.r2.dev/13926e33-da31-44c2-bca7-4e0f936d2d40.jpg"
              alt="Bolso destacado FannyDeco"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute bottom-6 left-6 bg-white px-6 py-4 shadow-lg">
            <p className="text-[10px] tracking-[0.25em] text-muted mb-1">CUERO ITALIANO</p>
            <p className="font-display text-2xl text-ink">Cuero de primera</p>
          </div>
        </div>
      </div>
    </section>
  );
}
