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
 */
(() => {
  const ESTADOS = [
    "reposo", "saludar", "hablar", "celebrar", "ejercicio",
    "respirar", "dormir", "alerta", "urgente", "radiacion",
  ];

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

@media (prefers-reduced-motion: reduce) {
  svg.laica.p-cuatro .cuerpo-entero { transform: translateY(28px); }
  svg.laica *, svg.laica .cuerpo-entero, .envoltura { animation: none !important; }
  .envoltura, .cara-giro, .cabeza-giro, .pupilas, .orejas-giro, .reflejos { transition: none !important; }
  .halo { opacity: .6 !important; }
}
`;

  class LaicaMascota extends HTMLElement {
    static get observedAttributes() { return ["estado", "tamano", "seguir", "curiosa", "andar", "patas"]; }

    constructor() {
      super();
      const root = this.attachShadow({ mode: "open" });
      const espalda = SVG.replace('class="laica"', 'class="laica espalda" aria-hidden="true"');
      root.innerHTML = `<style>${CSS}</style><div class="envoltura">${SVG}${espalda}</div>`;
      this._svgs = [...root.querySelectorAll("svg")];
      this._svg = this._svgs[0];
      this._env = root.querySelector(".envoltura");
      this._env.addEventListener("animationend", (e) => {
        if (e.target === this._env) this._env.classList.remove("vuelta", "espaldas");
      });
      this._alMover = (e) => this._seguirPuntero(e);
    }

    connectedCallback() {
      if (!this.hasAttribute("estado")) this.setAttribute("estado", "reposo");
      this._aplicar();
      window.addEventListener("pointermove", this._alMover, { passive: true });
      this._programarCuriosidad();
    }

    disconnectedCallback() {
      window.removeEventListener("pointermove", this._alMover);
      clearTimeout(this._tc);
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
    }

    /** Da una vuelta completa ("vuelta") o se voltea y muestra la espalda un momento ("espaldas"). */
    girar(tipo = "vuelta") {
      if (this._sinMovimiento) return;
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
      if (!this._svg) return;
      const e = ESTADOS.includes(this.estado) ? this.estado : "reposo";
      const andando = this.hasAttribute("andar");
      const cuatro = this.getAttribute("patas") === "cuatro";
      for (const svg of this._svgs) {
        ESTADOS.forEach((x) => svg.classList.remove("e-" + x));
        svg.classList.add("e-" + e);
        svg.classList.toggle("andando", andando);
        svg.classList.toggle("p-cuatro", cuatro);
      }
      if (this._deFrente) this.mirar(0, 0);
      const t = parseInt(this.getAttribute("tamano"), 10);
      if (t) this._env.style.width = t + "px";
      if (e !== this._ultimoEstado) {
        this._ultimoEstado = e;
        this.dispatchEvent(new CustomEvent("laica-estado", { detail: { estado: e } }));
      }
    }
  }

  if (!customElements.get("laica-mascota")) customElements.define("laica-mascota", LaicaMascota);
  window.LAICA_ESTADOS = ESTADOS;
})();
