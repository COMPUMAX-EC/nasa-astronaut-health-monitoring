import { useEffect, useRef, useState } from "react";

// Laica suelta: se escapa de la escena, vuela por toda la pantalla, rebota contra los bordes
// (se aplasta y suelta una chispa), al final se sale de la pantalla y se asoma por un borde
// antes de volver a su sitio. Solo cuando todo está en verde; si aparece una alerta, vuelve ya.
// Con gravedad: salta, cae, rebota en el borde de abajo y camina por él (en dos o cuatro patas).

const FRASES = {
  salir: ["¡Me voy a explorar!", "Este panel me queda chico.", "Vuelvo enseguida… creo."],
  choque: ["¡Auch!", "¿Quién puso esta pared?", "Bordes 1, Laica 0.", "¡Boing!", "Eso no estaba en el manual."],
  escapar: ["Adiós, pantalla.", "¡Al infinito!", "No me sigas."],
  asomar: ["¿Me extrañaste?", "Psst… sigo aquí.", "¿Ya tomaste agua?", "Te estoy vigilando 👀"],
  cosquillas: ["¡Jaja, cosquillas!", "¡Eh, que estoy volando!"],
};
const al = (l) => l[Math.floor(Math.random() * l.length)];

const ANCHO = 120;
const ALTO = Math.round(ANCHO * 340 / 300); // proporción del dibujo de Laica
const VEL = 250; // px/s
const G = 1500;  // gravedad, px/s²

// Dónde se asoma según el borde: posición (fuera y asomada), giro para que la cabeza apunte
// hacia adentro y lado de la burbuja.
function asomo(borde, W, H) {
  const y = H * (0.2 + Math.random() * 0.5), x = W * (0.15 + Math.random() * 0.6);
  switch (borde) {
    case "izq-suelo": return { x0: -ANCHO - 30, y0: H - ALTO, x1: -ANCHO * 0.42, y1: H - ALTO, rot: 0, burbuja: "der" };
    case "der-suelo": return { x0: W + 30, y0: H - ALTO, x1: W - ANCHO * 0.58, y1: H - ALTO, rot: 0, burbuja: "izq" };
    case "izq": return { x0: -ANCHO - 30, y0: y, x1: -ANCHO * 0.42, y1: y, rot: 90, burbuja: "der" };
    case "der": return { x0: W + 30, y0: y, x1: W - ANCHO * 0.58, y1: y, rot: -90, burbuja: "izq" };
    case "arriba": return { x0: x, y0: -ALTO - 30, x1: x, y1: -ALTO * 0.45, rot: 180, burbuja: "abajo" };
    default: return { x0: x, y0: H + 30, x1: x, y1: H - ALTO * 0.55, rot: 0, burbuja: "arriba" };
  }
}

export default function LaicaLibre({ estado, activa, casa, onVolver, onAcariciar, gravedad = false, cuatro = false }) {
  const capa = useRef(null);
  const cuerpo = useRef(null);
  const golpe = useRef(null);
  const laica = useRef(null);
  const chispas = useRef(null);
  const [frase, setFrase] = useState(() => al(FRASES.salir));
  const [lado, setLado] = useState("arriba");
  const activaRef = useRef(activa);
  activaRef.current = activa;
  const volverRef = useRef(onVolver);
  volverRef.current = onVolver;
  const decirRef = useRef(() => {});
  const gravedadRef = useRef(gravedad);
  gravedadRef.current = gravedad;

  useEffect(() => {
    let tFrase;
    const decir = (texto) => {
      setFrase(texto);
      clearTimeout(tFrase);
      tFrase = setTimeout(() => setFrase(""), 2000);
    };
    decirRef.current = decir;
    tFrase = setTimeout(() => setFrase(""), 2000);

    let ladoActual = "arriba";
    const ponerLado = (l) => { if (l !== ladoActual) { ladoActual = l; setLado(l); } };

    const chispa = (cx, cy) => {
      const s = document.createElement("span");
      s.className = "chispa";
      s.style.left = `${cx}px`;
      s.style.top = `${cy}px`;
      chispas.current?.appendChild(s);
      setTimeout(() => s.remove(), 600);
    };
    const aplastar = (eje, origen) => {
      laica.current?.sacudir?.(1); // las orejas rebotan con el golpe
      const g = golpe.current;
      if (!g) return;
      g.style.transformOrigin = origen;
      g.classList.remove("golpe-x", "golpe-y");
      void g.offsetWidth;
      g.classList.add(eje === "x" ? "golpe-x" : "golpe-y");
    };

    const r0 = casa();
    let x = r0 ? r0.left + r0.width / 2 - ANCHO / 2 : innerWidth / 2 - ANCHO / 2;
    let y = r0 ? r0.top + r0.height / 2 - ALTO / 2 : innerHeight / 2 - ALTO / 2;
    let esc = r0 && r0.width ? r0.width / ANCHO : 1;
    const ang = -Math.PI / 2 + (Math.random() - 0.5) * 2; // sale hacia arriba, en diagonal
    let vx = Math.cos(ang) * VEL, vy = Math.sin(ang) * VEL;
    let fase = "volando", choques = 0;
    const andar = (si) => laica.current?.toggleAttribute("andar", si);
    const velAndar = () => (laica.current?.getAttribute("patas") === "cuatro" ? 130 : 75);
    if (gravedadRef.current) { vx = (Math.random() - 0.5) * 400; vy = -850; fase = "cayendo"; }
    const maxChoques = 3 + Math.floor(Math.random() * 3);
    let rot = 0, rotObj = 0, asomada = null;
    const inicio = performance.now();
    let tFase = inicio, antes = inicio, raf = 0;

    let duracion = 0;
    const cambiar = (f, t, ms = 0) => {
      fase = f; tFase = t; duracion = ms; andar(f === "caminando" || f === "saliendo");
      laica.current?.rastrear?.(f === "caminando" && Math.random() < 0.35); // a veces camina rastreando
    };

    const paso = (t) => {
      const dt = Math.min(0.05, (t - antes) / 1000);
      antes = t;
      const W = innerWidth, H = innerHeight;
      const k = 1 - Math.exp(-dt * 5); // suavizado independiente de los fps
      const el = laica.current;

      if (!activaRef.current && fase !== "volviendo") cambiar("volviendo", t);
      // Si cambian la gravedad mientras vuela o camina, se adapta.
      if (gravedadRef.current && fase === "volando") cambiar("cayendo", t);
      if (!gravedadRef.current && (fase === "cayendo" || fase === "caminando")) { vy = -VEL; vx = (Math.sign(vx) || 1) * VEL * 0.6; cambiar("volando", t); }

      if (fase === "cayendo") {
        vy += G * dt;
        x += vx * dt;
        y += vy * dt;
        esc += (1 - esc) * k;
        rotObj = Math.max(-20, Math.min(20, vx / 30));
        el?.mirar?.(Math.sign(vx) * Math.min(0.9, Math.abs(vx) / 300), Math.max(-0.5, Math.min(0.5, vy / 1200)));
        ponerLado(y < 70 ? "abajo" : "arriba");
        if (x < 0 && vx < 0) { x = 0; vx = -vx * 0.75; aplastar("x", "left center"); chispa(0, y + ALTO / 2); }
        if (x > W - ANCHO && vx > 0) { x = W - ANCHO; vx = -vx * 0.75; aplastar("x", "right center"); chispa(W, y + ALTO / 2); }
        if (y < 0 && vy < 0) { y = 0; vy = -vy * 0.5; }
        if (y >= H - ALTO && vy > 0) {
          y = H - ALTO;
          aplastar("y", "center bottom");
          if (vy > 420) { chispa(x + ANCHO / 2, H); vy = -vy * 0.42; vx *= 0.8; if (Math.random() < 0.4) decir(al(FRASES.choque)); if (vy < -500) el?.quejarse?.(0.45); }
          else { vx = (Math.sign(vx) || 1) * velAndar(); vy = 0; cambiar("caminando", t, 5000 + Math.random() * 6000); }
        }
      } else if (fase === "caminando" || fase === "saliendo") {
        x += vx * dt;
        y = H - ALTO;
        rotObj = 0;
        esc += (1 - esc) * k;
        el?.mirar?.(Math.sign(vx) * 0.9, 0.15);
        ponerLado("arriba");
        if (fase === "saliendo") {
          if (x < -ANCHO - 20 || x > W + 20) cambiar("fuera", t);
        } else if ((x < 0 && vx < 0) || (x > W - ANCHO && vx > 0)) {
          if (choques >= 2) { cambiar("saliendo", t); decir(al(FRASES.escapar)); el?.ladrar?.(0.6); }
          else { x = Math.max(0, Math.min(W - ANCHO, x)); vx = -vx; choques++; }
        } else if (t - tFase > duracion) {
          vx = Math.sign(vx) * (150 + Math.random() * 200);
          vy = -(650 + Math.random() * 300);
          cambiar("cayendo", t);
        }
        if (t - inicio > 30000) cambiar("volviendo", t);
      }

      else if (fase === "volando" || fase === "escapando") {
        x += vx * dt;
        y += vy * dt + Math.sin(t / 260) * 0.6; // un poco de vaivén
        esc += (1 - esc) * k;
        rotObj = (vx / VEL) * 10;
        el?.mirar?.(Math.sign(vx) * 0.9, (vy / VEL) * 0.4);
        ponerLado(y < 70 ? "abajo" : "arriba");

        if (fase === "volando") {
          const salir = choques >= maxChoques;
          let eje = null, origen = "", cx = 0, cy = 0;
          if (x < 0 && vx < 0) { eje = "x"; origen = "left center"; cx = 0; cy = y + ALTO / 2; }
          else if (x > W - ANCHO && vx > 0) { eje = "x"; origen = "right center"; cx = W; cy = y + ALTO / 2; }
          else if (y < 0 && vy < 0) { eje = "y"; origen = "center top"; cx = x + ANCHO / 2; cy = 0; }
          else if (y > H - ALTO && vy > 0) { eje = "y"; origen = "center bottom"; cx = x + ANCHO / 2; cy = H; }
          if (eje && salir) {
            cambiar("escapando", t);
            vx *= 1.5; vy *= 1.5;
            decir(al(FRASES.escapar));
            el?.ladrar?.(0.6);
          } else if (eje) {
            if (eje === "x") { vx = -vx; x = Math.max(0, Math.min(W - ANCHO, x)); }
            else { vy = -vy; y = Math.max(0, Math.min(H - ALTO, y)); }
            choques++;
            aplastar(eje, origen);
            chispa(cx, cy);
            if (Math.random() < 0.55) decir(al(FRASES.choque));
            if (Math.random() < 0.35) el?.quejarse?.(0.45);
            if (Math.random() < 0.25) el?.girar?.("vuelta");
          }
          if (t - inicio > 30000) cambiar("volviendo", t);
        } else if (x < -ANCHO - 20 || x > W + 20 || y < -ALTO - 20 || y > H + 20) {
          cambiar("fuera", t);
        }
      } else if (fase === "fuera") {
        if (t - tFase > 1800) {
          const borde = gravedadRef.current ? al(["izq-suelo", "der-suelo"]) : al(["izq", "der", "arriba", "abajo"]);
          asomada = asomo(borde, W, H);
          x = asomada.x0; y = asomada.y0; rot = rotObj = asomada.rot;
          esc = 1;
          el?.mirar?.(0, 0);
          ponerLado(asomada.burbuja);
          cambiar("asomando", t);
        }
      } else if (fase === "asomando") {
        x += (asomada.x1 - x) * k;
        y += (asomada.y1 - y) * k;
        if (t - tFase > 700 && !asomada.dicho) { asomada.dicho = true; decir(al(FRASES.asomar)); if (Math.random() < 0.5) el?.ladrar?.(0.55); else el?.grunir?.(0.55); }
        if (t - tFase > 3400) cambiar("volviendo", t);
      } else if (fase === "volviendo") {
        const r = casa();
        const tx = r ? r.left + r.width / 2 - ANCHO / 2 : W / 2 - ANCHO / 2;
        const ty = r ? r.top + r.height / 2 - ALTO / 2 : H / 2 - ALTO / 2;
        const escObj = r && r.width ? r.width / ANCHO : 1;
        x += (tx - x) * k;
        y += (ty - y) * k;
        esc += (escObj - esc) * k;
        rotObj = 0;
        ponerLado(ty < 70 ? "abajo" : "arriba");
        el?.mirar?.(Math.max(-0.8, Math.min(0.8, (tx - x) / 200)), 0);
        if (Math.abs(tx - x) < 2 && Math.abs(ty - y) < 2 && Math.abs(rot) < 2) {
          el?.mirar?.(0, 0);
          volverRef.current();
          return;
        }
      }

      rot += (rotObj - rot) * k;
      if (capa.current) capa.current.style.transform = `translate(${x}px, ${y}px)`;
      if (cuerpo.current) cuerpo.current.style.transform = `rotate(${rot}deg) scale(${esc})`;
      raf = requestAnimationFrame(paso);
    };
    raf = requestAnimationFrame(paso);

    return () => { cancelAnimationFrame(raf); clearTimeout(tFrase); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const tocar = () => {
    laica.current?.girar?.("vuelta");
    decirRef.current(al(FRASES.cosquillas));
    laica.current?.grunir?.(0.6);
    onAcariciar();
  };

  return (
    <>
      <div ref={chispas} aria-hidden="true" />
      <div ref={capa} className="libre" style={{ width: ANCHO, height: ALTO }}>
        <div ref={cuerpo} className="libre-cuerpo">
          <div ref={golpe} className="libre-golpe">
            <button type="button" className="libre-boton" onClick={tocar} aria-label="Acariciar a Laica (está explorando)">
              <laica-mascota ref={laica} estado={estado} tamano={String(ANCHO)} patas={cuatro ? "cuatro" : undefined}></laica-mascota>
            </button>
          </div>
        </div>
        {frase && <p className={`libre-burbuja b-${lado}`} aria-hidden="true">{frase}</p>}
      </div>
    </>
  );
}
