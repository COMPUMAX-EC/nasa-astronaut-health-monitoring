// Laica suelta por el escritorio: sale desde el punto del navegador donde estaba y anda por
// toda la pantalla. Dos modos:
//   - Sin gravedad (espacio): vuela, rebota contra los bordes, a ratos aterriza y camina.
//   - Con gravedad: cae, rebota en el suelo, camina sobre la barra de tareas, salta, se sienta,
//     y si la lanzas hace una parábola.
// Camina en dos patas o en cuatro. Clic derecho: menú (gravedad, cuatro patas y más).

(() => {
  const ANCHO = 130;
  const ALTO = Math.round(ANCHO * 340 / 300);
  const VEL = 260;  // vuelo sin gravedad, px/s
  const G = 1500;   // gravedad, px/s²

  const caja = document.getElementById("laica");
  const cuerpo = caja.querySelector(".cuerpo");
  const golpe = caja.querySelector(".golpe");
  const laica = caja.querySelector("laica-mascota");
  const burbuja = caja.querySelector(".burbuja");
  const puente = window.escritorio || { raton() {}, menu() {}, alSalir() {}, alOrden() {} };
  const quieta = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Opciones que recuerda entre sesiones.
  const leer = (k, d) => { try { const v = localStorage.getItem(k); return v === null ? d : v === "1"; } catch { return d; } };
  const guardar = (k, v) => { try { localStorage.setItem(k, v ? "1" : "0"); } catch { /* sin almacenamiento */ } };
  const opciones = { gravedad: leer("laica-gravedad", false), cuatro: leer("laica-cuatro", false) };

  const FRASES = {
    libre: ["¡Libre! Tu escritorio es enorme.", "¡Salí del navegador!", "Esto es más grande que la estación."],
    choque: ["¡Auch!", "¿Quién puso esta pared?", "Bordes 1, Laica 0.", "¡Boing!", "Eso no estaba en el manual."],
    aterrizar: ["Aterrizaje perfecto. Bueno, casi.", "¿Esta barra es tuya? Me la quedo.", "Paseo por la barra de tareas."],
    despegar: ["¡Despegue!", "Tres, dos, uno…"],
    escapar: ["Me escondo.", "No me busques.", "¡Al infinito!"],
    asomar: ["¿Me extrañaste?", "Psst… sigo aquí.", "Te estoy vigilando 👀"],
    agarrar: ["¡Eh! ¡Bájame!", "¡Sin gravedad, por favor!"],
    lanzar: ["¡Wiiii!", "¡Otra vez!"],
    cosquillas: ["¡Jaja, cosquillas!", "Guau. Digo… hola."],
    gravedadSi: ["Uy, aquí sí hay gravedad.", "¿Quién encendió la Tierra?"],
    gravedadNo: ["¡Ingravidez! Así me gusta.", "Modo espacio activado."],
    cuatroSi: ["En cuatro patas: modo perro.", "Así corro más rápido."],
    cuatroNo: ["De vuelta a dos patas.", "Modo astronauta."],
    sentarse: ["Un descansito.", "Aquí me quedo un rato."],
    salto: ["¡Hop!", "¡Arriba!"],
    salud: [
      "¿Ya tomaste agua?",
      "Mira lejos 20 segundos: tus ojos te lo agradecen.",
      "Hora de estirar la espalda.",
      "Respira hondo: 4 dentro, 4 fuera.",
    ],
  };
  const al = (l) => l[Math.floor(Math.random() * l.length)];
  const entre = (a, b) => a + Math.random() * (b - a);

  // ---------- Burbuja, efectos y postura ----------
  let tFrase = 0, ladoBurbuja = "arriba";
  function decir(texto, ms = 2400) {
    if (!texto) return;
    burbuja.textContent = texto;
    burbuja.hidden = false;
    clearTimeout(tFrase);
    tFrase = setTimeout(() => { burbuja.hidden = true; }, ms);
  }
  function lado(l) {
    if (l === ladoBurbuja) return;
    burbuja.classList.remove("b-" + ladoBurbuja);
    burbuja.classList.add("b-" + l);
    ladoBurbuja = l;
  }
  burbuja.classList.add("b-arriba");

  function chispa(cx, cy) {
    const s = document.createElement("span");
    s.className = "chispa";
    s.style.left = cx + "px";
    s.style.top = cy + "px";
    document.body.appendChild(s);
    setTimeout(() => s.remove(), 600);
  }
  function aplastar(eje, origen) {
    golpe.style.transformOrigin = origen;
    golpe.classList.remove("golpe-x", "golpe-y");
    void golpe.offsetWidth;
    golpe.classList.add(eje === "x" ? "golpe-x" : "golpe-y");
  }
  const mirar = (x, y) => laica.mirar?.(x, y);
  const andar = (si) => laica.toggleAttribute("andar", si && !quieta);
  const ponerPatas = () => {
    if (opciones.cuatro) laica.setAttribute("patas", "cuatro");
    else laica.removeAttribute("patas");
  };
  const velAndar = () => (opciones.cuatro ? 130 : 75);
  ponerPatas();

  // ---------- Estado del movimiento ----------
  let x = -1000, y = -1000, vx = 0, vy = 0, esc = 1, rot = 0, rotObj = 0;
  let fase = "espera", tFase = 0, duracion = 0, choques = 0, maxChoques = 5;
  let asomada = null, arrastre = null, faseAntes = "volando";
  const raton = { x: -1, y: -1 };

  const ahora = () => performance.now();
  const suelo = () => innerHeight - ALTO;
  function cambiar(f, ms = 0) {
    fase = f;
    tFase = ahora();
    duracion = ms;
    andar(f === "caminando");
  }

  // Sin gravedad: vuela en línea recta y rebota.
  function volar(ang = entre(0, Math.PI * 2), velocidad = VEL) {
    vx = Math.cos(ang) * velocidad;
    vy = Math.sin(ang) * velocidad;
    if (Math.abs(vx) < 60) vx = 60 * (Math.sign(vx) || 1);
    choques = 0;
    maxChoques = 4 + Math.floor(Math.random() * 4);
    cambiar("volando", entre(18000, 32000));
  }
  // Con gravedad: sale disparada y cae.
  function soltar(nvx, nvy) {
    vx = nvx;
    vy = nvy;
    cambiar("cayendo");
  }
  function caminar(dir = Math.sign(vx) || (Math.random() < 0.5 ? -1 : 1)) {
    vx = dir * velAndar();
    vy = 0;
    y = suelo();
    choques = 0;
    maxChoques = 2 + Math.floor(Math.random() * 3);
    cambiar("caminando", entre(6000, 14000));
  }

  function asomo(borde) {
    const W = innerWidth, H = innerHeight;
    const yy = opciones.gravedad ? suelo() : H * entre(0.2, 0.7), xx = W * entre(0.15, 0.75);
    // Con gravedad se asoma de pie por un costado; sin gravedad, girada hacia adentro.
    const giro = opciones.gravedad ? 0 : null;
    switch (borde) {
      case "izq": return { borde, x0: -ANCHO - 30, y0: yy, x1: -ANCHO * 0.42, y1: yy, rot: giro ?? 90, burbuja: "der" };
      case "der": return { borde, x0: W + 30, y0: yy, x1: W - ANCHO * 0.58, y1: yy, rot: giro ?? -90, burbuja: "izq" };
      case "arriba": return { borde, x0: xx, y0: -ALTO - 30, x1: xx, y1: -ALTO * 0.45, rot: 180, burbuja: "abajo" };
      // Abajo se asoma por detrás de la barra de tareas.
      default: return { borde: "abajo", x0: xx, y0: H + 30, x1: xx, y1: H - ALTO * 0.55, rot: 0, burbuja: "arriba" };
    }
  }

  // ---------- Órdenes ----------
  function salir(d) {
    if (d.estado) laica.setAttribute("estado", d.estado);
    if (d.gravedad != null) { opciones.gravedad = d.gravedad; guardar("laica-gravedad", d.gravedad); }
    if (d.patas) { opciones.cuatro = d.patas === "cuatro"; guardar("laica-cuatro", opciones.cuatro); }
    ponerPatas();
    x = (d.x ?? innerWidth / 2) - ANCHO / 2;
    y = (d.y ?? innerHeight / 2) - ALTO / 2;
    rot = rotObj = 0;
    if (quieta) {
      x = innerWidth - ANCHO - 24;
      y = suelo();
      cambiar("quieta");
      decir(d.mensaje || al(FRASES.libre), 4000);
      return;
    }
    esc = 0.6;
    if (opciones.gravedad) soltar(entre(-260, 260), -900); // salta del navegador y cae
    else volar(-Math.PI / 2 + entre(-0.7, 0.7), VEL * 1.4);
    laica.girar?.("vuelta");
    if (d.mensaje) {
      decir(d.mensaje, 4200);
      setTimeout(() => decir(al(FRASES.libre)), 4400);
    } else decir(al(FRASES.libre));
  }

  function ordenar(o) {
    if (o === "gravedad") {
      opciones.gravedad = !opciones.gravedad;
      guardar("laica-gravedad", opciones.gravedad);
      decir(al(opciones.gravedad ? FRASES.gravedadSi : FRASES.gravedadNo));
      if (quieta || fase === "arrastrada") return;
      if (opciones.gravedad) soltar(vx * 0.5, Math.max(0, vy));
      else volar(-Math.PI / 2 + entre(-0.6, 0.6));
      return;
    }
    if (o === "cuatro") {
      opciones.cuatro = !opciones.cuatro;
      guardar("laica-cuatro", opciones.cuatro);
      ponerPatas();
      if (fase === "caminando") vx = Math.sign(vx) * velAndar();
      decir(al(opciones.cuatro ? FRASES.cuatroSi : FRASES.cuatroNo));
      return;
    }
    if (quieta) return;
    if (o === "explorar") {
      if (opciones.gravedad) { soltar(entre(-450, 450), -1100); decir(al(FRASES.salto)); }
      else { volar(); decir(al(FRASES.despegar)); }
    } else if (o === "caminar") {
      if (opciones.gravedad) { if (fase !== "caminando" && fase !== "cayendo") soltar(0, 0); }
      else { vx = Math.sign(vx || 1) * 120; vy = 260; cambiar("aterrizando"); }
    } else if (o === "asomarse") {
      if (opciones.gravedad && y >= suelo() - 2) {
        vx = (x + ANCHO / 2 < innerWidth / 2 ? -1 : 1) * velAndar() * 1.6;
        cambiar("saliendo");
      } else {
        vx = x + ANCHO / 2 < innerWidth / 2 ? -VEL * 1.5 : VEL * 1.5;
        vy = 0;
        cambiar("escapando");
      }
      decir(al(FRASES.escapar));
    }
  }

  // ---------- Bucle ----------
  let antes = ahora();
  function paso(t) {
    const dt = Math.min(0.05, (t - antes) / 1000);
    antes = t;
    const W = innerWidth, H = innerHeight;
    const k = 1 - Math.exp(-dt * 5);
    const enFase = t - tFase;

    // Mira el cursor si está cerca; si no, hacia donde va.
    const cx = x + ANCHO / 2, cy = y + ALTO * 0.35;
    const dx = raton.x - cx, dy = raton.y - cy;
    const cerca = raton.x >= 0 && dx * dx + dy * dy < 320 * 320;
    const mirarCursor = () => mirar(dx / 200, dy / 200);

    if (fase === "volando" || fase === "escapando") {
      x += vx * dt;
      y += vy * dt + Math.sin(t / 260) * 0.6;
      esc += (1 - esc) * k;
      rotObj = (vx / VEL) * 10;
      const v = Math.hypot(vx, vy) || 1;
      if (cerca) mirarCursor(); else mirar((vx / v) * 0.9, (vy / v) * 0.4);
      lado(y < 70 ? "abajo" : "arriba");

      if (fase === "volando") {
        let eje = null, origen = "", px = 0, py = 0;
        if (x < 0 && vx < 0) { eje = "x"; origen = "left center"; px = 0; py = y + ALTO / 2; }
        else if (x > W - ANCHO && vx > 0) { eje = "x"; origen = "right center"; px = W; py = y + ALTO / 2; }
        else if (y < 0 && vy < 0) { eje = "y"; origen = "center top"; px = x + ANCHO / 2; py = 0; }
        else if (y > H - ALTO && vy > 0) { eje = "y"; origen = "center bottom"; px = x + ANCHO / 2; py = H; }
        if (eje && choques >= maxChoques) {
          cambiar("escapando");
          vx *= 1.5; vy *= 1.5;
          decir(al(FRASES.escapar));
        } else if (eje) {
          if (eje === "x") { vx = -vx; x = Math.max(0, Math.min(W - ANCHO, x)); }
          else { vy = -vy; y = Math.max(0, Math.min(H - ALTO, y)); }
          choques++;
          aplastar(eje, origen);
          chispa(px, py);
          if (Math.random() < 0.5) decir(al(FRASES.choque));
          if (Math.random() < 0.2) laica.girar?.("vuelta");
        }
        if (enFase > duracion) { vx *= 0.5; vy = 240; cambiar("aterrizando"); }
      } else if (x < -ANCHO - 20 || x > W + 20 || y < -ALTO - 20 || y > H + 20) {
        cambiar("fuera", entre(1500, 3500));
      }
    } else if (fase === "cayendo") {
      // Con gravedad: parábola, rebotes en paredes, techo y suelo.
      vy += G * dt;
      x += vx * dt;
      y += vy * dt;
      esc += (1 - esc) * k;
      rotObj = Math.max(-20, Math.min(20, vx / 30));
      if (cerca) mirarCursor(); else mirar(Math.sign(vx) * Math.min(0.9, Math.abs(vx) / 300), Math.max(-0.5, Math.min(0.5, vy / 1200)));
      lado(y < 70 ? "abajo" : "arriba");
      if (x < 0 && vx < 0) { x = 0; vx = -vx * 0.75; aplastar("x", "left center"); chispa(0, y + ALTO / 2); if (Math.random() < 0.4) decir(al(FRASES.choque)); }
      if (x > W - ANCHO && vx > 0) { x = W - ANCHO; vx = -vx * 0.75; aplastar("x", "right center"); chispa(W, y + ALTO / 2); if (Math.random() < 0.4) decir(al(FRASES.choque)); }
      if (y < 0 && vy < 0) { y = 0; vy = -vy * 0.5; aplastar("y", "center top"); chispa(x + ANCHO / 2, 0); }
      if (y >= suelo() && vy > 0) {
        y = suelo();
        aplastar("y", "center bottom");
        if (vy > 420) { // rebota
          chispa(x + ANCHO / 2, H);
          vy = -vy * 0.42;
          vx *= 0.8;
        } else { // se queda en el suelo y camina
          if (Math.random() < 0.4) decir(al(FRASES.aterrizar));
          caminar(Math.sign(vx) || undefined);
        }
      }
    } else if (fase === "aterrizando") {
      x += vx * dt;
      y += vy * dt;
      x = Math.max(0, Math.min(W - ANCHO, x));
      rotObj = 0;
      if (y >= suelo()) {
        aplastar("y", "center bottom");
        chispa(x + ANCHO / 2, H);
        decir(al(FRASES.aterrizar));
        caminar(Math.sign(vx) || 1);
      }
    } else if (fase === "caminando" || fase === "saliendo") {
      x += vx * dt;
      y = suelo();
      rotObj = 0;
      esc += (1 - esc) * k;
      if (cerca && fase === "caminando") mirar(Math.sign(vx) * 0.9, Math.max(-0.4, Math.min(0.4, dy / 300)));
      else mirar(Math.sign(vx) * 0.9, 0.15);
      lado("arriba");
      if (fase === "saliendo") {
        if (x < -ANCHO - 20 || x > W + 20) cambiar("fuera", entre(1500, 3500));
      } else {
        const borde = (x < 0 && vx < 0) || (x > W - ANCHO && vx > 0);
        if (borde && opciones.gravedad && choques >= maxChoques) {
          cambiar("saliendo"); // se va caminando por el costado
          decir(al(FRASES.escapar));
        } else if (borde) {
          x = Math.max(0, Math.min(W - ANCHO, x));
          vx = -vx;
          choques++;
        } else if (enFase > duracion) {
          if (!opciones.gravedad) {
            volar(-Math.PI / 2 + entre(-0.6, 0.6));
            decir(al(FRASES.despegar));
          } else {
            const r = Math.random();
            if (r < 0.4) { soltar(Math.sign(vx) * entre(150, 350), -entre(650, 950)); if (Math.random() < 0.5) decir(al(FRASES.salto)); }
            else if (r < 0.75) { cambiar("sentada", entre(3000, 6000)); if (Math.random() < 0.5) decir(al(FRASES.sentarse)); }
            else caminar(-Math.sign(vx));
          }
        }
      }
    } else if (fase === "sentada") {
      y = suelo();
      if (cerca) mirarCursor(); else mirar(0, 0);
      if (enFase > duracion) caminar(Math.random() < 0.5 ? -1 : 1);
    } else if (fase === "fuera") {
      if (enFase > duracion) {
        const bordes = opciones.gravedad ? ["izq", "der"] : ["izq", "der", "arriba", "abajo", "abajo"];
        asomada = asomo(al(bordes));
        x = asomada.x0; y = asomada.y0;
        rot = rotObj = asomada.rot;
        mirar(asomada.borde === "izq" ? 0.7 : asomada.borde === "der" ? -0.7 : 0, 0);
        lado(asomada.burbuja);
        cambiar("asomando", entre(3000, 4500));
        asomada.dicho = false;
      }
    } else if (fase === "asomando") {
      x += (asomada.x1 - x) * k;
      y += (asomada.y1 - y) * k;
      if (enFase > 700 && !asomada.dicho) { asomada.dicho = true; decir(al(FRASES.asomar)); }
      if (enFase > duracion) {
        rotObj = 0;
        if (opciones.gravedad) caminar(asomada.borde === "izq" ? 1 : -1);
        else {
          // Entra de nuevo por ese mismo borde.
          const hacia = { izq: 0, der: Math.PI, arriba: Math.PI / 2, abajo: -Math.PI / 2 }[asomada.borde];
          volar(hacia + entre(-0.6, 0.6));
        }
      }
    } else if (fase === "arrastrada") {
      rotObj = 0;
      mirar(0, -0.4);
    } else if (fase === "quieta") {
      if (cerca) mirarCursor();
    }

    rot += (rotObj - rot) * k;
    caja.style.transform = `translate(${x}px, ${y}px)`;
    cuerpo.style.transform = `rotate(${rot}deg) scale(${esc})`;
    requestAnimationFrame(paso);
  }
  requestAnimationFrame(paso);

  // ---------- Ratón: los clics atraviesan la ventana salvo sobre Laica ----------
  window.addEventListener("mousemove", (e) => { raton.x = e.clientX; raton.y = e.clientY; });
  document.addEventListener("mouseleave", () => { raton.x = raton.y = -1; });
  caja.addEventListener("mouseenter", () => puente.raton(true));
  caja.addEventListener("mouseleave", () => { if (!arrastre) puente.raton(false); });
  caja.addEventListener("contextmenu", (e) => { e.preventDefault(); puente.menu({ ...opciones }); });

  caja.addEventListener("pointerdown", (e) => {
    if (e.button !== 0) return;
    caja.setPointerCapture(e.pointerId);
    caja.classList.add("arrastrando");
    arrastre = { dx: e.clientX - x, dy: e.clientY - y, x0: e.clientX, y0: e.clientY, movido: false, huella: [] };
    faseAntes = fase;
  });
  caja.addEventListener("pointermove", (e) => {
    if (!arrastre) return;
    if (!arrastre.movido && Math.hypot(e.clientX - arrastre.x0, e.clientY - arrastre.y0) > 6) {
      arrastre.movido = true;
      cambiar("arrastrada");
      decir(al(FRASES.agarrar));
    }
    if (!arrastre.movido) return;
    x = e.clientX - arrastre.dx;
    y = e.clientY - arrastre.dy;
    arrastre.huella.push({ x: e.clientX, y: e.clientY, t: ahora() });
    if (arrastre.huella.length > 8) arrastre.huella.shift();
  });
  caja.addEventListener("pointerup", (e) => {
    if (!arrastre) return;
    caja.releasePointerCapture(e.pointerId);
    caja.classList.remove("arrastrando");
    const a = arrastre;
    arrastre = null;
    if (!a.movido) { // fue un clic: caricia
      laica.girar?.("vuelta");
      decir(al(FRASES.cosquillas));
      return;
    }
    // Lanzamiento: la velocidad del arrastre en los últimos 120 ms.
    const h = a.huella.filter((p) => ahora() - p.t < 120);
    let lx = 0, ly = 0;
    if (h.length > 1) {
      const dtl = (h[h.length - 1].t - h[0].t) / 1000 || 0.016;
      lx = (h[h.length - 1].x - h[0].x) / dtl;
      ly = (h[h.length - 1].y - h[0].y) / dtl;
    }
    const rapidez = Math.hypot(lx, ly);
    if (rapidez > 1400) { lx *= 1400 / rapidez; ly *= 1400 / rapidez; }
    if (rapidez > VEL * 1.5) decir(al(FRASES.lanzar));
    if (faseAntes === "quieta") { cambiar("quieta"); return; }
    if (opciones.gravedad) { soltar(lx, ly); return; } // parábola de verdad

    const v = Math.min(1100, Math.max(VEL, rapidez));
    volar(rapidez > 40 ? Math.atan2(ly, lx) : -Math.PI / 2, v);
    // Frena poco a poco hasta la velocidad de crucero.
    const frenar = setInterval(() => {
      const s = Math.hypot(vx, vy);
      if (fase !== "volando" || s <= VEL) return clearInterval(frenar);
      vx *= 0.9; vy *= 0.9;
    }, 100);
  });

  // Recordatorios de salud cada 4 a 7 minutos (la misión sigue, aunque esté de paseo).
  (function recordar() {
    setTimeout(() => { if (fase !== "fuera") decir(al(FRASES.salud), 5000); recordar(); }, entre(240000, 420000));
  })();

  // Para las pruebas automáticas (modo captura).
  window.laicaDepurar = () => ({ fase, x: Math.round(x), y: Math.round(y), ...opciones, andar: laica.hasAttribute("andar"), patas: laica.getAttribute("patas") });

  puente.alSalir(salir);
  puente.alOrden(ordenar);
})();
