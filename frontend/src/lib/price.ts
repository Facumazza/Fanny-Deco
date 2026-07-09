/**
 * ARS formatting used across the storefront and admin. Centralized so the format
 * ("$342.000", no decimals, es-AR conventions) is consistent everywhere.
 */
const arsFmt = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 0,
});

/** Format a plain number as Argentine pesos: 342000 -> "$342.000". */
export function formatArs(value: number): string {
  return arsFmt.format(value);
}
