import { useState, FormEvent } from 'react';

export function Newsletter() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    // Fase 1: sin backend real de newsletter. Solo estado local.
    if (email) setSubmitted(true);
  }

  return (
    <section className="bg-brown-dark text-white py-20">
      <div className="max-w-2xl mx-auto px-6 text-center">
        <p className="text-cream-bg/80 text-xs tracking-[0.3em] mb-4">COMUNIDAD ARTESA</p>
        <h2 className="font-display text-4xl md:text-5xl leading-tight mb-6">
          Sé el primero en conocer nuevas piezas
        </h2>
        <p className="text-white/80 mb-8">
          Lanzamientos exclusivos, historias del taller y descuentos para suscriptores.
        </p>

        {submitted ? (
          <p className="text-white/90 text-lg">¡Gracias! Te sumaste a la comunidad.</p>
        ) : (
          <form onSubmit={handleSubmit} className="flex items-stretch max-w-lg mx-auto">
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="tu@email.com"
              className="flex-1 bg-transparent border border-white/40 px-5 py-3 text-white placeholder-white/50 focus:outline-none focus:border-white"
              aria-label="Tu email"
            />
            <button
              type="submit"
              className="bg-terracotta hover:bg-terracotta-light px-8 py-3 font-semibold tracking-wider text-sm"
            >
              SUSCRIBIR
            </button>
          </form>
        )}
        <p className="text-white/50 text-xs mt-4">Sin spam. Podés darte de baja cuando quieras.</p>
      </div>
    </section>
  );
}
