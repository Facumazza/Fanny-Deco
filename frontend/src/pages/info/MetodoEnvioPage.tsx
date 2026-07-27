import { ContentPage } from '../../components/layout/ContentPage';

export default function MetodoEnvioPage() {
  return (
    <ContentPage eyebrow="INFORMACIÓN" title="Método de envío">
      <p>
        Hacemos envíos desde nuestro taller en Buenos Aires a todo el país y a
        Latinoamérica. Cada pieza se empaqueta con cuidado y viaja con seguro
        contra roturas.
      </p>

      <h2>Zonas y plazos</h2>
      <ul>
        <li><strong>CABA y GBA</strong>: 24 a 72 horas hábiles.</li>
        <li><strong>Interior de Argentina</strong>: 3 a 7 días hábiles.</li>
        <li><strong>Uruguay, Chile, Paraguay</strong>: 7 a 10 días hábiles.</li>
        <li><strong>Resto de Latinoamérica</strong>: 10 a 15 días hábiles, según destino.</li>
      </ul>

      <h2>Correos y couriers</h2>
      <p>
        Trabajamos con <strong>Correo Argentino</strong>, <strong>OCA</strong> y
        <strong> Andreani</strong> para envíos nacionales, y con couriers
        internacionales para exterior. El costo depende del peso, volumen y destino,
        y se calcula al momento del checkout.
      </p>

      <h2>Envíos gratis</h2>
      <p>
        Compras superiores a <strong>$500.000 ARS</strong> tienen envío bonificado
        dentro de Argentina.
      </p>

      <h2>Seguimiento</h2>
      <p>
        Cuando despachamos tu pedido, te enviamos el código de seguimiento por
        email. Podés seguir el estado en la página del correo correspondiente.
      </p>

      <h2>Retiro en el taller</h2>
      <p>
        Si estás en Buenos Aires y preferís retirar personalmente, podés coordinar
        el retiro en nuestro taller de <strong>Av. Corrientes 1234, CABA</strong>,
        de lunes a viernes de 10 a 18 hs.
      </p>

      <p>
        ¿Consultas sobre tu envío? Escribinos con el número de orden a
        <a href="mailto:fannydecoarte@gmail.com"> fannydecoarte@gmail.com</a>.
      </p>
    </ContentPage>
  );
}
