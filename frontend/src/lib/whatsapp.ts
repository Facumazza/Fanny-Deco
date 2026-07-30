import type { Order, OrderStatus } from '../types/api';

/**
 * WhatsApp phone numbers in wa.me URLs must be raw digits, international
 * format, no `+` or separators. Customers at checkout typically type the local
 * Argentine format ("11 6589 6153" or "011 6589-6153") without the country
 * code, and WhatsApp then rejects the link ("falta el código de área"). So we
 * always coerce the value into the international AR-mobile form (54 9 + local
 * number). If nothing digit-like remains, return null so callers can hide the
 * "Avisar por WhatsApp" affordance instead of building a broken link.
 *
 * Assumes AR mobile numbers only — same assumption as the checkout form,
 * which locks the +54 9 prefix into the input. If FannyDeco ever sells
 * outside Argentina we'll need to lift this.
 */
function normalizePhone(raw: string | null | undefined): string | null {
  if (!raw) return null;
  let digits = raw.replace(/\D+/g, '');
  if (!digits) return null;

  // Strip a leading 0 (Argentine local trunk prefix, e.g. "011 6589 6153").
  if (digits.startsWith('0')) digits = digits.slice(1);

  // Force the +54 9 prefix. WhatsApp for AR mobile requires the "9" after 54
  // — a number that starts with just "54" (fixed-line-ish) gets the 9
  // inserted; a number without any country code gets "549" prepended.
  if (digits.startsWith('549')) {
    // already good
  } else if (digits.startsWith('54')) {
    digits = '549' + digits.slice(2);
  } else {
    digits = '549' + digits;
  }

  // 54 (country) + 9 (mobile) + at least 8 digits for area + number = 11.
  // Anything shorter is clearly not a real AR mobile; bail out.
  return digits.length >= 11 ? digits : null;
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
