import { Link } from 'react-router-dom';

/**
 * Aviso de que el carrito tiene productos que no se venden solos.
 * Se muestra igual en el carrito y en el checkout para que el cliente lea
 * siempre lo mismo; el texto del backend (COMPANION_REQUIRED) está redactado
 * en la misma línea por si igual llega a rebotar el POST.
 */
export function CompanionWarning({ names }: { names: string[] }) {
  const plural = names.length > 1;
  return (
    <div
      role="alert"
      className="bg-terracotta/10 border border-terracotta/40 text-ink px-4 py-3 rounded-card text-sm"
    >
      <p className="font-semibold text-terracotta mb-1">
        {plural ? 'Estos productos no se venden solos' : 'Este producto no se vende solo'}
      </p>
      <p>
        {names.join(', ')} {plural ? 'se venden' : 'se vende'} junto a una cartera
        u otra pieza de la tienda. Agregá una al carrito para poder finalizar
        la compra.
      </p>
      {/* A la colección entera, sin slug de categoría: los slugs los edita
          Laura desde el admin y un link fijo se desincroniza solo. */}
      <Link
        to="/#coleccion"
        className="inline-block mt-2 text-terracotta font-semibold hover:underline"
      >
        Ver la colección →
      </Link>
    </div>
  );
}
