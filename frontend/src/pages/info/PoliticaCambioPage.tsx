import { ContentPage } from '../../components/layout/ContentPage';

export default function PoliticaCambioPage() {
  return (
    <ContentPage eyebrow="INFORMACIÓN" title="Política de cambio y devolución">
      <p>
        En FannyDeco trabajamos cada pieza a mano. Cada bolso, cada cerámica es
        distinta a la anterior — pequeñas variaciones en tono, veta o textura son
        parte de la naturaleza artesanal y no constituyen defectos. Aún así, si
        una pieza llega dañada o no cumple con lo prometido, la cambiamos o
        devolvemos el importe.
      </p>

      <h2>Plazo</h2>
      <p>
        Tenés <strong>10 días corridos</strong> desde la recepción del pedido
        para solicitar un cambio o devolución, tal como establece la Ley de
        Defensa del Consumidor (Ley 24.240).
      </p>

      <h2>Condiciones</h2>
      <ul>
        <li>El producto debe estar sin uso, con todas sus etiquetas y en su empaque original.</li>
        <li>Cerámicas: se aceptan cambios solo si llegan rotas. En ese caso, envianos fotos dentro de las 48hs de recibido el paquete.</li>
        <li>Piezas de edición limitada o hechas por encargo no se aceptan devoluciones.</li>
      </ul>

      <h2>Cómo hacerlo</h2>
      <ol>
        <li>Escribinos a <a href="mailto:fannydecoarte@gmail.com">fannydecoarte@gmail.com</a> o por WhatsApp indicando tu número de orden.</li>
        <li>Coordinamos el retiro o punto de entrega según tu ciudad.</li>
        <li>Una vez recibida la pieza y verificado su estado, procesamos el reintegro (hasta 10 días hábiles) o despachamos la nueva pieza.</li>
      </ol>

      <h2>Costos del envío del cambio</h2>
      <p>
        Si el cambio es por un defecto o error nuestro, <strong>el envío corre por nuestra cuenta</strong>. Si es por preferencia (cambio de talle, color, etc.), el costo lo asumís vos.
      </p>

      <p className="text-sm">
        <em>Última actualización: julio 2026. Este texto es una guía general; consultá siempre por email o WhatsApp para tu caso particular.</em>
      </p>
    </ContentPage>
  );
}
