import { ContentPage } from '../../components/layout/ContentPage';

export default function ContactoPage() {
  return (
    <ContentPage eyebrow="INFORMACIÓN" title="Contacto">
      <p>
        Cualquier consulta, pedido especial, colaboración o simplemente para
        saludar, estamos disponibles por los siguientes canales:
      </p>

      <h2>Escribinos</h2>
      <ul>
        <li>
          <strong>Email</strong>:
          <a href="mailto:fannydecoarte@gmail.com"> fannydecoarte@gmail.com</a>
          <br />
          Respondemos dentro de las 24 hs hábiles.
        </li>
        <li>
          <strong>WhatsApp</strong>: usá el botón verde flotante abajo a la
          derecha, o llamanos al <strong>+54 9 11 6589-6153</strong>.
        </li>
        <li>
          <strong>Instagram</strong>:
          <a href="https://www.instagram.com/fanny.deco/" target="_blank" rel="noreferrer"> @fanny.deco</a>
        </li>
      </ul>

      <h2>Visitanos</h2>
      <p>
        Taller y showroom: <strong>Av. Corrientes 1234, CABA</strong>, Argentina.
        <br />
        Horario: lunes a viernes de 10 a 18 hs. Sábados con cita previa.
      </p>

      <h2>Piezas por encargo</h2>
      <p>
        Hacemos piezas a medida (bolsos, carteras, sets de cerámica). Los tiempos
        de producción rondan las 3-6 semanas según complejidad. Escribinos con
        tus ideas y armamos un presupuesto.
      </p>

      <h2>Prensa y colaboraciones</h2>
      <p>
        Consultas de prensa, catálogos, eventos o showrooms:
        <a href="mailto:fannydecoarte@gmail.com"> fannydecoarte@gmail.com</a>.
      </p>
    </ContentPage>
  );
}
