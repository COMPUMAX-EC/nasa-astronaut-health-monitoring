import { useEffect, useMemo, useRef, useState } from "react";
import SelectorVoz from "./SelectorVoz.jsx";

// Escena principal: Laica es la protagonista. Flota y pasea por el espacio cuando todo va
// bien, y se planta al frente cuando hay una alerta. Al bajar por la página, una Laica
// pequeña sigue acompañando desde la esquina (la compañía constante del plan, docs/12 §12.2).

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

  useEffect(() => {
    if (!ref.current || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.15 });
    io.observe(ref.current);
    return () => io.disconnect();
  }, []);

  const tranquila = nivel === "verde";
  const acariciar = () => {
    setSalto(false);
    requestAnimationFrame(() => setSalto(true)); // reinicia la animación aunque se toque seguido
    // Al acariciarla se da una vuelta en 3D (o muestra la espalda), salvo si hay una alerta.
    if (nivel === "verde") {
      const el = visible ? laicaRef.current : miniRef.current;
      el?.girar?.(Math.random() < 0.6 ? "vuelta" : "espaldas");
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
          <button type="button" className={`laica-boton${salto ? " salta" : ""}`} onClick={acariciar}
            aria-label="Acariciar a Laica">
            <laica-mascota ref={laicaRef} estado={estadoLaica} tamano="230" seguir="" curiosa=""></laica-mascota>
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
          <p className="pista">Toca a Laica para saludarla.</p>
        </div>
      </section>

      {!visible && (
        <aside className={`compania nivel-${nivel}`} aria-label="Laica te acompaña">
          <button type="button" className="compania-laica" onClick={acariciar} aria-label="Acariciar a Laica">
            <laica-mascota ref={miniRef} estado={estadoLaica} tamano="92" seguir="" curiosa=""></laica-mascota>
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
    </>
  );
}
