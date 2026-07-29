import type { Order, OrderStatus } from '../types/api';

/**
 * WhatsApp phone numbers in wa.me URLs must be raw digits, international
 * format, no `+` or separators. Strip anything non-digit from whatever the
 * customer typed at checkout and trust the frontend/backend validated the
 * international prefix. If nothing digit-like remains, return null so callers
 * can hide the "Avisar por WhatsApp" affordance instead of building a broken
 * link.
 */
function normalizePhone(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const digits = raw.replace(/\D+/g, '');
  return digits.length >= 8 ? digits : null;
}

function firstName(fullName: string): string {
  const trimmed = fullName.trim();
  const space = trimmed.indexOf(' ');
  return space === -1 ? trimmed : trimmed.slice(0, space);
}

/**
 * Message template per status transition. Written in Argentine Spanish and
 * signed as FannyDeco because these go out from Laura's WhatsApp — she just
 * clicks to open the pre-filled draft. PENDING is intentionally absent:
 * transitioning BACK to pending doesn't warrant a customer notification.
 */
function messageFor(status: OrderStatus, order: Order, orderUrl: string): string | null {
  const name = firstName(order.customerName);
  const ref = order.reference;
  switch (status) {
    case 'PAID':
      return `Hola ${name}! Recibimos tu pago del pedido ${ref}. Estamos preparando todo con cuidado y en cuanto lo despachemos te aviso por acá. ¡Gracias por tu compra! — FannyDeco`;
    case 'SHIPPED': {
      const tracking = order.trackingInfo
        ? ` Seguimiento: ${order.trackingInfo}.`
        : '';
      return `Hola ${name}! Tu pedido ${ref} ya está en camino.${tracking} Podés ver el estado acá: ${orderUrl} Cualquier consulta escribime. — FannyDeco`;
    }
    case 'DELIVERED':
      return `Hola ${name}! Confirmamos que recibiste tu pedido ${ref}. Ojalá te guste — si sacás fotos con tus piezas nos encantaría verlas en Instagram @fanny.deco. — FannyDeco`;
    case 'CANCELLED':
      return `Hola ${name}! Tu pedido ${ref} fue cancelado. Si fue un error o querés reintentar, escribime. — FannyDeco`;
    case 'REFUNDED':
      return `Hola ${name}! Procesamos el reembolso de tu pedido ${ref}. El importe vuelve al medio de pago original en los próximos días hábiles. Cualquier duda escribime. — FannyDeco`;
    case 'PENDING':
      return null;
  }
}

/**
 * Build a wa.me URL that opens WhatsApp with a pre-filled draft for this
 * status transition. Returns null when the order has no usable phone or the
 * status doesn't warrant a customer message — callers hide the button in
 * that case.
 */
export function buildStatusWhatsAppUrl(
  order: Order,
  status: OrderStatus,
): string | null {
  const phone = normalizePhone(order.phone);
  if (!phone) return null;
  const orderUrl = `${window.location.origin}/orden/${order.reference}`;
  const message = messageFor(status, order, orderUrl);
  if (!message) return null;
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}
