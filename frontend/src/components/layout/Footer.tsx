export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[#1F1613] text-white/80">
      {/* Main grid */}
      <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-4 gap-10">
        {/* Brand column */}
        <div>
          <p className="font-display text-2xl text-white tracking-widest mb-4">ARTESA</p>
          <p className="text-sm mb-6">
            Taller propio en Buenos Aires.<br />
            Envíos a toda Latinoamérica.
          </p>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <span aria-hidden>📍</span> Av. Corrientes 1234, CABA
            </li>
            <li className="flex items-center gap-2">
              <span aria-hidden>📞</span> +54 11 1234 5678
            </li>
            <li className="flex items-center gap-2">
              <span aria-hidden>✉</span> hola@artesa.com
            </li>
          </ul>
        </div>

        <FooterColumn
          title="TIENDA"
          links={['Carteras de Cuero', 'Carteras Otros Mat.', 'Cerámica Deco', 'Cerámica Casa']}
        />
        <FooterColumn
          title="INFORMACIÓN"
          links={['Nosotros', 'El proceso', 'Sustentabilidad', 'Prensa']}
        />
        <FooterColumn
          title="AYUDA"
          links={[
            'Política de cambio y devolución',
            'Opciones de pago',
            'Método de envío',
            'Contacto',
            'Preguntas frecuentes',
          ]}
        />
      </div>

      {/* Social */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-8 text-center">
          <p className="text-xs tracking-[0.3em] text-white/60 mb-4">SEGUINOS EN REDES</p>
          <div className="flex items-center justify-center gap-8">
            {[
              { label: 'INSTAGRAM', icon: '◎' },
              { label: 'FACEBOOK',  icon: 'f' },
              { label: 'TWITTER / X', icon: '𝕏' },
              { label: 'YOUTUBE',   icon: '▶' },
              { label: 'WHATSAPP',  icon: '💬' },
            ].map(s => (
              <a key={s.label} href="#" className="flex flex-col items-center gap-2 hover:text-white">
                <span className="w-10 h-10 border border-white/20 flex items-center justify-center text-lg">
                  {s.icon}
                </span>
                <span className="text-[10px] tracking-widest">{s.label}</span>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row items-center justify-between text-xs text-white/50">
          <p>© {year} Artesa. Todos los derechos reservados.</p>
          <p>Hecho con amor artesanal en Buenos Aires, Argentina.</p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }: { title: string; links: string[] }) {
  return (
    <div>
      <p className="text-xs tracking-[0.3em] text-white/60 mb-4">{title}</p>
      <ul className="space-y-3 text-sm">
        {links.map(link => (
          <li key={link}>
            <a href="#" className="hover:text-white">{link}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}
