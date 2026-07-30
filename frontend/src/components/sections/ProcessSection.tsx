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
          <p className="text-muted leading-relaxed max-w-lg">
            Cada bolso se cose a mano. Cada pieza de cerámica se torna, se
            glasea y se hornea en nuestro taller. Sin producción en masa.
            Sin atajos.
          </p>
        </div>
      </div>
    </section>
  );
}
