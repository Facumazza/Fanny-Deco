import { ContentPage } from '../../components/layout/ContentPage';
import { BANK_INFO } from '../../config/bank';

export default function OpcionesPagoPage() {
  return (
    <ContentPage eyebrow="INFORMACIÓN" title="Opciones de pago">
      <p>
        Por ahora aceptamos únicamente <strong>transferencia bancaria</strong>.
        Al finalizar tu compra te mostramos los datos y podés subir el
        comprobante directamente desde la web para que confirmemos el pago.
      </p>

      <h2>Datos para transferir</h2>
      <ul>
        <li><strong>Banco</strong>: {BANK_INFO.bankName}</li>
        <li><strong>Titular</strong>: {BANK_INFO.accountHolder}</li>
        <li><strong>CUIT</strong>: {BANK_INFO.cuit}</li>
        <li><strong>Alias</strong>: {BANK_INFO.alias}</li>
        <li><strong>CBU</strong>: {BANK_INFO.cbu}</li>
      </ul>

      <p>
        ¿Dudas sobre un pago u otras formas de pago? Escribinos a{' '}
        <a href="mailto:fannydecoarte@gmail.com">fannydecoarte@gmail.com</a>{' '}
        antes de realizar la compra.
      </p>
    </ContentPage>
  );
}
