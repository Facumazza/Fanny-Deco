/**
 * Datos bancarios que se muestran al cliente en la página de transferencia.
 * Son públicos (aparecen en el checkout, cualquier cliente los ve), así que
 * vivir acá en el repo no es filtración — la ventaja es no depender de env
 * vars en Railway y poder cambiar todo con un commit.
 *
 * Si Laura cambia de banco / cuenta / WhatsApp, actualizás este archivo,
 * commit + push, Vercel redeploya en 1 minuto.
 */
export const BANK_INFO = {
  bankName: 'Banco Galicia',
  accountHolder: 'Laura Mabel Casareski',
  cbu: '0070137830004025573483',
  alias: 'laucasa2013',
  cuit: '27-18253531-7',
  contactMethod: 'WhatsApp al +54 9 11 6589-6153',
} as const;
