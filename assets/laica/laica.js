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
  <g class="cuerpo-entero">
    <!-- Halo de alerta alrededor del casco -->
    <circle class="halo" cx="150" cy="128" r="102" fill="none" stroke-width="10"/>

    <!-- Cola -->
    <g class="cola">
      <ellipse cx="203" cy="286" rx="16" ry="11" fill="var(--naranja)" stroke="var(--linea)" stroke-width="4" transform="rotate(-25 203 286)"/>
    </g>

    <!-- Piernas y botas -->
    <g class="piernas" stroke="var(--linea)" stroke-width="4" stroke-linejoin="round">
      <g class="pierna-i"><rect x="112" y="262" width="32" height="50" rx="15" fill="var(--traje)"/><ellipse cx="128" cy="314" rx="19" ry="11" fill="var(--panel)"/></g>
      <g class="pierna-d"><rect x="156" y="262" width="32" height="50" rx="15" fill="var(--traje)"/><ellipse cx="172" cy="314" rx="19" ry="11" fill="var(--panel)"/></g>
    </g>

    <!-- Torso del traje -->
    <rect x="103" y="196" width="94" height="88" rx="36" fill="var(--traje)" stroke="var(--linea)" stroke-width="4"/>
    <!-- Panel del pecho con luz de estado -->
    <rect x="126" y="228" width="48" height="30" rx="7" fill="var(--panel)" stroke="var(--linea)" stroke-width="4"/>
    <circle class="led" cx="139" cy="243" r="6.5" stroke="var(--linea)" stroke-width="3"/>
    <rect x="152" y="237" width="15" height="4" rx="2" fill="var(--linea)" opacity=".55"/>
    <rect x="152" y="245" width="10" height="4" rx="2" fill="var(--linea)" opacity=".55"/>

    <!-- Brazo izquierdo (el que saluda) -->
    <g class="brazo-i">
      <rect x="62" y="207" width="54" height="27" rx="13.5" fill="var(--traje)" stroke="var(--linea)" stroke-width="4"/>
      <circle cx="62" cy="220" r="15" fill="var(--naranja)" stroke="var(--linea)" stroke-width="4"/>
    </g>
    <!-- Brazo derecho -->
    <g class="brazo-d">
      <rect x="184" y="207" width="54" height="27" rx="13.5" fill="var(--traje)" stroke="var(--linea)" stroke-width="4"/>
      <circle cx="238" cy="220" r="15" fill="var(--naranja)" stroke="var(--linea)" stroke-width="4"/>
    </g>

    <!-- Cuello del traje -->
    <ellipse cx="150" cy="204" rx="58" ry="13" fill="var(--panel)" stroke="var(--linea)" stroke-width="4"/>

    <!-- Cabeza -->
    <g class="cabeza">
      <g class="oreja-i">
        <path d="M100 112 L90 44 L138 84 Z" fill="var(--naranja)" stroke="var(--linea)" stroke-width="4" stroke-linejoin="round"/>
        <path d="M104 101 L98 60 L127 85 Z" fill="var(--rosa)"/>
      </g>
      <g class="oreja-d">
        <path d="M200 112 L210 44 L162 84 Z" fill="var(--naranja)" stroke="var(--linea)" stroke-width="4" stroke-linejoin="round"/>
        <path d="M196 101 L202 60 L173 85 Z" fill="var(--rosa)"/>
      </g>
      <ellipse cx="150" cy="136" rx="64" ry="54" fill="var(--naranja)" stroke="var(--linea)" stroke-width="4"/>
      <!-- Mancha blanca de la frente y hocico -->
      <path d="M141 90 Q150 85 159 90 L163 138 L137 138 Z" fill="var(--crema)"/>
      <ellipse cx="150" cy="160" rx="42" ry="27" fill="var(--crema)"/>
      <!-- Mejillas -->
      <ellipse cx="113" cy="156" rx="9" ry="5" fill="var(--rosa)" opacity=".7"/>
      <ellipse cx="187" cy="156" rx="9" ry="5" fill="var(--rosa)" opacity=".7"/>

      <!-- Ojos abiertos -->
      <g class="ojos">
        <ellipse cx="127" cy="134" rx="7.5" ry="9.5" fill="var(--linea)"/>
        <ellipse cx="173" cy="134" rx="7.5" ry="9.5" fill="var(--linea)"/>
        <circle cx="129.5" cy="130" r="2.6" fill="#fff"/>
        <circle cx="175.5" cy="130" r="2.6" fill="#fff"/>
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
      <ellipse cx="150" cy="151" rx="7.5" ry="5.2" fill="var(--linea)"/>

      <!-- Bocas (se muestra una según el estado) -->
      <g class="boca boca-sonrisa">
        <path d="M139 159 Q150 170 161 159" fill="none" stroke="var(--linea)" stroke-width="3.5" stroke-linecap="round"/>
        <path d="M145 164 Q150 176 155 164 Z" fill="var(--rosa)" stroke="var(--linea)" stroke-width="2.5"/>
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

    <!-- Casco de cristal -->
    <circle class="casco" cx="150" cy="128" r="92" fill="var(--cristal)" stroke="var(--linea)" stroke-width="5"/>
    <path d="M83 104 A70 70 0 0 1 118 54" fill="none" stroke="#fff" stroke-width="10" stroke-linecap="round" opacity=".75"/>
    <circle cx="214" cy="170" r="6" fill="#fff" opacity=".6"/>

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
</svg>`;

  const CSS = `
:host { display: inline-block; --tam: 240px; }
.envoltura { width: var(--tam); }
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
@media (prefers-reduced-motion: reduce) {
  svg.laica *, svg.laica .cuerpo-entero { animation: none !important; }
  .halo { opacity: .6 !important; }
}
`;

  class LaicaMascota extends HTMLElement {
    static get observedAttributes() { return ["estado", "tamano"]; }

    constructor() {
      super();
      const root = this.attachShadow({ mode: "open" });
      root.innerHTML = `<style>${CSS}</style><div class="envoltura">${SVG}</div>`;
      this._svg = root.querySelector("svg");
      this._env = root.querySelector(".envoltura");
    }

    connectedCallback() {
      if (!this.hasAttribute("estado")) this.setAttribute("estado", "reposo");
      this._aplicar();
    }

    attributeChangedCallback() { this._aplicar(); }

    get estado() { return this.getAttribute("estado") || "reposo"; }
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
      ESTADOS.forEach((x) => this._svg.classList.remove("e-" + x));
      this._svg.classList.add("e-" + e);
      const t = parseInt(this.getAttribute("tamano"), 10);
      if (t) this._env.style.width = t + "px";
      this.dispatchEvent(new CustomEvent("laica-estado", { detail: { estado: e } }));
    }
  }

  if (!customElements.get("laica-mascota")) customElements.define("laica-mascota", LaicaMascota);
  window.LAICA_ESTADOS = ESTADOS;
})();
