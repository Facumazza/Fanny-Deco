export function ProcessSection() {
  return (
    <section className="bg-[#EFE7D8] py-20">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Overlapping images */}
        <div className="relative h-[500px]">
          <img
            src="https://pub-7896d0aa228b4afab2513f70f3375892.r2.dev/691473ba-0990-4799-a220-6a35b1372ab1.jpg"
            alt="Piezas de cerámica en proceso en el taller"
            loading="lazy"
            className="absolute top-0 left-0 w-[55%] h-[65%] object-cover rounded-sm shadow-lg"
          />
          <img
            src="https://pub-7896d0aa228b4afab2513f70f3375892.r2.dev/ea192507-a05e-4d5c-9dab-2af6f569df16.jpg"
            alt="Costura de cuero a máquina en el taller"
            loading="lazy"
            className="absolute bottom-0 right-0 w-[50%] h-[45%] object-cover rounded-sm shadow-lg"
          />
        </div>

        {/* Text content */}
        <div>
          <p className="text-terracotta text-xs tracking-[0.3em] mb-4">EL PROCESO</p>
          <h2 className="font-display text-5xl leading-tight text-ink mb-8">
            Artesanía que se puede ver, tocar y sentir
          </h2>
          <p className="text-muted leading-relaxed mb-8 max-w-lg">
            Cada bolso se cose a mano con hilo de lino encerado. Cada pieza de
            cerámica se torna, se glasea y se hornea en nuestro taller. Sin
            producción en masa. Sin atajos.
          </p>
          <ul className="space-y-4 mb-8">
            {[
              'Cuero full-grain curtido al vegetal, de origen trazado',
              'Materiales alternativos seleccionados de productores locales',
              'Arcilla sin aditivos sintéticos, horneada en nuestro taller',
              'Garantía de por vida en costuras estructurales',
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-ink">
                <span className="text-terracotta mt-1">›</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <a
            href="#"
            className="inline-flex items-center gap-2 text-terracotta font-medium underline underline-offset-4 hover:no-underline"
          >
            Conocer el taller <span aria-hidden>→</span>
          </a>
        </div>
      </div>
    </section>
  );
}
