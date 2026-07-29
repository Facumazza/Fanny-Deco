import { ContentPage } from '../../components/layout/ContentPage';

export default function PoliticaCambioPage() {
  return (
    <ContentPage eyebrow="INFORMACIÓN" title="Devoluciones">
      <p>
        No se aceptan devoluciones de productos artesanales.
      </p>

      <h2>Cambios por daños en el envío</h2>
      <p>
        Los cambios solo aplican en caso de que el producto haya sufrido
        daños durante el envío. En ese caso, deberás realizar el reclamo
        dentro de las <strong>48 horas</strong> de haber recibido tu pedido,
        enviando <strong>fotos del producto dañado</strong> a través de
        cualquiera de nuestros canales de contacto.
      </p>
      <p>
        <strong>FannyDeco</strong> evaluará la situación y se reserva el
        derecho de decidir entre <strong>el cambio o la reparación</strong>{' '}
        del producto. En estos casos, <strong>los gastos de envío corren
        por cuenta de FannyDeco</strong>.
      </p>
    </ContentPage>
  );
}
