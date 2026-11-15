/**
 * Laica — mascota de la app de monitorización de salud.
 *
 * Componente web sin dependencias:
 *   <script src="laica.js"></script>
 *   <laica-mascota estado="saludar" tamano="240"></laica-mascota>
 *
 * Cambiar de estado desde JS:
 *   document.querySelector('laica-mascota').estado = 'alerta';
 *
 * Estados: reposo, saludar, hablar, celebrar, ejercicio, respirar,
 *          dormir, alerta, urgente, radiacion
 *
 * Aspecto: por defecto usa las fotos del diseño de Canva del equipo (canva/*.webp, con vistas
 * de frente, tres cuartos a cada lado, espalda y saludando). aspecto="dibujo" usa el dibujo SVG.
 * Sonidos: laica.ladrar(), laica.grunir(), laica.quejarse() (sonidos/*.wav, CC0).
 * Las fotos y los sonidos se buscan junto a este archivo, o donde indique window.LAICA_RECURSOS.
 */
(() => {
  const ESTADOS = [
    "reposo", "saludar", "hablar", "celebrar", "ejercicio",
    "respirar", "dormir", "alerta", "urgente", "radiacion",
  ];

  // ---------- Recursos: fotos y sonidos ----------
  const BASE = (() => {
    try { return document.currentScript ? new URL(".", document.currentScript.src).href : ""; } catch { return ""; }
  })();
  const VISTAS = ["frente", "izquierda", "derecha", "espalda", "saludando", "andando", "saltando"];
  const CANTIDAD = { ladrido: 10, grunido: 4, quejido: 3 };
  function recursos() {
    const r = window.LAICA_RECURSOS || {};
    const fotos = r.fotos || (BASE ? Object.fromEntries(VISTAS.map((v) => [v, `${BASE}canva/${v}.webp`])) : null);
    const sonidos = r.sonidos || (BASE ? Object.fromEntries(Object.entries(CANTIDAD).map(([t, n]) =>
      [t, Array.from({ length: n }, (_, i) => `${BASE}sonidos/${t}-${i + 1}.wav`)])) : {});
    return { fotos, sonidos };
  }

  // Ladridos, gruñidos y quejidos reales. Se pueden silenciar (se recuerda en este navegador).
  const Sonido = {
    activo() { try { return localStorage.getItem("laica-sonido") !== "0"; } catch { return true; } },
    poner(si) { try { localStorage.setItem("laica-sonido", si ? "1" : "0"); } catch { /* sin almacenamiento */ } },
    tocar(tipo, volumen = 0.7) {
      if (!this.activo()) return null;
      const lista = recursos().sonidos[tipo];
      if (!lista || !lista.length) return null;
      const a = new Audio(lista[Math.floor(Math.random() * lista.length)]);
      a.volume = volumen;
      a.preservesPitch = false;
      a.playbackRate = 0.9 + Math.random() * 0.2; // cada ladrido suena un poco distinto
      a.play().catch(() => {}); // el navegador no deja sonar nada antes del primer toque
      return a;
    },
  };
  window.LaicaSonido = Sonido;

  const SVG = `
<svg class="laica" viewBox="0 0 300 340" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Laica, la perra astronauta">
  <defs>
    <radialGradient id="lc-brillo" cx="50%" cy="50%" r="50%">
      <stop offset="0" stop-color="#7FD1FF" stop-opacity=".35"/>
      <stop offset=".6" stop-color="#7FD1FF" stop-opacity=".08"/>
      <stop offset="1" stop-color="#7FD1FF" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="lc-pelaje" cx="38%" cy="30%" r="80%">
      <stop offset="0" stop-color="#FFC069"/>
      <stop offset=".55" stop-color="#F39A2B"/>
      <stop offset="1" stop-color="#D9761A"/>
    </radialGradient>
    <radialGradient id="lc-crema" cx="45%" cy="35%" r="75%">
      <stop offset="0" stop-color="#FFFFFF"/>
      <stop offset="1" stop-color="#F6E6D2"/>
    </radialGradient>
    <linearGradient id="lc-traje" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#FFFFFF"/>
      <stop offset=".6" stop-color="#EEF2FD"/>
      <stop offset="1" stop-color="#CDD6F2"/>
    </linearGradient>
    <linearGradient id="lc-metal" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#EEF2FF"/>
      <stop offset=".5" stop-color="#C3CDEE"/>
      <stop offset="1" stop-color="#8E9DD3"/>
    </linearGradient>
    <linearGradient id="lc-bota" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#C9D3F2"/>
      <stop offset="1" stop-color="#7E8EC9"/>
    </linearGradient>
    <radialGradient id="lc-cristal" cx="35%" cy="28%" r="78%">
      <stop offset="0" stop-color="#FFFFFF" stop-opacity=".30"/>
      <stop offset=".55" stop-color="#B0DEFF" stop-opacity=".16"/>
      <stop offset=".88" stop-color="#6FA8E6" stop-opacity=".30"/>
      <stop offset="1" stop-color="#3D6FB8" stop-opacity=".55"/>
    </radialGradient>
    <radialGradient id="lc-ojo" cx="40%" cy="35%" r="70%">
      <stop offset="0" stop-color="#3B4C8C"/>
      <stop offset="1" stop-color="#141C42"/>
    </radialGradient>
    <filter id="lc-sombra" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="0" dy="8" stdDeviation="7" flood-color="#060B24" flood-opacity=".38"/>
    </filter>
    <mask id="lc-m-cabeza">
      <ellipse cx="150" cy="136" rx="64" ry="54" fill="#fff"/>
      <ellipse cx="141" cy="125" rx="64" ry="54" fill="#000"/>
    </mask>
    <mask id="lc-m-torso">
      <rect x="103" y="196" width="94" height="88" rx="36" fill="#fff"/>
      <rect x="93" y="188" width="94" height="88" rx="36" fill="#000"/>
    </mask>
  </defs>

  <!-- Brillo ambiental (no se mueve) -->
  <circle cx="150" cy="175" r="150" fill="url(#lc-brillo)"/>

  <g class="cuerpo-entero" filter="url(#lc-sombra)">
    <!-- Halo de alerta alrededor del casco -->
    <circle class="halo" cx="150" cy="128" r="102" fill="none" stroke-width="10"/>

    <!-- Mochila de soporte vital (detrás del cuerpo) -->
    <rect x="90" y="198" width="120" height="74" rx="20" fill="url(#lc-metal)" stroke="var(--linea)" stroke-width="4"/>
    <rect x="96" y="214" width="8" height="40" rx="4" fill="var(--linea)" opacity=".18"/>
    <rect x="196" y="214" width="8" height="40" rx="4" fill="var(--linea)" opacity=".18"/>

    <!-- Cola con punta blanca -->
    <g class="cola">
      <g transform="rotate(-25 203 286)">
        <ellipse cx="203" cy="286" rx="17" ry="11.5" fill="url(#lc-pelaje)" stroke="var(--linea)" stroke-width="4"/>
        <ellipse cx="214" cy="285" rx="6.5" ry="7" fill="url(#lc-crema)"/>
        <path d="M193 291 Q203 295 213 291" fill="none" stroke="#C96A10" stroke-width="2" opacity=".5" stroke-linecap="round"/>
      </g>
    </g>

    <!-- Piernas, rodilleras y botas -->
    <g class="piernas" stroke="var(--linea)" stroke-width="4" stroke-linejoin="round">
      <g class="pierna-i">
        <rect x="112" y="262" width="32" height="50" rx="15" fill="url(#lc-traje)"/>
        <rect x="133" y="270" width="7" height="34" rx="3.5" fill="#8E9BC8" opacity=".35" stroke="none"/>
        <ellipse cx="128" cy="288" rx="11" ry="7" fill="url(#lc-metal)" stroke-width="3"/>
        <ellipse cx="128" cy="314" rx="19" ry="11" fill="url(#lc-bota)"/>
        <path d="M112 318 Q128 326 144 318" fill="none" stroke-width="3" opacity=".6"/>
      </g>
      <g class="pierna-d">
        <rect x="156" y="262" width="32" height="50" rx="15" fill="url(#lc-traje)"/>
        <rect x="177" y="270" width="7" height="34" rx="3.5" fill="#8E9BC8" opacity=".35" stroke="none"/>
        <ellipse cx="172" cy="288" rx="11" ry="7" fill="url(#lc-metal)" stroke-width="3"/>
        <ellipse cx="172" cy="314" rx="19" ry="11" fill="url(#lc-bota)"/>
        <path d="M156 318 Q172 326 188 318" fill="none" stroke-width="3" opacity=".6"/>
      </g>
    </g>

    <!-- Torso del traje -->
    <rect x="103" y="196" width="94" height="88" rx="36" fill="url(#lc-traje)" stroke="var(--linea)" stroke-width="4"/>
    <rect x="103" y="196" width="94" height="88" rx="36" fill="#7F8EC4" opacity=".38" mask="url(#lc-m-torso)"/>
    <path d="M112 214 Q118 206 128 204" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".9"/>
    <g class="solo-frente">
    <!-- Cinturón -->
    <path d="M105 266 Q150 276 195 266" fill="none" stroke="var(--linea)" stroke-width="3" opacity=".45"/>
    <rect x="143" y="265" width="14" height="10" rx="3" fill="url(#lc-metal)" stroke="var(--linea)" stroke-width="2.5"/>
    <!-- Parche de misión propio (diseño original del equipo, no es un logo de agencia):
         huella de corgi dorada orbitando la Tierra, con borde dorado -->
    <g class="parche-mision">
      <circle cx="116" cy="250" r="11" fill="#13235A" stroke="#E8B53A" stroke-width="2.5"/>
      <circle cx="116" cy="250" r="11" fill="none" stroke="var(--linea)" stroke-width="1.2" opacity=".6"/>
      <circle cx="112" cy="254" r="3.6" fill="#3B82F6"/>
      <path d="M110 254.5 q1.5 -1.6 3.4 -.4" fill="none" stroke="#7DD87D" stroke-width="1.2" stroke-linecap="round"/>
      <ellipse cx="116" cy="250" rx="9" ry="3.6" fill="none" stroke="#9FD3FF" stroke-width="1.1" transform="rotate(-25 116 250)"/>
      <g fill="#FFD447">
        <ellipse cx="120" cy="247.6" rx="2.2" ry="1.8"/>
        <circle cx="117.7" cy="245" r=".9"/><circle cx="119.6" cy="244.2" r=".9"/>
        <circle cx="121.6" cy="244.6" r=".9"/><circle cx="122.9" cy="246.2" r=".9"/>
      </g>
    </g>

    <!-- Panel del pecho con luz de estado -->
    <rect x="126" y="228" width="48" height="30" rx="7" fill="url(#lc-metal)" stroke="var(--linea)" stroke-width="4"/>
    <circle class="led" cx="139" cy="243" r="6.5" stroke="var(--linea)" stroke-width="3"/>
    <ellipse cx="137" cy="240.5" rx="2.4" ry="1.6" fill="#fff" opacity=".85"/>
    <rect x="152" y="237" width="15" height="4" rx="2" fill="var(--linea)" opacity=".55"/>
    <rect x="152" y="245" width="10" height="4" rx="2" fill="var(--linea)" opacity=".55"/>
    <circle cx="130.5" cy="232.5" r="1.5" fill="var(--linea)" opacity=".5"/>
    <circle cx="169.5" cy="232.5" r="1.5" fill="var(--linea)" opacity=".5"/>
    <circle cx="130.5" cy="253.5" r="1.5" fill="var(--linea)" opacity=".5"/>
    <circle cx="169.5" cy="253.5" r="1.5" fill="var(--linea)" opacity=".5"/>

    </g>

    <!-- Vista de espalda: mochila grande con ventilas (solo al darse la vuelta) -->
    <g class="solo-espalda">
      <rect x="104" y="200" width="92" height="80" rx="22" fill="url(#lc-metal)" stroke="var(--linea)" stroke-width="4"/>
      <rect x="116" y="214" width="68" height="14" rx="7" fill="var(--linea)" opacity=".2"/>
      <rect x="116" y="234" width="68" height="14" rx="7" fill="var(--linea)" opacity=".2"/>
      <circle class="led" cx="150" cy="264" r="6" stroke="var(--linea)" stroke-width="3"/>
      <rect x="182" y="256" width="9" height="14" rx="3" fill="#E8B53A" stroke="var(--linea)" stroke-width="2"/>
    </g>

    <!-- Brazo izquierdo (el que saluda) -->
    <g class="brazo-i">
      <rect x="62" y="207" width="54" height="27" rx="13.5" fill="url(#lc-traje)" stroke="var(--linea)" stroke-width="4"/>
      <rect x="80" y="223" width="32" height="7" rx="3.5" fill="#8E9BC8" opacity=".35"/>
      <rect x="72" y="205" width="9" height="31" rx="4" fill="url(#lc-metal)" stroke="var(--linea)" stroke-width="3"/>
      <circle cx="62" cy="220" r="15" fill="url(#lc-pelaje)" stroke="var(--linea)" stroke-width="4"/>
      <path d="M53 214 Q51 220 53 226 M59 211 Q57 220 59 229" fill="none" stroke="#B9620F" stroke-width="2.2" stroke-linecap="round" opacity=".7"/>
    </g>
    <!-- Brazo derecho -->
    <g class="brazo-d">
      <rect x="184" y="207" width="54" height="27" rx="13.5" fill="url(#lc-traje)" stroke="var(--linea)" stroke-width="4"/>
      <rect x="188" y="223" width="32" height="7" rx="3.5" fill="#8E9BC8" opacity=".35"/>
      <!-- Bandera de Ecuador en el hombro (el país del equipo): amarillo, azul y rojo -->
      <g class="bandera">
        <rect x="193" y="210" width="20" height="6" fill="#FFD100"/>
        <rect x="193" y="216" width="20" height="3" fill="#0072CE"/>
        <rect x="193" y="219" width="20" height="3" fill="#EF3340"/>
        <rect x="193" y="210" width="20" height="12" rx="1.5" fill="none" stroke="var(--linea)" stroke-width="1.6"/>
      </g>
      <rect x="219" y="205" width="9" height="31" rx="4" fill="url(#lc-metal)" stroke="var(--linea)" stroke-width="3"/>
      <circle cx="238" cy="220" r="15" fill="url(#lc-pelaje)" stroke="var(--linea)" stroke-width="4"/>
      <path d="M247 214 Q249 220 247 226 M241 211 Q243 220 241 229" fill="none" stroke="#B9620F" stroke-width="2.2" stroke-linecap="round" opacity=".7"/>
    </g>

    <!-- Anillo del cuello con tornillos -->
    <ellipse cx="150" cy="204" rx="58" ry="13" fill="url(#lc-metal)" stroke="var(--linea)" stroke-width="4"/>
    <path d="M100 201 Q150 190 200 201" fill="none" stroke="#fff" stroke-width="3" opacity=".8" stroke-linecap="round"/>
    <circle cx="108" cy="207" r="2.3" fill="var(--linea)" opacity=".55"/>
    <circle cx="150" cy="215" r="2.3" fill="var(--linea)" opacity=".55"/>
    <circle cx="192" cy="207" r="2.3" fill="var(--linea)" opacity=".55"/>

    <!-- Cabeza -->
    <g class="cabeza-giro">
    <g class="cabeza">
      <g class="orejas-giro">
      <g class="oreja-i">
        <path d="M100 112 L90 44 L138 84 Z" fill="url(#lc-pelaje)" stroke="var(--linea)" stroke-width="4" stroke-linejoin="round"/>
        <path d="M104 101 L98 60 L127 85 Z" fill="var(--rosa)"/>
        <path d="M104 101 L101 78 L113 92 Z" fill="#E07F88" opacity=".6"/>
        <path d="M107 99 L114 90 M111 102 L118 94" stroke="var(--crema)" stroke-width="2.5" stroke-linecap="round"/>
      </g>
      <g class="oreja-d">
        <path d="M200 112 L210 44 L162 84 Z" fill="url(#lc-pelaje)" stroke="var(--linea)" stroke-width="4" stroke-linejoin="round"/>
        <path d="M196 101 L202 60 L173 85 Z" fill="var(--rosa)"/>
        <path d="M196 101 L199 78 L187 92 Z" fill="#E07F88" opacity=".6"/>
        <path d="M193 99 L186 90 M189 102 L182 94" stroke="var(--crema)" stroke-width="2.5" stroke-linecap="round"/>
      </g>
      </g>
      <ellipse cx="150" cy="136" rx="64" ry="54" fill="url(#lc-pelaje)" stroke="var(--linea)" stroke-width="4"/>
      <!-- Sombra de volumen de la cabeza -->
      <ellipse cx="150" cy="136" rx="64" ry="54" fill="#B85E0C" opacity=".35" mask="url(#lc-m-cabeza)"/>
      <!-- Mechón -->
      <path d="M140 87 Q144 74 150 84 Q155 72 160 87" fill="url(#lc-pelaje)" stroke="var(--linea)" stroke-width="3" stroke-linejoin="round"/>
      <g class="cara-giro">
      <!-- Mancha blanca de la frente y hocico -->
      <path d="M141 90 Q150 85 159 90 L163 138 L137 138 Z" fill="url(#lc-crema)"/>
      <ellipse cx="150" cy="160" rx="42" ry="27" fill="url(#lc-crema)"/>
      <path d="M118 172 Q150 192 182 172" fill="none" stroke="#E2CDB4" stroke-width="3" stroke-linecap="round" opacity=".8"/>
      <!-- Brillo de la frente -->
      <ellipse cx="118" cy="106" rx="12" ry="7" fill="#fff" opacity=".28" transform="rotate(-25 118 106)"/>
      <!-- Mejillas -->
      <ellipse cx="113" cy="156" rx="9" ry="5" fill="var(--rosa)" opacity=".75"/>
      <ellipse cx="187" cy="156" rx="9" ry="5" fill="var(--rosa)" opacity=".75"/>

      <!-- Ojos abiertos -->
      <g class="ojos">
        <g class="pupilas">
        <ellipse cx="127" cy="134" rx="8" ry="10" fill="url(#lc-ojo)"/>
        <ellipse cx="173" cy="134" rx="8" ry="10" fill="url(#lc-ojo)"/>
        <circle cx="130" cy="129.5" r="3" fill="#fff"/>
        <circle cx="176" cy="129.5" r="3" fill="#fff"/>
        <circle cx="124.5" cy="138.5" r="1.4" fill="#fff" opacity=".8"/>
        <circle cx="170.5" cy="138.5" r="1.4" fill="#fff" opacity=".8"/>
        </g>
      </g>
      <!-- Ojos cerrados (dormir / respirar) -->
      <g class="ojos-cerrados" fill="none" stroke="var(--linea)" stroke-width="4" stroke-linecap="round">
        <path d="M119 135 Q127 141 135 135"/>
        <path d="M165 135 Q173 141 181 135"/>
      </g>
      <!-- Cejas preocupadas -->
      <g class="cejas" fill="none" stroke="var(--linea)" stroke-width="3.5" stroke-linecap="round">
        <path d="M117 118 L134 113"/>
        <path d="M183 118 L166 113"/>
      </g>

      <!-- Nariz -->
      <ellipse cx="150" cy="151" rx="7.5" ry="5.2" fill="url(#lc-ojo)"/>
      <ellipse cx="147.5" cy="149" rx="2.6" ry="1.5" fill="#fff" opacity=".7"/>

      <!-- Bocas (se muestra una según el estado) -->
      <g class="boca boca-sonrisa">
        <path d="M139 159 Q150 170 161 159" fill="none" stroke="var(--linea)" stroke-width="3.5" stroke-linecap="round"/>
        <path d="M145 164 Q150 176 155 164 Z" fill="var(--rosa)" stroke="var(--linea)" stroke-width="2.5"/>
        <path d="M150 166 L150 171" stroke="#E07F88" stroke-width="1.5" stroke-linecap="round"/>
      </g>
      <g class="boca boca-abierta">
        <ellipse cx="150" cy="166" rx="9" ry="9" fill="var(--linea)"/>
        <ellipse cx="150" cy="170" rx="5.5" ry="4" fill="var(--rosa)"/>
      </g>
      <g class="boca boca-preocupada">
        <path d="M140 168 Q150 160 160 168" fill="none" stroke="var(--linea)" stroke-width="3.5" stroke-linecap="round"/>
      </g>

      <!-- Gota de sudor (urgente) -->
      <path class="sudor" d="M203 104 Q196 116 203 121 Q210 116 203 104 Z" fill="#7CC8FF" stroke="var(--linea)" stroke-width="2.5"/>
      </g>
      <!-- Nuca (solo de espaldas): pelaje sin cara -->
      <g class="nuca">
        <ellipse cx="150" cy="136" rx="62" ry="52" fill="url(#lc-pelaje)"/>
        <ellipse cx="150" cy="136" rx="62" ry="52" fill="#B85E0C" opacity=".3" mask="url(#lc-m-cabeza)"/>
        <path d="M128 168 Q150 182 172 168" fill="none" stroke="#B9620F" stroke-width="3" stroke-linecap="round" opacity=".5"/>
        <path d="M150 92 L150 120" stroke="#B9620F" stroke-width="2.5" stroke-linecap="round" opacity=".35"/>
      </g>
    </g>
    </g>

    <!-- Casco de cristal con reflejos -->
    <circle class="casco" cx="150" cy="128" r="92" fill="url(#lc-cristal)" stroke="var(--linea)" stroke-width="5"/>
    <g class="reflejos">
    <circle cx="150" cy="128" r="86" fill="none" stroke="#fff" stroke-width="2" opacity=".35"/>
    <path d="M83 104 A70 70 0 0 1 118 54" fill="none" stroke="#fff" stroke-width="10" stroke-linecap="round" opacity=".8"/>
    <path d="M76 128 A75 75 0 0 1 79 113" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round" opacity=".6"/>
    <path d="M190 196 A82 82 0 0 0 222 168" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".35"/>
    <circle cx="214" cy="170" r="5" fill="#fff" opacity=".7"/>
    <circle cx="203" cy="182" r="2.5" fill="#fff" opacity=".6"/>
    </g>

    <!-- Antena con luz (mismo color que el panel) -->
    <path d="M196 49 L211 20" stroke="var(--linea)" stroke-width="4" stroke-linecap="round"/>
    <circle class="led antena" cx="212" cy="17" r="6" stroke="var(--linea)" stroke-width="3"/>
    <circle cx="210.2" cy="15.2" r="1.8" fill="#fff" opacity=".85"/>

    <!-- Zzz (dormir) -->
    <g class="zzz" fill="#FFFFFF" stroke="var(--linea)" stroke-width="1.5" font-family="Arial Rounded MT Bold, Arial, sans-serif" font-weight="700">
      <text x="238" y="70" font-size="22">z</text>
      <text x="252" y="48" font-size="28">z</text>
      <text x="268" y="22" font-size="34">Z</text>
    </g>

    <!-- Estrellitas (celebrar) -->
    <g class="destellos" fill="#FFD447" stroke="var(--linea)" stroke-width="2">
      <path d="M40 60 l6 14 14 6 -14 6 -6 14 -6 -14 -14 -6 14 -6 z"/>
      <path d="M258 110 l5 11 11 5 -11 5 -5 11 -5 -11 -11 -5 11 -5 z"/>
      <path d="M30 250 l4 9 9 4 -9 4 -4 9 -4 -9 -9 -4 9 -4 z"/>
      <path d="M268 250 l4 9 9 4 -9 4 -4 9 -4 -9 -9 -4 9 -4 z"/>
    </g>

    <!-- Símbolo de radiación -->
    <g class="simbolo-rad" transform="translate(250 60)">
      <circle r="22" fill="#FFD447" stroke="var(--linea)" stroke-width="3"/>
      <circle r="4" fill="var(--linea)"/>
      <path d="M0 -6 L-8 -18 A20 20 0 0 1 8 -18 Z" fill="var(--linea)"/>
      <path d="M0 -6 L-8 -18 A20 20 0 0 1 8 -18 Z" fill="var(--linea)" transform="rotate(120)"/>
      <path d="M0 -6 L-8 -18 A20 20 0 0 1 8 -18 Z" fill="var(--linea)" transform="rotate(240)"/>
    </g>
  </g>
</svg>
`;

  const CSS = `
:host { display: inline-block; --tam: 240px; --mx: 0; --my: 0; perspective: 900px; }
.envoltura {
  width: var(--tam); position: relative; transform-style: preserve-3d;
  transform: rotateY(calc(var(--mx) * 26deg)) rotateX(calc(var(--my) * -8deg));
  transition: transform .6s cubic-bezier(.2, .8, .2, 1);
}
/* Dos caras del mismo personaje: frente y espalda, para poder darse la vuelta en 3D */
svg.laica { backface-visibility: hidden; -webkit-backface-visibility: hidden; }
svg.laica.espalda { position: absolute; top: 0; left: 0; transform: rotateY(180deg); }
.solo-espalda, .nuca { display: none; }
svg.espalda .solo-espalda, svg.espalda .nuca { display: inline; }
svg.espalda .solo-frente, svg.espalda .cara-giro, svg.espalda .halo { display: none; }
svg.espalda .oreja-i > :not(:first-child), svg.espalda .oreja-d > :not(:first-child) { display: none; }
/* Giro de cabeza: la cara se desliza, las orejas y los reflejos van al revés */
.cabeza-giro { transform-origin: 150px 190px; transform: rotate(calc(var(--mx) * 4deg)) translate(calc(var(--mx) * 4px), calc(var(--my) * 3px)); transition: transform .45s ease-out; }
.cara-giro   { transform: translate(calc(var(--mx) * 13px), calc(var(--my) * 6px)); transition: transform .45s ease-out; }
.pupilas     { transform: translate(calc(var(--mx) * 2.5px), calc(var(--my) * 2px)); transition: transform .3s ease-out; }
.orejas-giro { transform: translateX(calc(var(--mx) * -6px)); transition: transform .5s ease-out; }
.reflejos    { transform: translateX(calc(var(--mx) * -7px)); transition: transform .6s ease-out; }
/* Vueltas */
.envoltura.vuelta  { animation: vuelta 1.2s cubic-bezier(.45, 0, .2, 1); }
.envoltura.espaldas { animation: espaldas 2.6s cubic-bezier(.45, 0, .2, 1); }
@keyframes vuelta   { from { transform: rotateY(0); } to { transform: rotateY(360deg); } }
@keyframes espaldas { 0% { transform: rotateY(0); } 30%, 70% { transform: rotateY(180deg); } 100% { transform: rotateY(360deg); } }
svg.laica {
  width: 100%; height: auto; overflow: visible; display: block;
  --linea: #1F2A5A; --naranja: #F39A2B; --crema: #FFF6EA; --rosa: #F4A3A8;
  --traje: #F5F7FF; --panel: #C9D3F2; --cristal: rgba(176, 222, 255, .32);
  --led: #3BA8FF; --halo: transparent;
}
svg.laica g, svg.laica circle, svg.laica ellipse, svg.laica rect, svg.laica path { transform-box: view-box; }

/* Orígenes de rotación (coordenadas del viewBox) */
.cuerpo-entero { transform-origin: 150px 200px; }
.brazo-i { transform-origin: 114px 220px; transform: rotate(38deg); }
.brazo-d { transform-origin: 186px 220px; transform: rotate(-12deg); }
.cabeza  { transform-origin: 150px 190px; }
.oreja-i { transform-origin: 112px 96px; }
.oreja-d { transform-origin: 188px 96px; }
.cola    { transform-origin: 190px 286px; }
.ojos    { transform-origin: 150px 134px; }
.casco   { transform-origin: 150px 128px; }
.pierna-i { transform-origin: 128px 266px; }
.pierna-d { transform-origin: 172px 266px; }

/* Elementos ocultos por defecto */
.ojos-cerrados, .cejas, .boca-abierta, .boca-preocupada, .sudor, .zzz, .destellos, .simbolo-rad { opacity: 0; transition: opacity .3s; }
.led  { fill: var(--led); transition: fill .3s; }
.halo { stroke: var(--halo); opacity: 0; }

/* ---------- Animaciones base (siempre activas) ---------- */
.cuerpo-entero { animation: flotar 4s ease-in-out infinite; }
.ojos          { animation: parpadear 5s infinite; }
.cola          { animation: menear 1.2s ease-in-out infinite; }
.oreja-i       { animation: oreja 6s ease-in-out infinite; }
.oreja-d       { animation: oreja 6s ease-in-out infinite reverse; }

@keyframes flotar   { 0%,100% { transform: translateY(0) rotate(-2deg); } 50% { transform: translateY(-10px) rotate(2deg); } }
@keyframes parpadear{ 0%,92%,100% { transform: scaleY(1); } 95% { transform: scaleY(.1); } }
@keyframes menear   { 0%,100% { transform: rotate(-12deg); } 50% { transform: rotate(14deg); } }
@keyframes oreja    { 0%,85%,100% { transform: rotate(0); } 90% { transform: rotate(-8deg); } 95% { transform: rotate(4deg); } }

/* ---------- saludar ---------- */
.e-saludar .brazo-i { animation: saludo .55s ease-in-out infinite alternate; }
@keyframes saludo { from { transform: rotate(10deg); } to { transform: rotate(55deg); } }
.e-saludar .cabeza { animation: ladear 1.1s ease-in-out infinite alternate; }
@keyframes ladear { from { transform: rotate(-4deg); } to { transform: rotate(4deg); } }

/* ---------- hablar ---------- */
.e-hablar .boca-sonrisa { opacity: 0; }
.e-hablar .boca-abierta { opacity: 1; animation: hablar .32s ease-in-out infinite alternate; transform-origin: 150px 166px; }
@keyframes hablar { from { transform: scaleY(.25); } to { transform: scaleY(1); } }
.e-hablar .brazo-d { animation: gesto 1.4s ease-in-out infinite alternate; }
@keyframes gesto { from { transform: rotate(-12deg); } to { transform: rotate(-40deg); } }

/* ---------- celebrar ---------- */
svg.laica.e-celebrar { --led: #34D27B; }
.e-celebrar .cuerpo-entero { animation: celebrar 1.6s ease-in-out infinite; }
@keyframes celebrar {
  0% { transform: translateY(0) rotate(0); } 30% { transform: translateY(-34px) rotate(-8deg); }
  60% { transform: translateY(-34px) rotate(352deg); } 100% { transform: translateY(0) rotate(360deg); }
}
.e-celebrar .brazo-i { transform: rotate(70deg); }
.e-celebrar .brazo-d { transform: rotate(-70deg); }
.e-celebrar .boca-sonrisa { opacity: 0; }
.e-celebrar .boca-abierta { opacity: 1; }
.e-celebrar .destellos { opacity: 1; animation: titilar .8s ease-in-out infinite alternate; transform-origin: 150px 170px; }
@keyframes titilar { from { transform: scale(.85); opacity: .5; } to { transform: scale(1.08); opacity: 1; } }

/* ---------- ejercicio ---------- */
.e-ejercicio .cuerpo-entero { animation: rebote .7s ease-in-out infinite; }
@keyframes rebote { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-14px); } }
.e-ejercicio .brazo-i { animation: pesa-i .7s ease-in-out infinite; }
.e-ejercicio .brazo-d { animation: pesa-d .7s ease-in-out infinite; }
@keyframes pesa-i { 0%,100% { transform: rotate(-20deg); } 50% { transform: rotate(60deg); } }
@keyframes pesa-d { 0%,100% { transform: rotate(20deg); } 50% { transform: rotate(-60deg); } }
.e-ejercicio .pierna-i { animation: patada .7s ease-in-out infinite; }
.e-ejercicio .pierna-d { animation: patada .7s ease-in-out infinite reverse; }
@keyframes patada { 0%,100% { transform: rotate(-8deg); } 50% { transform: rotate(8deg); } }
svg.laica.e-ejercicio { --led: #34D27B; }

/* ---------- respirar (respiración en caja 4-4-4-4 = 16 s) ---------- */
.e-respirar .cuerpo-entero { animation: respirar 16s ease-in-out infinite; }
@keyframes respirar {
  0%   { transform: scale(1); }      /* inhala 4 s */
  25%  { transform: scale(1.12); }   /* sostén 4 s */
  50%  { transform: scale(1.12); }   /* exhala 4 s */
  75%  { transform: scale(1); }      /* sostén 4 s */
  100% { transform: scale(1); }
}
.e-respirar .ojos { opacity: 0; animation: none; }
.e-respirar .ojos-cerrados { opacity: 1; }
svg.laica.e-respirar { --led: #7FD1FF; }
.e-respirar .cola { animation-duration: 4s; }

/* ---------- dormir ---------- */
.e-dormir .cuerpo-entero { animation: flotar 7s ease-in-out infinite; }
.e-dormir .ojos { opacity: 0; animation: none; }
.e-dormir .ojos-cerrados { opacity: 1; }
.e-dormir .boca-sonrisa { opacity: .5; }
.e-dormir .cola { animation: none; }
.e-dormir .brazo-i { transform: rotate(-5deg); }
.e-dormir .cabeza { transform: rotate(-8deg); }
.e-dormir .zzz { opacity: 1; animation: zzz 3s ease-in-out infinite; }
@keyframes zzz { 0% { transform: translate(0,10px); opacity: 0; } 30% { opacity: 1; } 100% { transform: translate(8px,-16px); opacity: 0; } }
svg.laica.e-dormir { --led: #2B3A7A; }

/* ---------- alerta (amarilla) ---------- */
svg.laica.e-alerta { --led: #FFB020; --halo: #FFB020; }
.e-alerta .halo { animation: halo 1.6s ease-in-out infinite; }
.e-alerta .led  { animation: led 1s steps(2) infinite; }
.e-alerta .cejas, .e-alerta .boca-preocupada { opacity: 1; }
.e-alerta .boca-sonrisa { opacity: 0; }
.e-alerta .cabeza { transform: rotate(-7deg); }
.e-alerta .oreja-i, .e-alerta .oreja-d { animation: none; transform: rotate(10deg); }
.e-alerta .brazo-d { animation: senalar 1.2s ease-in-out infinite alternate; }
@keyframes senalar { from { transform: rotate(-30deg); } to { transform: rotate(-55deg); } }

/* ---------- urgente (roja) ---------- */
svg.laica.e-urgente { --led: #FF3B3B; --halo: #FF3B3B; }
.e-urgente .halo { animation: halo .7s ease-in-out infinite; }
.e-urgente .led  { animation: led .4s steps(2) infinite; }
.e-urgente .cuerpo-entero { animation: temblar .35s linear infinite; }
@keyframes temblar { 0%,100% { transform: translateX(0); } 25% { transform: translateX(-5px) rotate(-1deg); } 75% { transform: translateX(5px) rotate(1deg); } }
.e-urgente .cejas, .e-urgente .boca-abierta, .e-urgente .sudor { opacity: 1; }
.e-urgente .boca-sonrisa { opacity: 0; }
.e-urgente .cola { animation: none; }
.e-urgente .brazo-i { transform: rotate(70deg); }
.e-urgente .brazo-d { transform: rotate(-70deg); }

/* ---------- radiación (evento solar: ir al refugio) ---------- */
svg.laica.e-radiacion { --led: #B266FF; --halo: #B266FF; }
.e-radiacion .halo { animation: halo 1s ease-in-out infinite; }
.e-radiacion .led  { animation: led .6s steps(2) infinite; }
.e-radiacion .simbolo-rad { opacity: 1; animation: girar 3s linear infinite; }
.simbolo-rad { transform: translate(250px, 60px); }
@keyframes girar { from { transform: translate(250px,60px) rotate(0); } to { transform: translate(250px,60px) rotate(360deg); } }
.e-radiacion .cejas, .e-radiacion .boca-preocupada { opacity: 1; }
.e-radiacion .boca-sonrisa { opacity: 0; }
.e-radiacion .brazo-i { transform: rotate(-5deg); }
.e-radiacion .brazo-d { transform: rotate(5deg); }
.e-radiacion .cuerpo-entero { animation: encoger 2s ease-in-out infinite; }
@keyframes encoger { 0%,100% { transform: scale(1) translateY(0); } 50% { transform: scale(.93) translateY(6px); } }

@keyframes halo { 0%,100% { opacity: .15; } 50% { opacity: .85; } }
@keyframes led  { 0% { opacity: 1; } 100% { opacity: .25; } }

/* Accesibilidad: sin movimiento si el usuario lo pide */
/* ---------- Andar y postura en cuatro patas (atributos andar y patas="cuatro") ---------- */
/* En dos patas: pisadas alternas (de frente, una rodilla sube y la otra apoya), balanceo y brazos. */
svg.laica.andando .cuerpo-entero { animation: balanceo .9s ease-in-out infinite; }
svg.laica.andando .pierna-i { animation: pisada .9s ease-in-out infinite; }
svg.laica.andando .pierna-d { animation: pisada .9s ease-in-out infinite -.45s; }
svg.laica.andando .brazo-i { animation: braceo-i .9s ease-in-out infinite; }
svg.laica.andando .brazo-d { animation: braceo-d .9s ease-in-out infinite; }
svg.laica.andando .cola { animation-duration: .45s; }
@keyframes balanceo { 0%,100% { transform: translateY(0) rotate(-3deg); } 25%,75% { transform: translateY(-5px) rotate(0); } 50% { transform: translateY(0) rotate(3deg); } }
@keyframes pisada   { 0%,50%,100% { transform: translateY(0) scaleY(1); } 25% { transform: translateY(-13px) scaleY(.86); } }
@keyframes braceo-i { 0%,100% { transform: rotate(-70deg); } 50% { transform: rotate(-45deg); } }
@keyframes braceo-d { 0%,100% { transform: rotate(45deg); } 50% { transform: rotate(70deg); } }

/* En cuatro patas: baja el cuerpo, recoge las piernas (patas traseras) y apoya los brazos
   en el suelo como patas delanteras. Al andar, trota en diagonal. */
svg.laica.p-cuatro .cuerpo-entero { animation: cuatro-respira 2.4s ease-in-out infinite; }
svg.laica.p-cuatro .piernas { transform-origin: 150px 266px; transform: scaleY(.55); }
svg.laica.p-cuatro .brazo-i { transform: translateY(14px) rotate(-90deg); animation: none; }
svg.laica.p-cuatro .brazo-d { transform: translateY(14px) rotate(90deg); animation: none; }
svg.laica.p-cuatro .pierna-i, svg.laica.p-cuatro .pierna-d { animation: none; }
svg.laica.p-cuatro .cola { animation-duration: .5s; }
svg.laica.p-cuatro .cabeza { transform: translateY(12px); animation: none; }
@keyframes cuatro-respira { 0%,100% { transform: translateY(28px); } 50% { transform: translateY(26px); } }

svg.laica.p-cuatro.andando .cuerpo-entero { animation: trote-bote .5s ease-in-out infinite; }
svg.laica.p-cuatro.andando .brazo-i  { animation: trote-i 1s ease-in-out infinite; }
svg.laica.p-cuatro.andando .brazo-d  { animation: trote-d 1s ease-in-out infinite -.5s; }
svg.laica.p-cuatro.andando .pierna-d { animation: pisada 1s ease-in-out infinite; }
svg.laica.p-cuatro.andando .pierna-i { animation: pisada 1s ease-in-out infinite -.5s; }
svg.laica.p-cuatro.andando .cola { animation-duration: .3s; }
@keyframes trote-bote { 0%,100% { transform: translateY(28px) rotate(-1.5deg); } 50% { transform: translateY(23px) rotate(1.5deg); } }
@keyframes trote-i { 0%,50%,100% { transform: translateY(14px) rotate(-90deg); } 25% { transform: translateY(3px) rotate(-80deg); } }
@keyframes trote-d { 0%,50%,100% { transform: translateY(14px) rotate(90deg); } 25% { transform: translateY(3px) rotate(80deg); } }

/* ---------- Modo foto (diseño de Canva) ---------- */
.envoltura.foto-modo { transform: rotateY(calc(var(--mx) * 12deg)) rotateX(calc(var(--my) * -6deg)); }
.giro { width: 100%; transform-origin: 50% 90%; }
.giro.cambio { animation: f-cambio .16s ease-out; }
@keyframes f-cambio { 0% { transform: scaleX(.86); } 100% { transform: scaleX(1); } }
.foto {
  position: relative; width: 100%; aspect-ratio: 300 / 340; transform-origin: 50% 92%;
  filter: drop-shadow(0 6px 8px rgba(0, 0, 0, .35));
  animation: f-flotar 4s ease-in-out infinite;
}
.foto img {
  position: absolute; inset: 0; width: 100%; height: 100%; object-fit: contain; object-position: 50% 100%;
  opacity: 0; transition: opacity .08s linear; pointer-events: none; user-select: none; -webkit-user-drag: none;
}
.foto img.activa { opacity: 1; }
.foto canvas.rig { position: absolute; left: -18%; top: -18%; width: 136%; height: 136%; pointer-events: none; }
.foto.rig-on img { visibility: hidden; }
.foto-modo { position: relative; }
/* Marca de agua visible: las imágenes de Laica se generaron con IA (regla de Space Apps). */
.marca-ia { position: absolute; left: 50%; bottom: 0; transform: translateX(-50%); white-space: nowrap; pointer-events: none;
  font: 600 max(9px, calc(var(--tam, 200px) * .045)) system-ui, sans-serif; color: #fff; background: rgba(7, 23, 63, .62);
  padding: .15em .6em; border-radius: 1em; letter-spacing: .02em; }
.foto.rig-on.andando, .foto.rig-on.ladra { animation: none; }
.fx { position: absolute; opacity: 0; pointer-events: none; font-weight: 800; line-height: 1; transition: opacity .3s; }
.fx.zzz { top: 4%; right: 6%; color: #fff; font-size: calc(var(--tam) * .1); text-shadow: 0 2px 0 #1F2A5A; }
.fx.zzz i { font-style: normal; font-size: .7em; margin-left: .1em; }
.fx.destellos { inset: 0; color: #FFD447; font-size: calc(var(--tam) * .09); text-shadow: 0 0 6px #fff8; }
.fx.destellos b { position: absolute; }
.fx.rad { top: 2%; right: 2%; font-size: calc(var(--tam) * .14); color: #c084fc; text-shadow: 0 0 8px #a855f7; }
.fx.sudor { top: 20%; right: 22%; font-size: calc(var(--tam) * .08); }

@keyframes f-flotar   { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
@keyframes f-hablar   { from { transform: scale(1, 1); } to { transform: scale(1.025, .975); } }
@keyframes f-saltar   { 0%,100% { transform: translateY(0) scale(1, 1); } 15% { transform: translateY(0) scale(1.06, .92); } 50% { transform: translateY(-30px) scale(.97, 1.04); } 85% { transform: translateY(0) scale(1.05, .94); } }
@keyframes f-rebote   { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-14px); } }
@keyframes f-respirar { 0%,100% { transform: scale(1); } 25%,50% { transform: scale(1.05); } 75% { transform: scale(1); } }
@keyframes f-temblar  { 0%,100% { transform: translateX(0); } 25% { transform: translateX(-3px); } 75% { transform: translateX(3px); } }
@keyframes f-trote    { 0%,100% { transform: translateY(0) rotate(-2deg); } 50% { transform: translateY(-8px) rotate(2deg); } }
@keyframes f-ladra    { 0%,100% { transform: translateY(0) scale(1); } 35% { transform: translateY(-5px) scale(1.05, .97); } }
@keyframes f-girar-rad { to { transform: rotate(360deg); } }
@keyframes f-brillo-ambar  { 0%,100% { filter: drop-shadow(0 0 4px #f5b30188); } 50% { filter: drop-shadow(0 0 16px #f5b301); } }
@keyframes f-brillo-rojo   { 0%,100% { filter: drop-shadow(0 0 6px #ff3b3b99); } 50% { filter: drop-shadow(0 0 20px #ff3b3b); } }
@keyframes f-brillo-violeta { 0%,100% { filter: drop-shadow(0 0 6px #a855f799); } 50% { filter: drop-shadow(0 0 20px #a855f7); } }

.foto.e-hablar    { animation: f-flotar 4s ease-in-out infinite, f-hablar .45s ease-in-out infinite alternate; }
.foto.e-celebrar  { animation: f-saltar 1s ease-in-out infinite; filter: drop-shadow(0 0 12px #34d27b); }
.foto.e-ejercicio { animation: f-rebote .7s ease-in-out infinite; }
.foto.e-respirar  { animation: f-respirar 16s ease-in-out infinite; filter: drop-shadow(0 0 12px #5ec8ff); }
.foto.e-dormir    { animation: f-flotar 6s ease-in-out infinite; filter: brightness(.78) saturate(.85) drop-shadow(0 6px 8px rgba(0,0,0,.35)); }
.foto.e-alerta    { animation: f-flotar 4s ease-in-out infinite, f-brillo-ambar 1.6s ease-in-out infinite; }
.foto.e-urgente   { animation: f-temblar .16s linear infinite, f-brillo-rojo .7s ease-in-out infinite; }
.foto.e-radiacion { animation: f-brillo-violeta 1.2s ease-in-out infinite; transform: scale(.94); }
.foto.andando     { animation: f-trote .36s ease-in-out infinite; }
.foto.ladra       { animation: f-ladra .28s ease-out; }
.foto.e-dormir .zzz, .foto.e-celebrar .destellos, .foto.e-radiacion .rad, .foto.e-urgente .sudor { opacity: 1; }
.foto.e-radiacion .rad { animation: f-girar-rad 3s linear infinite; }

@media (prefers-reduced-motion: reduce) {
  .foto, .giro, .fx { animation: none !important; }
  .foto img { transition: none; }
  svg.laica.p-cuatro .cuerpo-entero { transform: translateY(28px); }
  svg.laica *, svg.laica .cuerpo-entero, .envoltura { animation: none !important; }
  .envoltura, .cara-giro, .cabeza-giro, .pupilas, .orejas-giro, .reflejos { transition: none !important; }
  .halo { opacity: .6 !important; }
}
`;

  // ---------- Esqueleto sobre las fotos (modo foto) ----------
  // Cada foto de Canva se dibuja en WebGL sobre una malla. Varias "zonas" con un pivote (orejas,
  // mandíbula, nariz, cabeza, muñecas, cada pata, cola, mochila, torso) deforman la malla con
  // pesos suaves, así cada parte se mueve sola sin cortar la imagen. Coordenadas en píxeles de
  // las imágenes originales de 1254 px (el recorte de las .webp es x 19..1220, y 2..1235).
  // [nombre, centro x, centro y, radio x, radio y, pivote x, pivote y]
  const RIG = {
    frente: { dir: 0, zonas: [
      ["mandibula", 650, 468, 95, 42, 650, 420], ["nariz", 645, 322, 48, 38, 645, 322],
      ["oreja1", 450, 250, 75, 95, 495, 195], ["oreja2", 805, 215, 75, 85, 760, 175],
      ["cabeza", 632, 300, 310, 265, 632, 540],
      ["muneca1", 535, 1095, 85, 55, 530, 1045], ["muneca2", 740, 1095, 85, 55, 735, 1045],
      ["pata1", 525, 960, 90, 175, 520, 820], ["pata2", 725, 960, 90, 175, 725, 820],
      ["pataT1", 390, 1050, 80, 90, 420, 980], ["pataT2", 880, 1050, 80, 90, 850, 980],
      ["cola", 285, 965, 120, 150, 380, 1010],
      ["torso", 630, 620, 420, 560, 630, 1060], ["cuerpo", 630, 640, 700, 700, 630, 1150],
    ] },
    derecha: { dir: 1, zonas: [
      ["mandibula", 885, 400, 100, 40, 830, 372], ["nariz", 945, 272, 42, 36, 945, 272],
      ["oreja1", 860, 180, 80, 70, 810, 165], ["oreja2", 590, 250, 75, 95, 640, 200],
      ["cabeza", 700, 300, 310, 260, 700, 540],
      ["muneca1", 790, 1110, 105, 50, 770, 1060], ["muneca2", 965, 1095, 85, 50, 950, 1050],
      ["pata1", 730, 980, 95, 170, 700, 860], ["pata2", 915, 1000, 80, 140, 880, 880],
      ["pataT1", 560, 1030, 120, 120, 520, 900],
      ["cola", 260, 955, 150, 165, 430, 1010], ["mochila", 390, 650, 95, 160, 450, 640],
      ["torso", 680, 620, 430, 560, 560, 1050], ["cuerpo", 620, 640, 700, 700, 620, 1150],
    ] },
    izquierda: { dir: -1, zonas: [
      ["mandibula", 355, 410, 100, 40, 420, 375], ["nariz", 330, 290, 42, 36, 330, 290],
      ["oreja1", 380, 190, 75, 85, 420, 170], ["oreja2", 610, 230, 75, 95, 580, 190],
      ["cabeza", 520, 300, 310, 260, 520, 540],
      ["muneca1", 400, 1110, 100, 50, 410, 1060], ["muneca2", 265, 1085, 85, 50, 285, 1045],
      ["pata1", 440, 980, 95, 170, 450, 860], ["pata2", 300, 1000, 80, 140, 330, 890],
      ["pataT1", 650, 1040, 120, 110, 690, 910],
      ["cola", 940, 960, 150, 165, 800, 1010], ["mochila", 790, 630, 95, 160, 730, 620],
      ["torso", 540, 620, 430, 560, 660, 1050], ["cuerpo", 600, 640, 700, 700, 600, 1150],
    ] },
    espalda: { dir: 0, espalda: true, zonas: [
      ["oreja1", 480, 290, 85, 110, 525, 195], ["oreja2", 775, 290, 85, 110, 730, 195],
      ["cabeza", 630, 270, 300, 250, 630, 500], ["mochila", 630, 640, 150, 180, 630, 520],
      ["cola", 630, 1040, 160, 175, 630, 880],
      ["pataT1", 370, 1050, 80, 80, 400, 990], ["pataT2", 890, 1050, 80, 80, 860, 990],
      ["torso", 630, 600, 420, 560, 630, 1050], ["cuerpo", 630, 640, 700, 700, 630, 1150],
    ] },
    saludando: { dir: 0, zonas: [
      ["mandibula", 740, 455, 90, 40, 740, 410], ["nariz", 712, 312, 42, 36, 712, 312],
      ["oreja1", 480, 255, 75, 95, 520, 200], ["oreja2", 820, 175, 70, 75, 780, 150],
      ["cabeza", 640, 290, 310, 265, 650, 560],
      ["mano", 1035, 410, 90, 95, 985, 485], ["brazo", 950, 540, 140, 170, 880, 650],
      ["muneca1", 590, 1105, 90, 50, 590, 1055], ["pata1", 600, 980, 90, 160, 590, 850],
      ["pataT1", 880, 1075, 90, 70, 850, 1010],
      ["cola", 220, 1000, 150, 160, 390, 1040], ["mochila", 350, 700, 90, 150, 410, 700],
      ["torso", 640, 620, 420, 560, 640, 1060], ["cuerpo", 640, 640, 700, 700, 640, 1150],
    ] },
    // Poses de perfil con su propia foto (coordenadas en píxeles de esa foto): caminando y saltando.
    // Las versiones "-i" usan la misma foto en espejo para ir hacia la izquierda.
    andando: { dir: 1, foto: [864, 703], zonas: [
      ["mandibula", 770, 290, 70, 35, 720, 270], ["oreja1", 610, 150, 60, 65, 630, 110],
      ["cabeza", 660, 200, 220, 190, 560, 360],
      ["muneca1", 730, 640, 75, 45, 690, 600], ["pata1", 640, 540, 110, 150, 560, 430],
      ["pata2", 520, 580, 60, 90, 510, 480],
      ["pataT1", 180, 560, 110, 120, 250, 450], ["pataT2", 370, 580, 70, 90, 350, 480],
      ["cola", 130, 290, 130, 120, 270, 320], ["mochila", 370, 265, 100, 55, 420, 290],
      ["torso", 430, 400, 330, 260, 430, 600], ["cuerpo", 430, 360, 600, 600, 430, 690],
    ] },
    saltando: { dir: 1, foto: [884, 634], zonas: [
      ["mandibula", 790, 300, 60, 30, 750, 280], ["oreja1", 650, 130, 60, 60, 680, 95],
      ["cabeza", 700, 210, 220, 200, 600, 370],
      ["pata1", 700, 530, 150, 80, 590, 450], ["pata2", 820, 520, 70, 50, 760, 470],
      ["pataT1", 140, 480, 130, 90, 260, 430], ["pataT2", 250, 540, 90, 80, 300, 460],
      ["cola", 150, 230, 150, 110, 290, 290], ["mochila", 420, 255, 100, 55, 470, 280],
      ["torso", 450, 380, 350, 230, 450, 560], ["cuerpo", 450, 330, 620, 600, 450, 630],
    ] },
  };
  RIG["andando-i"] = { ...RIG.andando, espejo: true, img: "andando" };
  RIG["saltando-i"] = { ...RIG.saltando, espejo: true, img: "saltando" };
  // Orden: primero las partes pequeñas, después las que las cargan (cabeza, torso, cuerpo).
  const ORDEN = ["mandibula", "nariz", "oreja1", "oreja2", "cabeza", "mano", "brazo", "muneca1", "muneca2",
    "pata1", "pata2", "pataT1", "pataT2", "cola", "mochila", "torso", "cuerpo"];
  const RECORTE = { x: 19, y: 2, w: 1201, h: 1233 }, MARGEN = 0.18, MALLA = 40;
  // Rectángulo de la foto de cada vista, en sus propios píxeles.
  const rectDe = (def) => (def.foto ? { x: 0, y: 0, w: def.foto[0], h: def.foto[1] } : RECORTE);
  const suave = (x) => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x));
  const hacia = (v, meta, dt, vel) => v + (meta - v) * Math.min(1, dt * vel);

  class Esqueleto {
    constructor(lienzo, imgs, host) {
      this.c = lienzo; this.host = host; this.imgs = imgs;
      const gl = lienzo.getContext("webgl2", { premultipliedAlpha: true, antialias: true })
        || lienzo.getContext("webgl", { premultipliedAlpha: true, antialias: true });
      if (!gl) throw new Error("sin WebGL");
      this.gl = gl; this.gl2 = typeof WebGL2RenderingContext !== "undefined" && gl instanceof WebGL2RenderingContext;
      const sh = (tipo, src) => { const s = gl.createShader(tipo); gl.shaderSource(s, src); gl.compileShader(s); return s; };
      const pr = gl.createProgram();
      gl.attachShader(pr, sh(gl.VERTEX_SHADER, "attribute vec2 p;attribute vec2 t;varying vec2 v;void main(){gl_Position=vec4(p,0.,1.);v=t;}"));
      gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, "precision mediump float;uniform sampler2D s;varying vec2 v;void main(){gl_FragColor=texture2D(s,v);}"));
      gl.linkProgram(pr);
      if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) throw new Error("shader");
      gl.useProgram(pr);
      gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
      // Malla: texcoords fijas, posiciones nuevas en cada cuadro.
      const n = MALLA + 1;
      this.n = n;
      const tc = new Float32Array(n * n * 2);
      for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
        const k = (j * n + i) * 2; tc[k] = i / MALLA; tc[k + 1] = j / MALLA;
      }
      // Malla en reposo de cada vista, sobre el rectángulo de su foto.
      this.reposos = {};
      for (const [vista, def] of Object.entries(RIG)) {
        const R = rectDe(def), a = new Float32Array(n * n * 2);
        for (let k = 0; k < n * n; k++) { a[k * 2] = R.x + tc[k * 2] * R.w; a[k * 2 + 1] = R.y + tc[k * 2 + 1] * R.h; }
        this.reposos[vista] = a;
      }
      const idx = new Uint16Array(MALLA * MALLA * 6);
      let q = 0;
      for (let j = 0; j < MALLA; j++) for (let i = 0; i < MALLA; i++) {
        const a = j * n + i, b = a + 1, c = a + n, d = c + 1;
        idx.set([a, b, c, b, d, c], q); q += 6;
      }
      this.nIdx = idx.length;
      const bt = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, bt); gl.bufferData(gl.ARRAY_BUFFER, tc, gl.STATIC_DRAW);
      const lt = gl.getAttribLocation(pr, "t"); gl.enableVertexAttribArray(lt); gl.vertexAttribPointer(lt, 2, gl.FLOAT, false, 0, 0);
      this.bp = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, this.bp);
      this.pos = new Float32Array(n * n * 2);
      gl.bufferData(gl.ARRAY_BUFFER, this.pos, gl.DYNAMIC_DRAW);
      const lp = gl.getAttribLocation(pr, "p"); gl.enableVertexAttribArray(lp); gl.vertexAttribPointer(lp, 2, gl.FLOAT, false, 0, 0);
      const bi = gl.createBuffer(); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, bi); gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, idx, gl.STATIC_DRAW);
      // Pesos de cada zona para cada vértice (en reposo), por vista.
      this.pesos = {};
      for (const [vista, def] of Object.entries(RIG)) {
        this.pesos[vista] = def.zonas.map(([, cx, cy, rx, ry]) => {
          const w = new Float32Array(n * n);
          const rp = this.reposos[vista];
          for (let k = 0; k < n * n; k++) {
            const dx = (rp[k * 2] - cx) / rx, dy = (rp[k * 2 + 1] - cy) / ry;
            const e = Math.sqrt(dx * dx + dy * dy);
            w[k] = e <= 1 ? 1 : suave(1 - (e - 1) / 0.45);
          }
          return w;
        });
      }
      this.tex = {};
      // Estado animado (todo se suaviza para que no haya saltos).
      this.t = 0; this.fase = 0; this.paso = 0; this.boca = 0.4; this.parada = 0; this.rastreo = 0; this.olfato = 0;
      this.golpe = 0; this.orejas = [{ a: 0, w: 0 }, { a: 0, w: 0 }]; this.proxTic = 2; this.bobPrevio = 0; this.velBob = 0;
    }

    // Sube la foto de una vista a la GPU (falla si la imagen es de otro origen).
    _textura(vista) {
      vista = RIG[vista]?.img || vista;
      if (this.tex[vista]) return this.tex[vista];
      const img = this.imgs[vista];
      if (!img || !img.complete || !img.naturalWidth) return null;
      const gl = this.gl, t = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, t);
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      if (this.gl2) { gl.generateMipmap(gl.TEXTURE_2D); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR); }
      else gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      this.tex[vista] = t;
      return t;
    }

    // Postura de cada zona en este instante: ángulo (rad), desplazamiento (px) y escala.
    _pose(dt, vista) {
      const h = this.host, e = h.estado, def = RIG[vista], dir = def.dir, quieto = h._sinMovimiento;
      const P = {};
      const z = (n) => (P[n] || (P[n] = { a: 0, x: 0, y: 0, sx: 1, sy: 1 }));
      if (quieto) return P;
      const t = (this.t += dt), TAU = Math.PI * 2, gesto = h.getAttribute("gesto");
      const andando = h.hasAttribute("andar"), cuatro = h.getAttribute("patas") === "cuatro";
      // Paso: cuánto camina (sube y baja suave al arrancar y frenar).
      const salto = vista.startsWith("saltando");
      const metaPaso = andando ? 1 : salto ? 0.55 : e === "ejercicio" ? 0.7 : 0;
      this.paso = hacia(this.paso, metaPaso, dt, 5);
      const frec = salto ? 1.4 : andando ? (cuatro ? 3.2 : 2.6) : 2;
      this.fase += dt * TAU * frec * Math.max(0.3, this.paso);
      const w = this.paso, f = this.fase;
      this.parada = hacia(this.parada, gesto === "parada" ? 1 : 0, dt, 3.2);
      this.rastreo = hacia(this.rastreo, gesto === "rastrear" ? 1 : 0, dt, 3);
      this.olfato = hacia(this.olfato, gesto === "oler" || gesto === "rastrear" ? 1 : 0, dt, 6);
      this.golpe *= Math.exp(-dt * 5);
      this.cuatro = hacia(this.cuatro || 0, cuatro && gesto !== "parada" ? 1 : 0, dt, 3);
      const p = this.parada, r = this.rastreo, q4 = this.cuatro;

      // Patas, pata por pata: se balancean, se levantan al ir hacia adelante y doblan la muñeca.
      const lado = dir !== 0;
      const pata = (n, m, off, amp, alza) => {
        const s = Math.sin(f + off), c = Math.cos(f + off), sube = Math.max(0, c);
        if (lado) { z(n).a += -dir * w * amp * s; z(n).y += -w * alza * sube; if (m) z(m).a += dir * w * 0.45 * sube; }
        else { z(n).y += -w * alza * 1.3 * Math.max(0, s); if (m) z(m).a += (n === "pata1" ? -1 : 1) * w * 0.25 * Math.max(0, s); }
      };
      pata("pata1", "muneca1", 0, 0.3, 20);
      pata("pata2", "muneca2", Math.PI, 0.3, 20);
      pata("pataT1", null, Math.PI / 2, 0.22, 14);
      pata("pataT2", null, Math.PI * 1.5, 0.22, 14);

      // Cuerpo: respira, rebota al andar y se balancea.
      const resp = e === "dormir" ? 0.03 * Math.sin(TAU * t / 5) : 0.012 * Math.sin(TAU * t / 3.4);
      const bob = w * 10 * (1 - Math.cos(2 * f)) / 2;
      z("cuerpo").sy = 1 + resp; z("cuerpo").y = -bob;
      z("cuerpo").a = lado ? dir * w * 0.02 * Math.sin(2 * f) : w * 0.03 * Math.sin(f);
      const velBob = (bob - this.bobPrevio) / Math.max(dt, 1e-3);
      const acel = (velBob - this.velBob) / Math.max(dt, 1e-3);
      this.bobPrevio = bob; this.velBob = velBob;
      z("mochila").y = w * 5 * Math.sin(2 * f - 1.2);

      // Cabeza: se mece, sigue el paso con retraso, olfatea, rastrea el suelo, ladra hacia arriba.
      const cab = z("cabeza");
      cab.a = 0.03 * Math.sin(TAU * t / 4.3) + w * 0.04 * Math.sin(2 * f - 0.6);
      cab.y = w * 4 * Math.sin(2 * f - 0.8);
      if (e === "dormir") { cab.a += lado ? dir * 0.1 : 0; cab.y += 14; }
      if (e === "hablar") cab.a += 0.025 * Math.sin(TAU * t * 2.2);
      const oler = gesto === "oler" ? 1 : 0;
      if (lado) cab.a += dir * (0.12 * oler + 0.3 * r) + r * 0.06 * Math.sin(TAU * t * 0.8);
      else { cab.y += 18 * oler + 36 * r; cab.a += r * 0.12 * Math.sin(TAU * t * 0.7); }
      cab.a += (lado ? -dir : 0) * 0.2 * this.golpe; cab.y -= (lado ? 10 : 18) * this.golpe;
      z("cuerpo").sy -= 0.035 * this.golpe; // el ladrido sacude todo el cuerpo

      // Boca: abre y cierra (jadea, habla, ladra); dormida la cierra.
      let metaBoca = 0.35 + 0.15 * Math.sin(TAU * t * 1.2);
      if (e === "hablar") metaBoca = 0.5 + 0.5 * Math.sin(TAU * t * 4);
      else if (e === "celebrar" || e === "ejercicio" || w > 0.3) metaBoca = 0.55 + 0.35 * Math.sin(TAU * t * 3.5);
      else if (e === "dormir") metaBoca = 0;
      else if (["alerta", "urgente", "radiacion", "respirar"].includes(e)) metaBoca = 0.15;
      if (this.olfato > 0.5) metaBoca = 0.05;
      const forzada = h._boca;
      if (forzada != null) metaBoca = forzada;
      this.boca = hacia(this.boca, Math.max(metaBoca, this.golpe), dt, 14);
      const ab = this.boca - 0.4;
      if (lado) z("mandibula").a = dir * ab * 0.75; else { z("mandibula").y = ab * 55; z("mandibula").sy = 1 + ab * 0.35; }

      // Nariz: olfatea en ráfagas rápidas.
      const raf = this.olfato * Math.max(0, Math.sin(TAU * t * 7)) * (Math.sin(TAU * t * 0.9) > -0.3 ? 1 : 0);
      z("nariz").sx = z("nariz").sy = 1 + 0.08 * raf;
      z("nariz").y = -3 * raf;

      // Orejas: resortes que rebotan con el paso y los golpes; se aplastan con alertas.
      let metaOreja = 0;
      if (e === "alerta") metaOreja = 0.25; else if (e === "urgente" || e === "radiacion") metaOreja = 0.38;
      else if (e === "dormir") metaOreja = 0.2; else if (e === "celebrar") metaOreja = -0.12;
      if (this.olfato > 0.5) metaOreja = -0.08;
      this.proxTic -= dt;
      const tic = this.proxTic <= 0 && e !== "dormir";
      if (tic) this.proxTic = 2 + Math.random() * 4;
      this.orejas.forEach((o, i) => {
        const s = i === 0 ? -1 : 1;
        o.w += (-90 * (o.a - metaOreja) - 7 * o.w - acel * 0.0035 + (e === "celebrar" ? 6 * Math.sin(TAU * t * 2) : 0)) * dt;
        if (tic && (i === 0 ? Math.random() < 0.7 : Math.random() < 0.5)) o.w += (Math.random() * 2 - 1) * 5;
        o.a += o.w * dt;
        z("oreja" + (i + 1)).a = s * o.a;
      });

      // Cola: mueve más o menos según el ánimo; con miedo, metida.
      const COLA = { reposo: [0.3, 1.8], saludar: [0.45, 3], hablar: [0.3, 2.2], celebrar: [0.7, 5], ejercicio: [0.4, 3],
        respirar: [0.04, 0.6], dormir: [0, 1], alerta: [0.05, 1], urgente: [0.03, 6], radiacion: [0.03, 6] };
      const [amp, fc] = COLA[e] || COLA.reposo;
      const ampC = Math.max(amp, w * 0.4, r * 0.35);
      const metida = ["urgente", "radiacion"].includes(e) ? 1 : 0;
      const cola = z("cola");
      cola.a = ampC * Math.sin(TAU * t * Math.max(fc, w * 3)) + (def.espalda ? 0 : (dir || 1) * -0.3 * metida);
      if (def.espalda) cola.sy = 1 - 0.15 * metida;

      // Saludo: el brazo se mece y la mano dobla la muñeca con retraso.
      z("brazo").a = 0.25 * Math.sin(TAU * t * 2.2);
      z("mano").a = 0.35 * Math.sin(TAU * t * 2.2 - 0.8);

      // En dos patas: el torso sube y se echa atrás, las patas delanteras se levantan y cuelgan.
      if (p > 0.001) {
        const to = z("torso");
        to.y += -(lado ? 70 : 55) * p; to.a += (lado ? -dir * 0.15 : 0) * p + p * 0.03 * Math.sin(TAU * t * 0.7);
        for (const [n, m, s] of [["pata1", "muneca1", -1], ["pata2", "muneca2", 1]]) {
          if (lado) { z(n).y += -18 * p; z(m).a += dir * 0.3 * p; }
          else { z(n).y += -70 * p; z(m).a += s * 0.35 * p; }
        }
      }
      // Rastrear: se inclina hacia adelante con el hocico al suelo.
      if (r > 0.001 && lado) z("torso").a += dir * 0.08 * r;
      // En cuatro patas: el torso baja y se inclina hacia adelante, las patas delanteras se adelantan
      // y la cabeza compensa para seguir mirando al frente.
      if (q4 > 0.001) {
        const to = z("torso");
        if (lado) {
          to.a += dir * 0.22 * q4; to.y += 34 * q4;
          cab.a += -dir * 0.16 * q4;
          z("pata1").a += -dir * 0.18 * q4; z("pata2").a += -dir * 0.12 * q4;
        } else {
          to.y += 48 * q4; to.sy *= 1 - 0.06 * q4; cab.y += 6 * q4;
        }
      }
      return P;
    }

    sacudir(f = 1) {
      this.orejas.forEach((o) => (o.w += (Math.random() < 0.5 ? -1 : 1) * 6 * f));
    }
    ladrido() { this.golpe = 1; this.sacudir(0.6); }

    dibujar(dt, vista) {
      const gl = this.gl, c = this.c;
      const tex = this._textura(vista);
      if (!tex) return false;
      const def = RIG[vista], P = this._pose(dt, vista), pesos = this.pesos[vista];
      const n2 = this.n * this.n, pos = this.pos, rep = this.reposos[vista], R = rectDe(def);
      // Rectángulo de la foto dentro del lienzo (la foto llena el ancho y se apoya abajo).
      const W = c.width / (1 + 2 * MARGEN), H = c.height / (1 + 2 * MARGEN);
      const altoFoto = W * (def.foto ? R.h / R.w : 739 / 720), x0 = MARGEN * W, y0 = MARGEN * H + H - altoFoto;
      const ex = W / R.w, ey = altoFoto / R.h;
      for (let k = 0; k < n2; k++) { pos[k * 2] = rep[k * 2]; pos[k * 2 + 1] = rep[k * 2 + 1]; }
      const zonas = def.zonas.map((zz, i) => [zz, pesos[i]]).sort((a, b) => ORDEN.indexOf(a[0][0]) - ORDEN.indexOf(b[0][0]));
      for (const [[nom, , , , , px, py], w] of zonas) {
        const q = P[nom];
        if (!q || (!q.a && !q.x && !q.y && q.sx === 1 && q.sy === 1)) continue;
        const co = Math.cos(q.a), si = Math.sin(q.a);
        for (let k = 0; k < n2; k++) {
          const peso = w[k];
          if (!peso) continue;
          const X = pos[k * 2], Y = pos[k * 2 + 1];
          const dx = (X - px) * q.sx, dy = (Y - py) * q.sy;
          const nx = px + co * dx - si * dy + q.x, ny = py + si * dx + co * dy + q.y;
          pos[k * 2] = X + (nx - X) * peso; pos[k * 2 + 1] = Y + (ny - Y) * peso;
        }
      }
      for (let k = 0; k < n2; k++) {
        let cx = x0 + (pos[k * 2] - R.x) * ex; const cy = y0 + (pos[k * 2 + 1] - R.y) * ey;
        if (def.espejo) cx = 2 * x0 + W - cx;
        pos[k * 2] = cx / c.width * 2 - 1; pos[k * 2 + 1] = 1 - cy / c.height * 2;
      }
      gl.viewport(0, 0, c.width, c.height);
      gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.bindBuffer(gl.ARRAY_BUFFER, this.bp); gl.bufferSubData(gl.ARRAY_BUFFER, 0, pos);
      gl.drawElements(gl.TRIANGLES, this.nIdx, gl.UNSIGNED_SHORT, 0);
      return true;
    }
  }

  class LaicaMascota extends HTMLElement {
    static get observedAttributes() { return ["estado", "tamano", "seguir", "curiosa", "andar", "patas", "gesto"]; }

    constructor() {
      super();
      this.attachShadow({ mode: "open" });
      this._alMover = (e) => this._seguirPuntero(e);
    }

    // Se arma al conectarse (ahí ya se pueden leer los atributos, como aspecto).
    _montar() {
      if (this._montado) return;
      this._montado = true;
      const root = this.shadowRoot;
      const fotos = this.getAttribute("aspecto") === "dibujo" ? null : recursos().fotos;
      if (fotos) {
        const imgs = VISTAS.map((v) => `<img data-v="${v}" src="${fotos[v]}" alt="" draggable="false" decoding="async">`).join("");
        root.innerHTML = `<style>${CSS}</style><div class="envoltura foto-modo"><div class="giro">
          <div class="foto" role="img" aria-label="Laica, la perrita astronauta">${imgs}<canvas class="rig" aria-hidden="true"></canvas>
            <span class="fx zzz">Z<i>z</i><i>z</i></span>
            <span class="fx destellos"><b style="left:6%;top:12%">✦</b><b style="right:8%;top:6%">✦</b><b style="right:2%;top:42%">✦</b><b style="left:2%;top:46%">✦</b></span>
            <span class="fx rad">☢</span><span class="fx sudor">💧</span>
          </div></div><span class="marca-ia">Imagen generada con IA</span></div>`;
        this._fotos = [...root.querySelectorAll(".foto img")];
        this._foto = root.querySelector(".foto");
        this._giro = root.querySelector(".giro");
        this._giro.addEventListener("animationend", () => this._giro.classList.remove("cambio"));
        this._foto.addEventListener("animationend", (e) => { if (e.animationName === "f-ladra") this._foto.classList.remove("ladra"); });
        this._svgs = [];
        this._lienzo = root.querySelector("canvas.rig");
        try {
          this._rig = new Esqueleto(this._lienzo, Object.fromEntries(this._fotos.map((i) => [i.dataset.v, i])), this);
        } catch { this._rig = null; this._lienzo.remove(); }
        if (this._rig) {
          new ResizeObserver(() => this._medir()).observe(this._foto);
          new IntersectionObserver((es) => { this._enPantalla = es[0].isIntersecting; this._animar(); }).observe(this._foto);
          for (const i of this._fotos) i.addEventListener("load", () => this._animar());
        }
      } else {
        const espalda = SVG.replace('class="laica"', 'class="laica espalda" aria-hidden="true"');
        root.innerHTML = `<style>${CSS}</style><div class="envoltura">${SVG}${espalda}</div>`;
        this._svgs = [...root.querySelectorAll("svg")];
        this._svg = this._svgs[0];
      }
      this._env = root.querySelector(".envoltura");
      this._env.addEventListener("animationend", (e) => {
        if (e.target === this._env) this._env.classList.remove("vuelta", "espaldas");
      });
    }

    _medir() {
      const r = this._foto.getBoundingClientRect(), d = Math.min(2, window.devicePixelRatio || 1);
      const w = Math.round(r.width * 1.36 * d), h = Math.round(r.height * 1.36 * d);
      if (w && h && (this._lienzo.width !== w || this._lienzo.height !== h)) { this._lienzo.width = w; this._lienzo.height = h; this._tUlt = 0; this._animar(); }
    }

    // Bucle de dibujo del esqueleto: solo corre mientras Laica está en pantalla.
    _animar() {
      if (!this._rig || this._raf || !this.isConnected || this._enPantalla === false) return;
      const cuadro = (ts) => {
        this._raf = 0;
        if (!this._rig || !this.isConnected || this._enPantalla === false) return;
        const dt = this._tUlt ? Math.min(0.05, (ts - this._tUlt) / 1000) : 0.016;
        this._tUlt = ts;
        let ok = false;
        try { ok = this._lienzo.width > 0 && this._rig.dibujar(dt, this._vistaRig()); }
        catch { this._rig = null; this._foto.classList.remove("rig-on"); this._lienzo.remove(); return; } // p. ej. imagen de otro origen
        this._foto.classList.toggle("rig-on", ok);
        if (!this._sinMovimiento || !ok) this._raf = requestAnimationFrame(cuadro);
      };
      this._raf = requestAnimationFrame(cuadro);
    }

    connectedCallback() {
      this._montar();
      this._tUlt = 0;
      this._animar();
      if (!this.hasAttribute("estado")) this.setAttribute("estado", "reposo");
      this._aplicar();
      window.addEventListener("pointermove", this._alMover, { passive: true });
      this._programarCuriosidad();
    }

    disconnectedCallback() {
      window.removeEventListener("pointermove", this._alMover);
      clearTimeout(this._tc); clearTimeout(this._tgesto);
      if (this._raf) cancelAnimationFrame(this._raf);
      this._raf = 0;
    }

    attributeChangedCallback() { this._aplicar(); }

    get _sinMovimiento() {
      return Boolean(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    }

    /** Mira hacia una dirección: x e y entre -1 (izquierda/arriba) y 1 (derecha/abajo). */
    mirar(x = 0, y = 0) {
      const l = (v) => Math.max(-1, Math.min(1, v));
      this.style.setProperty("--mx", l(x).toFixed(3));
      this.style.setProperty("--my", l(y).toFixed(3));
      this._mx = l(x);
      this._actualizarVista();
    }

    // Modo foto: elige la vista según hacia dónde mira (frente, tres cuartos a cada lado).
    _actualizarVista() {
      if (!this._fotos || this._girando) return;
      const mx = this._mx || 0;
      let v = "frente";
      if (this.estado === "saludar" && Math.abs(mx) < 0.5) v = "saludando";
      else if (mx > 0.35) v = "derecha";
      else if (mx < -0.35) v = "izquierda";
      this._ponerVista(v);
    }

    _ponerVista(v) {
      if (v === this._vista) return;
      const antes = this._vista;
      this._vista = v;
      for (const img of this._fotos) img.classList.toggle("activa", img.dataset.v === v);
      if (this._sinMovimiento) this._animar(); // sin animación: redibuja una vez la vista nueva
      if (antes && !this._sinMovimiento) { // un leve "aplastón" lateral simula el giro
        this._giro.classList.remove("cambio");
        void this._giro.offsetWidth;
        this._giro.classList.add("cambio");
      }
    }

    _sonar(tipo, volumen) {
      Sonido.tocar(tipo, volumen);
      this._rig?.ladrido();
      if (this._foto && !this._sinMovimiento && !this.hasAttribute("andar")) {
        this._foto.classList.remove("ladra");
        void this._foto.offsetWidth;
        this._foto.classList.add("ladra");
      }
    }
    /** Ladra (sonido real). */
    ladrar(volumen) { this._sonar("ladrido", volumen); }
    /** Gruñe (juguetón o enojado). */
    grunir(volumen) { this._sonar("grunido", volumen); }
    /** Se queja (gemido corto). */
    quejarse(volumen) { this._sonar("quejido", volumen); }
    /** Olfatea un rato (nariz en ráfagas, cabeza hacia adelante). */
    oler(ms = 2500) { this._gesto("oler", ms); }
    /** Rastrea con el hocico pegado al suelo (true) o deja de hacerlo (false). */
    rastrear(si = true) { this._gesto(si ? "rastrear" : null, 0); }
    /** Se para en dos patas (true) o vuelve a sentarse (false); con ms vuelve sola. */
    pararse(si = true, ms = 0) { this._gesto(si ? "parada" : null, ms); }
    /** Abre (true) o cierra (false) la boca; null la deja libre (jadea, habla y ladra sola). */
    boca(abierta = null) { this._boca = abierta == null ? null : abierta ? 1 : 0; }
    /** Sacude orejas (al aterrizar, chocar o asustarse). */
    sacudir(fuerza = 1) { this._rig?.sacudir(fuerza); }
    _gesto(g, ms) {
      clearTimeout(this._tgesto);
      if (g) this.setAttribute("gesto", g); else this.removeAttribute("gesto");
      if (g && ms > 0) this._tgesto = setTimeout(() => this.removeAttribute("gesto"), ms);
    }
    /** Salta un rato (pose de salto con las patas estiradas); con ms vuelve sola. */
    saltar(ms = 700) { this._gesto("saltar", ms); }
    // Pose que dibuja el esqueleto: de perfil usa las fotos caminando o saltando cuando corresponde.
    _vistaRig() {
      const v = this.vista, izq = v === "izquierda", g = this.getAttribute("gesto");
      if (g === "saltar") return izq ? "saltando-i" : "saltando";
      if (this.hasAttribute("andar") && (izq || v === "derecha") && g !== "parada") return izq ? "andando-i" : "andando";
      return v;
    }
    /** Vista actual en modo foto: frente, izquierda, derecha, espalda o saludando. */
    get vista() { return this._vista || "frente"; }

    /** Da una vuelta completa ("vuelta") o se voltea y muestra la espalda un momento ("espaldas"). */
    girar(tipo = "vuelta") {
      if (this._sinMovimiento || !this._env) return;
      if (this._fotos) {
        // Con fotos: pasa por las vistas reales (90°, 180°, 270°) en lugar de girar una imagen plana.
        const pasos = tipo === "espaldas"
          ? [["derecha", 170], ["espalda", 1100], ["izquierda", 170], ["frente", 0]]
          : [["derecha", 170], ["espalda", 170], ["izquierda", 170], ["frente", 0]];
        clearTimeout(this._tg);
        this._girando = true;
        let i = 0;
        const siguiente = () => {
          const [v, ms] = pasos[i++];
          this._ponerVista(v);
          if (i < pasos.length) this._tg = setTimeout(siguiente, ms);
          else { this._girando = false; this._actualizarVista(); }
        };
        siguiente();
        return;
      }
      this._env.classList.remove("vuelta", "espaldas");
      void this._env.offsetWidth; // reinicia la animación
      this._env.classList.add(tipo === "espaldas" ? "espaldas" : "vuelta");
    }

    // Estados en los que Laica mira de frente, quieta: descanso, respiración y alertas serias.
    get _deFrente() { return ["dormir", "respirar", "urgente", "radiacion"].includes(this.estado); }

    _seguirPuntero(e) {
      if (!this.hasAttribute("seguir") || this._deFrente) return;
      const r = this.getBoundingClientRect();
      if (!r.width) return;
      const cx = r.left + r.width / 2, cy = r.top + r.height * 0.4;
      this.mirar((e.clientX - cx) / (window.innerWidth / 2), (e.clientY - cy) / (window.innerHeight / 2));
      this._ultimoPuntero = Date.now();
    }

    // Curiosidad: si nadie mueve el cursor, mira a los lados sola y a veces se da la vuelta.
    _programarCuriosidad() {
      clearTimeout(this._tc);
      this._tc = setTimeout(() => {
        const quieto = Date.now() - (this._ultimoPuntero || 0) > 3500;
        if (this.hasAttribute("curiosa") && quieto && !this._sinMovimiento) {
          if (this._deFrente) this.mirar(0, 0);
          else if (this.estado === "alerta") this.mirar(0, 0.1);
          else {
            const r = Math.random();
            if (r < 0.1) this.girar(Math.random() < 0.5 ? "vuelta" : "espaldas");
            else if (r < 0.18 && this._rig && !this.hasAttribute("gesto")) this.oler(1800 + Math.random() * 1500);
            else if (r < 0.23 && this._rig && !this.hasAttribute("gesto") && this.estado === "reposo") this.pararse(true, 2200);
            else if (r < 0.3) this.mirar(0, 0);
            else this.mirar((Math.random() * 2 - 1) * 0.9, (Math.random() * 2 - 1) * 0.5);
          }
        }
        this._programarCuriosidad();
      }, 1800 + Math.random() * 2600);
    }

    get estado() { return this.getAttribute("estado") || "reposo"; }

    /** Camina (true) o se detiene (false). Con patas = "cuatro" trota en cuatro patas. */
    set andar(v) { this.toggleAttribute("andar", Boolean(v)); }
    get andar() { return this.hasAttribute("andar"); }
    /** "dos" (de pie, por defecto) o "cuatro". */
    set patas(v) { if (v === "cuatro") this.setAttribute("patas", "cuatro"); else this.removeAttribute("patas"); }
    get patas() { return this.getAttribute("patas") === "cuatro" ? "cuatro" : "dos"; }
    set estado(v) { this.setAttribute("estado", v); }

    /** Cambia a un estado y vuelve a `reposo` tras `ms` milisegundos. */
    accion(estado, ms = 3000) {
      this.estado = estado;
      clearTimeout(this._t);
      if (ms > 0) this._t = setTimeout(() => (this.estado = "reposo"), ms);
    }

    _aplicar() {
      if (!this._montado) return;
      const e = ESTADOS.includes(this.estado) ? this.estado : "reposo";
      const andando = this.hasAttribute("andar");
      const cuatro = this.getAttribute("patas") === "cuatro";
      if (this._foto) {
        ESTADOS.forEach((x) => this._foto.classList.remove("e-" + x));
        this._foto.classList.add("e-" + e);
        this._foto.classList.toggle("andando", andando);
        this._actualizarVista();
      }
      for (const svg of this._svgs) {
        ESTADOS.forEach((x) => svg.classList.remove("e-" + x));
        svg.classList.add("e-" + e);
        svg.classList.toggle("andando", andando);
        svg.classList.toggle("p-cuatro", cuatro);
      }
      if (this._deFrente) this.mirar(0, 0);
      const t = parseInt(this.getAttribute("tamano"), 10);
      if (t) { this._env.style.width = t + "px"; this.style.setProperty("--tam", t + "px"); }
      if (e !== this._ultimoEstado) {
        this._ultimoEstado = e;
        this.dispatchEvent(new CustomEvent("laica-estado", { detail: { estado: e } }));
      }
    }
  }

  if (!customElements.get("laica-mascota")) customElements.define("laica-mascota", LaicaMascota);
  window.LAICA_ESTADOS = ESTADOS;
})();
