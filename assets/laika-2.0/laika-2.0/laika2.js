/**
 * Laika 2.0 — mascota en caricatura inspirada en Laika, la perrita espacial.
 *
 * Componente web sin dependencias:
 *   <script src="laika2.js"></script>
 *   <laika-mascota estado="saludar" tamano="240"></laika-mascota>
 *
 * Lanzar un gesto desde JS:
 *   document.querySelector('laika-mascota').estado = 'celebrar';
 *
 * Estados: reposo, saludar, saltar, celebrar, triste, ladrar, ladear, cola
 * Cada gesto dura lo indicado en DURACION y luego vuelve solo a `reposo`.
 */
(() => {
  // Duración de cada gesto en milisegundos
  const DURACION = { saludar: 2200, saltar: 900, celebrar: 2400, triste: 3600, ladrar: 1200, ladear: 2000, cola: 2000 };
  const ESTADOS = ["reposo", ...Object.keys(DURACION)];

  const SVG = `
<svg class="laika2" viewBox="0 -80 400 500" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Laika, perrita espacial en caricatura">
  <defs>
    <g id="lk-ear-shape">
      <path d="M126 120 C110 88 110 56 123 36 C142 50 166 70 176 90 Z" fill="#4a3328" stroke="#2b1d17" stroke-width="4" stroke-linejoin="round"/>
      <path d="M131 104 C123 84 123 66 129 54 C141 64 153 76 160 88 Z" fill="#c98f5a"/>
      <path d="M123 36 L149 60 L119 70 Z" fill="#38261d" stroke="#2b1d17" stroke-width="4" stroke-linejoin="round"/>
    </g>
    <path id="lk-star-shape" d="M0 -13 L3.8 -4.2 L13 -3.6 L5.8 2.6 L8 12 L0 6.8 L-8 12 L-5.8 2.6 L-13 -3.6 L-3.8 -4.2 Z"/>
  </defs>

  <ellipse id="lk-shadow" cx="200" cy="398" rx="122" ry="14" fill="#0b0a1c" opacity=".28"/>

  <g id="lk-all">
    <!-- cola -->
    <g id="lk-tail">
      <path d="M258 358 C300 364 336 332 324 292 C317 270 291 272 292 294" fill="none" stroke="#2b1d17" stroke-width="30" stroke-linecap="round"/>
      <path d="M258 358 C300 364 336 332 324 292 C317 270 291 272 292 294" fill="none" stroke="#fff8ec" stroke-width="22" stroke-linecap="round"/>
    </g>

    <!-- cuerpo -->
    <g id="lk-torso">
      <path d="M150 215 C124 250 110 322 128 374 C136 394 264 394 272 374 C290 322 276 250 250 215 Z" fill="#fff8ec"/>
      <path d="M263 292 C281 312 284 350 271 375 C258 387 240 382 236 362 C232 332 245 302 263 292 Z" fill="#4a3328"/>
      <path d="M150 300 C150 340 170 366 200 370 C230 366 250 340 250 300 Z" fill="#f1e3cc" opacity=".55"/>
      <path d="M150 215 C124 250 110 322 128 374 C136 394 264 394 272 374 C290 322 276 250 250 215 Z" fill="none" stroke="#2b1d17" stroke-width="4" stroke-linejoin="round"/>
      <!-- patas traseras -->
      <g fill="#fff8ec" stroke="#2b1d17" stroke-width="4">
        <ellipse cx="138" cy="386" rx="32" ry="16"/>
        <ellipse cx="262" cy="386" rx="32" ry="16"/>
      </g>
      <g stroke="#2b1d17" stroke-width="3" stroke-linecap="round">
        <path d="M126 388 v8 M140 390 v8 M260 390 v8 M274 388 v8"/>
      </g>
      <!-- arnés -->
      <rect x="193" y="262" width="14" height="46" fill="#b93a20" stroke="#2b1d17" stroke-width="3"/>
      <path d="M139 242 Q200 270 261 242 L264 260 Q200 290 136 260 Z" fill="#e2532f" stroke="#2b1d17" stroke-width="4" stroke-linejoin="round"/>
      <path d="M144 251 Q200 279 256 251" fill="none" stroke="#ffd9a8" stroke-width="2" stroke-dasharray="5 5" stroke-linecap="round"/>
      <circle cx="200" cy="286" r="11" fill="#f2c14e" stroke="#2b1d17" stroke-width="3"/>
      <use href="#lk-star-shape" transform="translate(200 286) scale(.5)" fill="#b93a20"/>
      <!-- pata delantera izquierda -->
      <rect x="164" y="282" width="30" height="100" rx="14" fill="#fff8ec" stroke="#2b1d17" stroke-width="4"/>
      <ellipse cx="179" cy="384" rx="21" ry="13" fill="#fff8ec" stroke="#2b1d17" stroke-width="4"/>
      <path d="M173 386 v7 M185 386 v7" stroke="#2b1d17" stroke-width="3" stroke-linecap="round"/>
    </g>

    <!-- cabeza -->
    <g id="lk-head">
      <g class="lk-ear lk-ear-l"><use href="#lk-ear-shape"/></g>
      <g transform="translate(400 0) scale(-1 1)"><g class="lk-ear lk-ear-r"><use href="#lk-ear-shape"/></g></g>

      <ellipse cx="200" cy="150" rx="88" ry="74" fill="#4a3328" stroke="#2b1d17" stroke-width="4"/>
      <path d="M200 80 C189 100 187 124 179 143 C150 150 139 186 164 207 C184 223 216 223 236 207 C261 186 250 150 221 143 C213 124 211 100 200 80 Z" fill="#fff8ec"/>
      <ellipse cx="171" cy="188" rx="10" ry="5.5" fill="#f2798f" opacity=".45"/>
      <ellipse cx="229" cy="188" rx="10" ry="5.5" fill="#f2798f" opacity=".45"/>

      <!-- cejas -->
      <ellipse class="lk-brow lk-brow-l" cx="158" cy="110" rx="10" ry="6" fill="#c98f5a"/>
      <ellipse class="lk-brow lk-brow-r" cx="242" cy="110" rx="10" ry="6" fill="#c98f5a"/>

      <!-- ojos abiertos -->
      <g id="lk-eyes-open">
        <g class="lk-eye">
          <ellipse cx="158" cy="140" rx="15" ry="18" fill="#ffffff" stroke="#2b1d17" stroke-width="3"/>
          <g class="lk-pupil"><circle cx="159" cy="142" r="9.5" fill="#1f1512"/><circle cx="155.5" cy="137.5" r="3.2" fill="#fff"/></g>
        </g>
        <g class="lk-eye">
          <ellipse cx="242" cy="140" rx="15" ry="18" fill="#ffffff" stroke="#2b1d17" stroke-width="3"/>
          <g class="lk-pupil"><circle cx="241" cy="142" r="9.5" fill="#1f1512"/><circle cx="237.5" cy="137.5" r="3.2" fill="#fff"/></g>
        </g>
      </g>
      <!-- ojos felices -->
      <g id="lk-eyes-happy" fill="none" stroke="#fff8ec" stroke-width="6" stroke-linecap="round">
        <path d="M144 146 Q158 126 172 146"/>
        <path d="M228 146 Q242 126 256 146"/>
      </g>

      <!-- lágrima -->
      <path id="lk-tear" class="lk-fx" d="M150 160 C144 170 143 177 150 178 C157 177 156 170 150 160 Z" fill="#7fd0ff" stroke="#2b1d17" stroke-width="2"/>

      <!-- bocas -->
      <g id="lk-m-open">
        <path d="M180 192 Q200 226 220 192 Z" fill="#7a2430" stroke="#2b1d17" stroke-width="4" stroke-linejoin="round"/>
        <ellipse cx="200" cy="208" rx="9" ry="7" fill="#f2798f"/>
      </g>
      <g id="lk-m-smile" fill="none" stroke="#2b1d17" stroke-width="4" stroke-linecap="round">
        <path d="M200 181 V191 M200 191 Q189 203 177 195 M200 191 Q211 203 223 195"/>
      </g>
      <g id="lk-m-sad" fill="none" stroke="#2b1d17" stroke-width="4" stroke-linecap="round">
        <path d="M200 181 V190 M182 203 Q200 188 218 203"/>
      </g>
      <!-- nariz -->
      <ellipse cx="200" cy="172" rx="14" ry="10" fill="#1f1512"/>
      <ellipse cx="195" cy="168.5" rx="4.5" ry="2.5" fill="#fff" opacity=".7"/>
    </g>

    <!-- pata delantera derecha (la que saluda) -->
    <g id="lk-arm">
      <rect x="206" y="282" width="30" height="100" rx="14" fill="#fff8ec" stroke="#2b1d17" stroke-width="4"/>
      <ellipse cx="221" cy="384" rx="21" ry="13" fill="#fff8ec" stroke="#2b1d17" stroke-width="4"/>
      <path d="M215 386 v7 M227 386 v7" stroke="#2b1d17" stroke-width="3" stroke-linecap="round"/>
    </g>
  </g>

  <!-- efectos -->
  <g id="lk-stars" fill="#f2c14e" stroke="#2b1d17" stroke-width="2" stroke-linejoin="round">
    <use class="lk-fx lk-star" href="#lk-star-shape" x="52" y="70"/>
    <use class="lk-fx lk-star" href="#lk-star-shape" x="348" y="60"/>
    <use class="lk-fx lk-star" href="#lk-star-shape" x="36" y="210"/>
    <use class="lk-fx lk-star" href="#lk-star-shape" x="366" y="220"/>
    <use class="lk-fx lk-star" href="#lk-star-shape" x="104" y="-30"/>
    <use class="lk-fx lk-star" href="#lk-star-shape" x="300" y="-40"/>
  </g>
  <g id="lk-guau" class="lk-fx">
    <path d="M296 24 h84 a12 12 0 0 1 12 12 v26 a12 12 0 0 1 -12 12 h-58 l-16 16 l2 -16 h-12 a12 12 0 0 1 -12 -12 v-26 a12 12 0 0 1 12 -12 Z" fill="#fff" stroke="#2b1d17" stroke-width="3" stroke-linejoin="round"/>
    <text x="338" y="57" text-anchor="middle" font-family="system-ui,'Segoe UI',sans-serif" font-weight="800" font-size="24" fill="#2b1d17">¡Guau!</text>
  </g>
  <g id="lk-duda" class="lk-fx">
    <text x="330" y="70" text-anchor="middle" font-family="system-ui,'Segoe UI',sans-serif" font-weight="800" font-size="64" fill="#f2c14e" stroke="#2b1d17" stroke-width="3" paint-order="stroke">?</text>
  </g>
</svg>
`;

  const CSS = `
:host { display: inline-block; line-height: 0; }
.envoltura { width: 240px; max-width: 100%; }
svg.laika2{--lk-px:0px;--lk-py:0px;overflow:visible;display:block;width:100%;height:auto}
svg.laika2 .lk-fx,svg.laika2 #lk-m-open,svg.laika2 #lk-m-sad,svg.laika2 #lk-eyes-happy{opacity:0}
svg.laika2 #lk-m-smile,svg.laika2 #lk-m-open,svg.laika2 #lk-m-sad,svg.laika2 #lk-eyes-open,svg.laika2 #lk-eyes-happy{transition:opacity .12s}
#lk-all{transform-origin:200px 400px}
#lk-torso{transform-origin:200px 392px;animation:lk-breathe 3.2s ease-in-out infinite}
#lk-head{transform-origin:200px 224px;animation:lk-bob 3.2s ease-in-out infinite}
#lk-tail{transform-origin:260px 356px;animation:lk-tail-idle 1.5s ease-in-out infinite alternate}
#lk-arm{transform-origin:221px 292px}
#lk-shadow{transform-origin:200px 398px}
.lk-ear{transform-origin:150px 100px}
.lk-eye{transform-box:fill-box;transform-origin:center;animation:lk-blink 4.6s infinite}
.lk-pupil{transform:translate(var(--lk-px),var(--lk-py));transition:transform .12s ease-out}
.lk-brow{transform-box:fill-box;transform-origin:center;transition:transform .25s}
.lk-fx{transform-box:fill-box;transform-origin:center}

@keyframes lk-breathe{0%,100%{transform:scale(1,1)}50%{transform:scale(1.018,.985)}}
@keyframes lk-bob{0%,100%{transform:translateY(0)}50%{transform:translateY(2px)}}
@keyframes lk-tail-idle{from{transform:rotate(-4deg)}to{transform:rotate(9deg)}}
@keyframes lk-blink{0%,92%,100%{transform:scaleY(1)}95.5%{transform:scaleY(.08)}}
@keyframes lk-tail-fast{from{transform:rotate(-16deg)}to{transform:rotate(20deg)}}

/* saludar */
svg.laika2.e-saludar #lk-arm{animation:lk-wave 2.2s ease-in-out}
svg.laika2.e-saludar #lk-head{animation:lk-head-wave 2.2s ease-in-out}
svg.laika2.e-saludar #lk-tail{animation:lk-tail-fast .18s ease-in-out infinite alternate}
@keyframes lk-wave{0%,100%{transform:rotate(0)}16%{transform:rotate(-150deg)}30%{transform:rotate(-120deg)}44%{transform:rotate(-150deg)}58%{transform:rotate(-120deg)}72%{transform:rotate(-150deg)}86%{transform:rotate(-125deg)}}
@keyframes lk-head-wave{0%,100%{transform:rotate(0)}16%,86%{transform:rotate(-7deg)}}

/* saltar */
svg.laika2.e-saltar #lk-all{animation:lk-jump .9s cubic-bezier(.3,.1,.3,1)}
svg.laika2.e-saltar #lk-shadow{animation:lk-shadow-jump .9s ease-in-out}
svg.laika2.e-saltar .lk-ear{animation:lk-ear-flap .9s ease-in-out}
@keyframes lk-jump{0%,100%{transform:translateY(0) scale(1,1)}16%{transform:translateY(0) scale(1.08,.88)}48%{transform:translateY(-80px) scale(.95,1.06)}80%{transform:translateY(0) scale(1.07,.9)}}
@keyframes lk-shadow-jump{0%,16%,80%,100%{transform:scale(1);opacity:.28}48%{transform:scale(.6);opacity:.14}}
@keyframes lk-ear-flap{0%,100%{transform:rotate(0)}30%{transform:rotate(-14deg)}60%{transform:rotate(16deg)}}

/* celebrar */
svg.laika2.e-celebrar #lk-all{animation:lk-jump .8s cubic-bezier(.3,.1,.3,1) 3}
svg.laika2.e-celebrar #lk-shadow{animation:lk-shadow-jump .8s ease-in-out 3}
svg.laika2.e-celebrar .lk-ear{animation:lk-ear-flap .8s ease-in-out 3}
svg.laika2.e-celebrar #lk-arm{animation:lk-cheer 2.4s ease-in-out}
svg.laika2.e-celebrar #lk-tail{animation:lk-tail-fast .16s ease-in-out infinite alternate}
svg.laika2.e-celebrar .lk-star{animation:lk-pop 1.2s ease-out 2}
svg.laika2.e-celebrar .lk-star:nth-of-type(2){animation-delay:.12s}
svg.laika2.e-celebrar .lk-star:nth-of-type(3){animation-delay:.24s}
svg.laika2.e-celebrar .lk-star:nth-of-type(4){animation-delay:.08s}
svg.laika2.e-celebrar .lk-star:nth-of-type(5){animation-delay:.3s}
svg.laika2.e-celebrar .lk-star:nth-of-type(6){animation-delay:.18s}
@keyframes lk-cheer{0%,100%{transform:rotate(0)}10%,90%{transform:rotate(-150deg)}30%,70%{transform:rotate(-128deg)}50%{transform:rotate(-152deg)}}
@keyframes lk-pop{0%{opacity:0;transform:scale(.2) rotate(-30deg)}35%{opacity:1;transform:scale(1.15) rotate(10deg)}70%{opacity:1;transform:scale(1) rotate(0)}100%{opacity:0;transform:scale(.6) rotate(20deg)}}

/* triste */
svg.laika2.e-triste #lk-head{animation:lk-head-sad 3.6s ease-in-out}
svg.laika2.e-triste .lk-ear{animation:lk-ear-sad 3.6s ease-in-out}
svg.laika2.e-triste #lk-tail{animation:lk-tail-sad 3.6s ease-in-out}
svg.laika2.e-triste #lk-tear{animation:lk-tear 1.5s ease-in .7s 2}
svg.laika2.e-triste .lk-pupil{transform:translate(0,5px)}
svg.laika2.e-triste .lk-brow-l{transform:rotate(-24deg) translateY(3px)}
svg.laika2.e-triste .lk-brow-r{transform:rotate(24deg) translateY(3px)}
@keyframes lk-head-sad{0%,100%{transform:translateY(0) rotate(0)}14%,86%{transform:translateY(12px) rotate(4deg)}}
@keyframes lk-ear-sad{0%,100%{transform:rotate(0)}14%,86%{transform:rotate(-34deg)}}
@keyframes lk-tail-sad{0%,100%{transform:rotate(0)}14%,86%{transform:rotate(48deg)}}
@keyframes lk-tear{0%{opacity:0;transform:translateY(0) scale(.6)}15%{opacity:1;transform:translateY(0) scale(1)}100%{opacity:0;transform:translateY(46px) scale(1)}}

/* ladrar */
svg.laika2.e-ladrar #lk-head{animation:lk-bark 1.2s ease-out}
svg.laika2.e-ladrar #lk-m-open{animation:lk-bark-mouth 1.2s steps(1)}
svg.laika2.e-ladrar #lk-m-smile{animation:lk-bark-smile 1.2s steps(1)}
svg.laika2.e-ladrar #lk-guau{animation:lk-bubble 1.2s ease-out}
svg.laika2.e-ladrar .lk-ear{animation:lk-ear-flap .4s ease-in-out 3}
@keyframes lk-bark{0%,30%,60%,100%{transform:translateY(0) rotate(0)}12%,42%,72%{transform:translateY(-9px) rotate(-7deg)}}
@keyframes lk-bark-mouth{0%,24%,54%,84%{opacity:0}6%,36%,66%{opacity:1}}
@keyframes lk-bark-smile{0%,24%,54%,84%{opacity:1}6%,36%,66%{opacity:0}}
@keyframes lk-bubble{0%{opacity:0;transform:scale(.3)}12%{opacity:1;transform:scale(1.12)}22%,85%{opacity:1;transform:scale(1)}100%{opacity:0;transform:scale(.9)}}

/* ladear la cabeza */
svg.laika2.e-ladear #lk-head{animation:lk-tilt 2s ease-in-out}
svg.laika2.e-ladear #lk-duda{animation:lk-bubble 2s ease-out}
svg.laika2.e-ladear .lk-ear-r{animation:lk-ear-up 2s ease-in-out}
@keyframes lk-tilt{0%,100%{transform:rotate(0)}22%,80%{transform:rotate(15deg)}}
@keyframes lk-ear-up{0%,100%{transform:rotate(0)}22%,80%{transform:rotate(12deg)}}

/* mover la cola */
svg.laika2.e-cola #lk-tail{animation:lk-tail-fast .15s ease-in-out infinite alternate}
svg.laika2.e-cola #lk-all{animation:lk-wiggle .3s ease-in-out infinite alternate}
@keyframes lk-wiggle{from{transform:rotate(-1.6deg)}to{transform:rotate(1.6deg)}}

/* bocas y ojos por gesto */
svg.laika2.e-saludar #lk-m-open,svg.laika2.e-saltar #lk-m-open,svg.laika2.e-celebrar #lk-m-open,svg.laika2.e-cola #lk-m-open,
svg.laika2.e-triste #lk-m-sad,svg.laika2.e-celebrar #lk-eyes-happy{opacity:1}
svg.laika2.e-saludar #lk-m-smile,svg.laika2.e-saltar #lk-m-smile,svg.laika2.e-celebrar #lk-m-smile,svg.laika2.e-cola #lk-m-smile,
svg.laika2.e-triste #lk-m-smile,svg.laika2.e-celebrar #lk-eyes-open{opacity:0}

@media (prefers-reduced-motion: reduce){
  #lk-torso,#lk-head,#lk-tail,.lk-eye{animation:none}
}
`;

  class LaikaMascota extends HTMLElement {
    static get observedAttributes() { return ["estado", "tamano"]; }

    constructor() {
      super();
      const root = this.attachShadow({ mode: "open" });
      root.innerHTML = `<style>${CSS}</style><div class="envoltura">${SVG}</div>`;
      this._svg = root.querySelector("svg");
      this._env = root.querySelector(".envoltura");
      // La mirada sigue al cursor o al dedo
      this._mirar = (e) => {
        const r = this._svg.getBoundingClientRect();
        if (!r.width) return;
        const lim = (v) => Math.max(-1, Math.min(1, v));
        const dx = (e.clientX - (r.left + r.width / 2)) / r.width;
        const dy = (e.clientY - (r.top + r.height * 0.44)) / r.height;
        this._svg.style.setProperty("--lk-px", (lim(dx * 1.6) * 4).toFixed(1) + "px");
        this._svg.style.setProperty("--lk-py", (lim(dy * 1.6) * 4).toFixed(1) + "px");
      };
    }

    connectedCallback() {
      document.addEventListener("pointermove", this._mirar);
      if (!this.hasAttribute("estado")) this.setAttribute("estado", "reposo");
      else this._aplicar();
    }

    disconnectedCallback() {
      document.removeEventListener("pointermove", this._mirar);
      clearTimeout(this._t);
    }

    attributeChangedCallback() { this._aplicar(); }

    get estado() { return this.getAttribute("estado") || "reposo"; }
    set estado(v) { this.setAttribute("estado", v); }

    /**
     * Lanza un gesto y vuelve a `reposo` tras `ms` milisegundos.
     * Sin `ms` usa la duración propia del gesto; con `ms = 0` se queda en ese estado.
     */
    accion(estado, ms) {
      this._ms = ms;
      this.estado = estado;
    }

    _aplicar() {
      if (!this._svg || !this.isConnected) return;
      const e = ESTADOS.includes(this.estado) ? this.estado : "reposo";
      clearTimeout(this._t);
      ESTADOS.forEach((x) => this._svg.classList.remove("e-" + x));
      if (e !== "reposo") {
        void this._svg.getBoundingClientRect(); // reinicia la animación si se repite el gesto
        this._svg.classList.add("e-" + e);
        const ms = this._ms ?? DURACION[e];
        if (ms > 0) this._t = setTimeout(() => (this.estado = "reposo"), ms);
      }
      this._ms = undefined;
      const t = parseInt(this.getAttribute("tamano"), 10);
      if (t) this._env.style.width = t + "px";
      this.dispatchEvent(new CustomEvent("laika-estado", { detail: { estado: e } }));
    }
  }

  if (!customElements.get("laika-mascota")) customElements.define("laika-mascota", LaikaMascota);
  window.LAIKA_ESTADOS = ESTADOS;
})();
