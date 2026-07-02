export function Footer() {
  return (
    <footer className="bg-brown-dark text-white/80 text-sm mt-16">
      <div className="max-w-7xl mx-auto px-6 py-8 flex items-center justify-between">
        <p>© {new Date().getFullYear()} ARTESA — Cuero &amp; Cerámica.</p>
        <p className="opacity-60">Hecho a mano, para durar.</p>
      </div>
    </footer>
  );
}
