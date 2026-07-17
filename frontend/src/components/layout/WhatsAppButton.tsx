import { useLocation } from 'react-router-dom';

// Number in international format WITHOUT + or spaces/dashes — wa.me expects raw digits.
// TODO: replace with the real number before deploying, or move to VITE_ env var.
const PHONE = '5491112345678';
const PREFILL = '¡Hola FannyDeco! Estoy mirando la tienda y tengo una consulta.';

/**
 * Floating WhatsApp CTA rendered at the app root. Hidden on admin routes since
 * the admin panel shouldn't nudge customers-facing chat.
 */
export function WhatsAppButton() {
  const { pathname } = useLocation();
  if (pathname.startsWith('/admin')) return null;

  const href = `https://wa.me/${PHONE}?text=${encodeURIComponent(PREFILL)}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chatear por WhatsApp"
      className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-[#25D366] hover:bg-[#1EAE55] text-white flex items-center justify-center shadow-lg hover:shadow-xl transition-all"
    >
      <svg
        width="28" height="28" viewBox="0 0 24 24"
        fill="currentColor" aria-hidden
      >
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.076 4.487.71.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zM12.05 21.5c-1.61 0-3.194-.431-4.583-1.248l-.328-.195-3.404.892.909-3.319-.213-.34a9.406 9.406 0 01-1.443-5.02c0-5.196 4.229-9.425 9.425-9.425 2.518 0 4.884.981 6.664 2.762a9.365 9.365 0 012.759 6.669c-.001 5.196-4.23 9.424-9.786 9.424zm7.987-17.412A11.463 11.463 0 0012.049 0C5.495 0 .16 5.335.158 11.892c0 2.096.548 4.142 1.588 5.945L.057 24l6.335-1.66a11.881 11.881 0 005.687 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.474-8.407z"/>
      </svg>
    </a>
  );
}
