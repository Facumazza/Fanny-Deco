import { Link } from 'react-router-dom';
import { InstagramIcon, INSTAGRAM_URL } from '../icons/InstagramIcon';

interface FooterLink {
  label: string;
  to: string;
}

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[#1F1613] text-white/80">
      {/* Main grid */}
      <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-4 gap-10">
        {/* Brand column */}
        <div>
          <p className="font-display text-2xl text-white tracking-widest mb-4">FannyDeco</p>
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
              <span aria-hidden>✉</span>
              <a href="mailto:fannydecoarte@gmail.com" className="hover:text-white">fannydecoarte@gmail.com</a>
            </li>
          </ul>
        </div>

        <FooterColumn
          title="TIENDA"
          links={[
            { label: 'Carteras de Cuero',      to: '/?categoria=carteras-cuero' },
            { label: 'Carteras Otros Mat.',    to: '/?categoria=carteras-otros' },
            { label: 'Cerámica Deco',          to: '/?categoria=ceramica-deco' },
            { label: 'Cerámica Casa',          to: '/?categoria=ceramica-casa' },
          ]}
        />
        <FooterColumn
          title="INFORMACIÓN"
          links={[
            { label: 'Nosotros',          to: '/nosotros' },
            { label: 'El proceso',        to: '/el-proceso' },
            { label: 'Sustentabilidad',   to: '/sustentabilidad' },
            { label: 'Prensa',            to: '/prensa' },
          ]}
        />
        <FooterColumn
          title="AYUDA"
          links={[
            { label: 'Política de cambio y devolución', to: '/politica-de-cambio-y-devolucion' },
            { label: 'Opciones de pago',                to: '/opciones-de-pago' },
            { label: 'Método de envío',                 to: '/metodo-de-envio' },
            { label: 'Contacto',                        to: '/contacto' },
            { label: 'Preguntas frecuentes',            to: '/preguntas-frecuentes' },
          ]}
        />
      </div>

      {/* Social */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-8 text-center">
          <p className="text-xs tracking-[0.3em] text-white/60 mb-4">SEGUINOS EN REDES</p>
          <div className="flex items-center justify-center gap-8">
            {[
              { label: 'INSTAGRAM', href: INSTAGRAM_URL,
                icon: <InstagramIcon size={22} /> },
            ].map(s => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-2 hover:text-white"
              >
                <span className="w-10 h-10 border border-white/20 flex items-center justify-center">
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
          <p>© {year} FannyDeco. Todos los derechos reservados.</p>
          <p>Hecho con amor artesanal en Buenos Aires, Argentina.</p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }: { title: string; links: FooterLink[] }) {
  return (
    <div>
      <p className="text-xs tracking-[0.3em] text-white/60 mb-4">{title}</p>
      <ul className="space-y-3 text-sm">
        {links.map(link => (
          <li key={link.label}>
            <Link to={link.to} className="hover:text-white">{link.label}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
