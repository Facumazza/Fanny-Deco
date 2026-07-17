import { ContentPage } from '../../components/layout/ContentPage';

export default function ElProcesoPage() {
  return (
    <ContentPage eyebrow="EL TALLER" title="El proceso">
      <p>
        Cada pieza FannyDeco sigue un proceso lento. No es un slogan —
        literalmente, un bolso Tote tarda unas 40 horas de trabajo. Una taza
        de gres pasa por siete etapas antes de estar lista para tu casa.
      </p>

      <h2>Cuero: bolso y accesorios</h2>
      <ol>
        <li><strong>Curtido</strong>: usamos cuero full-grain curtido al vegetal, con taninos naturales de acacia y quebracho. Sin cromo, sin metales pesados.</li>
        <li><strong>Corte</strong>: trazamos y cortamos a mano cada pieza. El cuero tiene variaciones — vetas, marcas — que respetamos.</li>
        <li><strong>Descarne y biselado</strong>: reducimos el grosor donde va a doblarse, para que el bolso cierre bien.</li>
        <li><strong>Costura a mano</strong>: usamos hilo de lino encerado, con puntada silla. Es 3 veces más resistente que la costura a máquina y no se deshace si un hilo se rompe.</li>
        <li><strong>Terminación</strong>: pulido de cantos con goma tragacanto, sellado y encerado.</li>
        <li><strong>Herrajes</strong>: hebillas y cerraduras de bronce macizo o acero inoxidable. Nada plateado ni pintado.</li>
      </ol>

      <h2>Cerámica: piezas de mesa y deco</h2>
      <ol>
        <li><strong>Arcilla</strong>: usamos gres y porcelana de yacimientos de la Patagonia y Buenos Aires.</li>
        <li><strong>Torneado o modelado</strong>: cada pieza se hace individualmente. Algunas se tornean, otras se modelan a mano.</li>
        <li><strong>Secado</strong>: 3 a 5 días al aire, cubiertas con nylon para que la humedad se pierda parejo.</li>
        <li><strong>Primera cocción</strong> (bizcocho): 12 horas a 950°C.</li>
        <li><strong>Esmaltado</strong>: preparamos los esmaltes con óxidos minerales. Cada color tiene su fórmula.</li>
        <li><strong>Segunda cocción</strong>: 14 horas a 1240°C. Ahí es cuando el gres se vitrifica y se vuelve impermeable.</li>
        <li><strong>Control</strong>: rechazamos entre el 15 y 20% de las piezas por defectos mínimos que otros vendedores dejarían pasar.</li>
      </ol>

      <p>
        Si querés ver el taller, escribinos y coordinamos una visita — trabajamos
        con puertas abiertas.
      </p>
    </ContentPage>
  );
}
