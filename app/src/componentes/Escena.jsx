import { useEffect, useMemo, useRef, useState } from "react";
import SelectorVoz from "./SelectorVoz.jsx";
import LaicaLibre from "./LaicaLibre.jsx";
import { useVentanaLaica } from "./useVentanaLaica.js";

// Escena principal: Laica es la protagonista. Flota y pasea por el espacio cuando todo va
// bien, y se planta al frente cuando hay una alerta. Al bajar por la página, una Laica
// pequeña sigue acompañando desde la esquina (la compañía constante del plan, docs/12 §12.2).

// Opciones que se recuerdan en este navegador (las comparte con la app de escritorio por el enlace).
function leerOpcion(clave) {
  try { return localStorage.getItem(clave) === "1"; } catch { return false; }
}
function guardarOpcion(clave, valor) {
  try { localStorage.setItem(clave, valor ? "1" : "0"); } catch { /* sin almacenamiento */ }
}

function estrellas(n, semilla = 7) {
  let s = semilla;
  const r = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  return Array.from({ length: n }, (_, i) => ({
    id: i, x: r() * 100, y: r() * 100, t: 1 + r() * 2.2, d: r() * 4, dur: 2 + r() * 3,
  }));
}

function Controles({ voz, esHoy, checkIn, onCheckIn, mensaje, compacto = false }) {
  return (
    <div className="botones-laica">
      {esHoy && !checkIn && !compacto && (
        <button type="button" className="primario" onClick={onCheckIn}>Hacer check-in</button>
      )}
      {esHoy && voz.soporte.escuchar && (
        <button type="button" className={`microfono${voz.escuchando ? " activo" : ""}`} onClick={voz.alternarMicrofono}
          aria-pressed={voz.escuchando} title="El navegador envía el audio a su servicio de reconocimiento de voz">
          <span aria-hidden="true">🎤</span>{compacto ? "" : voz.escuchando ? " Detener" : " Hablar con Laica"}
          {compacto && <span className="solo-lector">{voz.escuchando ? "Detener" : "Hablar con Laica"}</span>}
        </button>
      )}
      {voz.soporte.hablar && !compacto && (
        <button type="button" onClick={() => voz.alternarVoz(mensaje)} aria-pressed={voz.vozActiva}>
          <span aria-hidden="true">{voz.vozActiva ? "🔊" : "🔇"}</span> {voz.vozActiva ? "Voz activada" : "Voz apagada"}
        </button>
      )}
    </div>
  );
}

export default function Escena({ estadoLaica, mensaje, nivel, voz, esHoy, checkIn, onCheckIn, onAcariciar }) {
  const cielo = useMemo(() => estrellas(70), []);
  const ref = useRef(null);
  const laicaRef = useRef(null);
  const miniRef = useRef(null);
  const [visible, setVisible] = useState(true);
  const [salto, setSalto] = useState(false);
  const [libre, setLibre] = useState(false);
  const visibleRef = useRef(true);
  visibleRef.current = visible;
  const fuera = useVentanaLaica({ estado: estadoLaica, mensaje, onAcariciar });
  const [enEscritorio, setEnEscritorio] = useState(false);
  const [gravedad, setGravedad] = useState(() => leerOpcion("laica-gravedad"));
  const [cuatro, setCuatro] = useState(() => leerOpcion("laica-cuatro"));
  const alternarGravedad = () => setGravedad((g) => { guardarOpcion("laica-gravedad", !g); return !g; });
  const alternarCuatro = () => setCuatro((c) => { guardarOpcion("laica-cuatro", !c); return !c; });
  // Ladridos reales: se pueden silenciar (lo guarda el propio componente de Laica).
  const [sonido, setSonido] = useState(() => window.LaicaSonido?.activo?.() ?? true);
  const alternarSonido = () => setSonido((v) => {
    window.LaicaSonido?.poner?.(!v);
    if (!v) window.LaicaSonido?.tocar?.("ladrido", 0.6);
    return !v;
  });
  const patas = cuatro ? "cuatro" : undefined;
  const conRaton = typeof window !== "undefined" && window.matchMedia?.("(pointer: fine)").matches;

  // Fuera del navegador: abre la app de escritorio de Laica (carpeta escritorio/) con un enlace
  // laica:// y le pasa el punto de la pantalla donde está ahora, para que salte desde ahí.
  const alEscritorio = () => {
    const r = laicaRef.current?.getBoundingClientRect();
    const barra = Math.max(0, window.outerHeight - window.innerHeight); // pestañas y barra de direcciones
    const q = new URLSearchParams({
      x: String(Math.round(window.screenX + (r ? r.left + r.width / 2 : window.innerWidth / 2))),
      y: String(Math.round(window.screenY + barra + (r ? r.top + r.height / 2 : window.innerHeight / 2))),
      estado: estadoLaica,
      msg: "¡Salí del navegador!",
      gravedad: gravedad ? "1" : "0",
      patas: cuatro ? "cuatro" : "dos",
    });
    window.location.href = `laica://salir?${q}`;
    setEnEscritorio(true);
  };
  const traerDeVuelta = () => {
    window.location.href = "laica://volver";
    setEnEscritorio(false);
  };

  useEffect(() => {
    if (!ref.current || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.15 });
    io.observe(ref.current);
    return () => io.disconnect();
  }, []);

  const tranquila = nivel === "verde";
  const sinMovimiento = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  const puedeSalir = tranquila && !sinMovimiento && !fuera.abierta && !enEscritorio;
  const ausente = libre || fuera.abierta || enEscritorio; // Laica no está en su sitio
  // Dónde vuelve: a la escena si se ve, o a la esquina de compañía si se bajó por la página.
  const casa = () => (visibleRef.current ? laicaRef.current : miniRef.current)?.getBoundingClientRect();

  // Cada tanto, si todo está en verde y nadie le está hablando, se escapa a explorar la pantalla.
  useEffect(() => {
    if (!puedeSalir || libre || voz.escuchando || voz.pendiente) return;
    const t = setTimeout(() => { if (!document.hidden) setLibre(true); }, 15000 + Math.random() * 20000);
    return () => clearTimeout(t);
  }, [puedeSalir, libre, voz.escuchando, voz.pendiente]);
  const acariciar = () => {
    setSalto(false);
    requestAnimationFrame(() => setSalto(true)); // reinicia la animación aunque se toque seguido
    // Al acariciarla se da una vuelta en 3D (o muestra la espalda), salvo si hay una alerta.
    if (nivel === "verde") {
      const el = visible ? laicaRef.current : miniRef.current;
      el?.girar?.(Math.random() < 0.6 ? "vuelta" : "espaldas");
    }
    // Al acariciarla ladra (o gruñe juguetona); con alertas serias, no hace ruido.
    if (nivel === "verde" || nivel === "amarillo") {
      const el = visible ? laicaRef.current : miniRef.current;
      if (Math.random() < 0.7) el?.ladrar?.(0.6); else el?.grunir?.(0.6);
    }
    onAcariciar();
  };
  useEffect(() => {
    if (!salto) return;
    const t = setTimeout(() => setSalto(false), 700);
    return () => clearTimeout(t);
  }, [salto]);

  return (
    <>
      <section ref={ref} className={`escena-espacial nivel-${nivel}`} aria-live="polite">
        <div className="cielo" aria-hidden="true">
          {cielo.map((s) => (
            <span key={s.id} className="estrella" style={{
              left: `${s.x}%`, top: `${s.y}%`, width: s.t, height: s.t,
              animationDelay: `${s.d}s`, animationDuration: `${s.dur}s`,
            }} />
          ))}
          <span className="fugaz" />
          <span className="fugaz dos" />
          <span className="planeta" />
          <span className="luna" />
        </div>

        <div className={`escenario ${tranquila ? "pasea" : "al-frente"}`}>
          <button type="button" className={`laica-boton${salto ? " salta" : ""}${ausente ? " oculta" : ""}`} onClick={acariciar}
            aria-label="Acariciar a Laica">
            <laica-mascota ref={laicaRef} estado={estadoLaica} tamano="230" seguir="" curiosa="" patas={patas}></laica-mascota>
          </button>
          <span className="sombra-laica" aria-hidden="true" />
        </div>

        <div className="dialogo">
          <p className={`burbuja nivel-${nivel}`}>{mensaje}</p>
          {voz.escuchando && (
            <p className="oyendo" role="status"><span className="onda" aria-hidden="true"></span>{voz.parcial || "Te escucho…"}</p>
          )}
          {voz.pendiente && (
            <div className="confirmar" role="group" aria-label="Confirmar datos dictados">
              <button type="button" className="primario" onClick={() => voz.responderPendiente(true)}>Sí, guardar</button>
              <button type="button" onClick={() => voz.responderPendiente(false)}>No</button>
            </div>
          )}
          <Controles voz={voz} esHoy={esHoy} checkIn={checkIn} onCheckIn={onCheckIn} mensaje={mensaje} />
          {voz.vozActiva && voz.soporte.hablar && <SelectorVoz />}
          {(puedeSalir || fuera.abierta || conRaton) && (
            <div className="botones-laica escapadas">
              {puedeSalir && !libre && (
                <button type="button" onClick={() => setLibre(true)}><span aria-hidden="true">🚀</span> Déjala explorar</button>
              )}
              <button type="button" onClick={alternarGravedad} aria-pressed={gravedad}>
                <span aria-hidden="true">{gravedad ? "🌍" : "🪐"}</span> Gravedad: {gravedad ? "sí" : "no"}
              </button>
              <button type="button" onClick={alternarSonido} aria-pressed={sonido}>
                <span aria-hidden="true">{sonido ? "🐶" : "🔕"}</span> Ladridos: {sonido ? "sí" : "no"}
              </button>
              <button type="button" onClick={alternarCuatro} aria-pressed={cuatro}>
                <span aria-hidden="true">🐾</span> {cuatro ? "En cuatro patas" : "En dos patas"}
              </button>
              {conRaton && !fuera.abierta && (
                <button type="button" onClick={enEscritorio ? traerDeVuelta : alEscritorio} aria-pressed={enEscritorio}>
                  <span aria-hidden="true">🖥️</span> {enEscritorio ? "Traer a Laica de vuelta" : "Sacarla al escritorio"}
                </button>
              )}
              {fuera.soportada && !enEscritorio && (
                <button type="button" onClick={fuera.abierta ? fuera.cerrar : fuera.abrir} aria-pressed={fuera.abierta}>
                  <span aria-hidden="true">🪟</span> {fuera.abierta ? "Traer a Laica de vuelta" : "Sacarla del navegador"}
                </button>
              )}
            </div>
          )}
          <p className="pista">{enEscritorio
            ? "Laica anda por tu escritorio: agárrala y lánzala, o clic derecho sobre ella para el menú. Si no apareció, instala la app de escritorio (carpeta escritorio/ del repositorio)."
            : fuera.abierta
              ? "Laica está en una ventanita flotante: arrástrala a cualquier parte de tu pantalla."
              : "Toca a Laica para saludarla."}</p>
        </div>
      </section>

      {!visible && (
        <aside className={`compania nivel-${nivel}`} aria-label="Laica te acompaña">
          <button type="button" className={`compania-laica${ausente ? " oculta" : ""}`} onClick={acariciar} aria-label="Acariciar a Laica">
            <laica-mascota ref={miniRef} estado={estadoLaica} tamano="92" seguir="" curiosa="" patas={patas}></laica-mascota>
          </button>
          <div className="compania-texto">
            <p>{voz.escuchando ? voz.parcial || "Te escucho…" : mensaje}</p>
            {voz.pendiente ? (
              <div className="confirmar">
                <button type="button" className="primario" onClick={() => voz.responderPendiente(true)}>Sí</button>
                <button type="button" onClick={() => voz.responderPendiente(false)}>No</button>
              </div>
            ) : (
              <div className="compania-acciones">
                <Controles voz={voz} esHoy={esHoy} checkIn={checkIn} onCheckIn={onCheckIn} mensaje={mensaje} compacto />
                <button type="button" onClick={() => ref.current?.scrollIntoView({ behavior: "smooth" })} aria-label="Volver arriba con Laica">↑</button>
              </div>
            )}
          </div>
        </aside>
      )}

      {libre && (
        <LaicaLibre estado={estadoLaica} activa={puedeSalir} casa={casa} gravedad={gravedad} cuatro={cuatro}
          onVolver={() => setLibre(false)} onAcariciar={onAcariciar} />
      )}
    </>
  );
}
