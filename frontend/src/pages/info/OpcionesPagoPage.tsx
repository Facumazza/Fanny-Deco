import { ContentPage } from '../../components/layout/ContentPage';

export default function OpcionesPagoPage() {
  return (
    <ContentPage eyebrow="INFORMACIÓN" title="Opciones de pago">
      <p>
        Todos los pagos se procesan a través de <strong>MercadoPago</strong> — la
        plataforma más usada para pagos online en Latinoamérica. Nunca vemos ni
        guardamos los datos de tu tarjeta.
      </p>

      <h2>Medios aceptados</h2>
      <ul>
        <li><strong>Tarjetas de crédito</strong>: Visa, Mastercard, American Express, Cabal, Naranja, Argencard, Diners.</li>
        <li><strong>Tarjetas de débito</strong>: Visa Débito, Maestro, Mastercard Débito, Cabal Débito.</li>
        <li><strong>Efectivo</strong>: Rapipago, Pago Fácil, RipSA.</li>
        <li><strong>Transferencia bancaria</strong>: MODO, CVU, dinero en cuenta MercadoPago.</li>
        <li><strong>Mercado Crédito</strong>: la financiera propia de MP.</li>
      </ul>

      <h2>Cuotas sin interés</h2>
      <p>
        Trabajamos con las promociones vigentes de cada banco. Podés ver las
        cuotas disponibles al momento del pago, en la pantalla de MercadoPago.
        Habitualmente ofrecemos <strong>hasta 12 cuotas</strong> con tarjetas
        seleccionadas.
      </p>

      <h2>Seguridad</h2>
      <p>
        MercadoPago cumple con los estándares PCI-DSS y encripta cada transacción.
        Como vendedor, FannyDeco no accede a los datos de tu tarjeta en ningún
        momento.
      </p>

      <h2>Pagos pendientes</h2>
      <p>
        Si elegís efectivo (Rapipago / Pago Fácil), tu orden queda como
        <em> pendiente</em> hasta que el pago se acredite (habitualmente 24-48hs).
        Recibirás el cupón por email para pagar en el punto físico.
      </p>

      <p>
        ¿Dudas sobre un pago? Escribinos a <a href="mailto:hola@artesa.com">hola@artesa.com</a> con el número de orden.
      </p>
    </ContentPage>
  );
}
