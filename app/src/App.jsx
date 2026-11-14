import { useCallback, useEffect, useMemo, useState } from "react";
import { INDICADORES, PRINCIPALES } from "./datos/indicadores.js";
import { generarMision, inicioParaHoy, ASTRONAUTA } from "./datos/generador.js";
import { guardarVarios, leerTodos, leerMeta, guardarMeta, vaciar, persistente } from "./datos/db.js";
import { evaluar, ordenar } from "./motor/reglas.js";
import Tarjeta from "./componentes/Tarjeta.jsx";
import Alertas from "./componentes/Alertas.jsx";
import CuerpoHumano from "./componentes/CuerpoHumano.jsx";
import Escena from "./componentes/Escena.jsx";
import Parche from "./componentes/Parche.jsx";
import { ZONAS } from "./datos/zonas.js";
import { zonaMasGrave } from "./datos/zonas.js";
import CheckIn from "./componentes/CheckIn.jsx";
import { useConversacion } from "./voz/useConversacion.js";

const DIAS = 30;
const SECUNDARIOS = ["spo2", "peso", "who5", "dosis"];
const DIA_MS = 86400000;
const CARICIAS = [
  "¡Guau! Digo… hola, tripulante.",
  "Otra caricia y te subo la racha. Es broma. ¿O no?",
  "Sigo aquí. Siempre. Es literalmente mi trabajo.",
  "Si me acaricias tanto, voy a pensar que extrañas la Tierra.",
  "Datos en orden y cola en movimiento. Día perfecto.",
  "¿Ya tomaste agua? Yo no puedo, el casco no me deja.",
  "Tu frecuencia cardiaca está bien. La mía subió: me caes bien.",
];

async function sembrar() {
  const inicio = inicioParaHoy(DIAS);
  const mision = generarMision({ inicio, dias: DIAS });
  await guardarVarios("mediciones", mision.mediciones);
  await guardarVarios("eventos", mision.eventos);
  await guardarMeta("inicio", inicio);
  await guardarMeta("generado", new Date().toISOString());
}

function agrupar(mediciones, dia) {
  const porIndicador = {};
  for (const m of mediciones.filter((x) => x.dia <= dia).sort(ordenar)) (porIndicador[m.indicador] ??= []).push(m);
  return porIndicador;
}

function saludo(datos, dia, esHoy) {
  const sueno = datos.sueno?.at(-1)?.valor;
  const hora = new Date().getHours();
  const hola = !esHoy ? "Repasemos ese día." : hora < 12 ? "¡Buenos días!" : hora < 19 ? "¡Buenas tardes!" : "¡Buenas noches!";
  const extra = sueno == null ? "" : sueno < 6
    ? ` Dormiste ${sueno} h. Hoy toca ir con calma.`
    : ` Dormiste ${sueno} h. Bien hecho, mejor que yo con mis 14.`;
  return `${hola} Día ${dia + 1} de la misión. Todo en orden.${extra}`;
}

export default function App() {
  const [mediciones, setMediciones] = useState(null);
  const [eventos, setEventos] = useState([]);
  const [inicio, setInicio] = useState(null);
  const [diaVista, setDiaVista] = useState(null); // null = hoy
  const [guarda, setGuarda] = useState(true);
  const [enLinea, setEnLinea] = useState(navigator.onLine);
  const [checkIn, setCheckIn] = useState(false);
  const [zona, setZona] = useState(null); // null = la zona más grave
  const [momento, setMomento] = useState({ estado: "saludar", texto: null }); // reacción breve de Laica

  const cargar = useCallback(async () => {
    if (!(await leerMeta("generado"))) await sembrar();
    setInicio((await leerMeta("inicio")) ?? inicioParaHoy(DIAS));
    setMediciones(await leerTodos("mediciones"));
    setEventos((await leerTodos("eventos")).sort((a, b) => a.dia - b.dia));
    setGuarda(await persistente());
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  useEffect(() => {
    const on = () => setEnLinea(true);
    const off = () => setEnLinea(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => { window.removeEventListener("online", on); window.removeEventListener("offline", off); };
  }, []);

  // Las reacciones breves (saludar, celebrar) duran 3 s y luego manda el estado de salud.
  useEffect(() => {
    if (!momento) return;
    const t = setTimeout(() => setMomento(null), 3000);
    return () => clearTimeout(t);
  }, [momento]);

  const diaHoy = inicio ? Math.max(DIAS - 1, Math.floor((Date.now() - Date.parse(inicio)) / DIA_MS)) : DIAS - 1;
  const dia = diaVista ?? diaHoy;
  const esHoy = dia === diaHoy;

  const datos = useMemo(() => (mediciones ? agrupar(mediciones, dia) : {}), [mediciones, dia]);
  const estado = useMemo(
    () => (mediciones ? evaluar({ mediciones, eventos, dia }) : null),
    [mediciones, eventos, dia]
  );

  const guardarCheckIn = async (valores) => {
    const ahora = new Date().toISOString();
    const nuevas = Object.entries(valores).map(([clave, valor]) => {
      const ind = INDICADORES[clave];
      return {
        id: `manual-${clave}-${Date.now()}`, astronauta_id: ASTRONAUTA.id, timestamp: ahora, dia: diaHoy,
        sistema: ind.sistema, indicador: clave, matriz_id: ind.matriz, valor, unidad: ind.unidad,
        fuente: "manual", calidad: 1,
      };
    });
    await guardarVarios("mediciones", nuevas);
    const todas = [...mediciones, ...nuevas];
    setMediciones(todas);
    setCheckIn(false);
    setDiaVista(null);
    const nuevoEstado = evaluar({ mediciones: todas, eventos, dia: diaHoy });
    setMomento(nuevoEstado.nivel === "verde"
      ? { estado: "celebrar", texto: `¡Gracias! Guardé ${nuevas.length} dato${nuevas.length > 1 ? "s" : ""} y todo está en orden.` }
      : null);
    return nuevoEstado;
  };

  const voz = useConversacion({ estado, guardar: guardarCheckIn, abrirCheckIn: () => setCheckIn(true) });

  const regenerar = async () => {
    await vaciar();
    setMediciones(null);
    setDiaVista(null);
    await cargar();
  };

  if (!mediciones || !estado) return <main className="cargando">Preparando la misión…</main>;

  const ultimo = (clave) => datos[clave]?.at(-1)?.valor;
  const serie = (clave) => datos[clave]?.map((m) => m.valor) ?? [];
  // Las alertas nunca esperan a que termine un saludo o una celebración.
  const estadoLaica = estado.nivel !== "verde" ? estado.estadoLaica
    : voz.hablando ? "hablar" : momento ? momento.estado : estado.estadoLaica;
  const mensaje = voz.respuesta ?? momento?.texto ?? estado.alertas[0]?.mensaje ?? saludo(datos, dia, esHoy);

  // Caricias: con todo en orden, Laica responde con humor (lado Duo/Wilson);
  // con una alerta, vuelve al tema (lado JARVIS). docs/12 §12.2.
  const acariciar = () => {
    if (estado.nivel !== "verde") { voz.decir(`Gracias, pero primero lo importante. ${estado.alertas[0].mensaje}`); return; }
    const frase = CARICIAS[Math.floor(Math.random() * CARICIAS.length)];
    setMomento({ estado: "celebrar", texto: null });
    voz.decir(frase);
  };

  const elegirZona = (id) => {
    setZona(id);
    voz.decir(`${ZONAS[id].nombre}. ${ZONAS[id].porque}`);
  };

  const tarjeta = (clave) => {
    const ind = INDICADORES[clave];
    const nivel = estado.porIndicador[clave];
    if (clave === "pa_sis") {
      return (
        <Tarjeta key={clave} titulo="Presión arterial" matriz={ind.matriz} unidad="mmHg" nivel={nivel}
          valor={`${ultimo("pa_sis")}/${ultimo("pa_dia")}`} serie={serie("pa_sis")} detalle="Sistólica / diastólica" />
      );
    }
    return (
      <Tarjeta key={clave} titulo={ind.corto} matriz={ind.matriz} unidad={ind.unidad} nivel={nivel}
        valor={ultimo(clave)} serie={serie(clave)} detalle={ind.frecuencia === "semanal" ? "Medición semanal" : null} />
    );
  };

  return (
    <main className={`general-${estado.nivel}`}>
      <header className="barra">
        <div className="marca">
          <Parche tamano={58} />
          <div>
            <p className="sobretitulo">NASA Space Apps Challenge 2026 · Equipo Ecuador</p>
            <h1>Misión Laica</h1>
            <p>Monitoreo de salud de la tripulación · {ASTRONAUTA.nombre} · {ASTRONAUTA.mision}</p>
          </div>
        </div>
        <span className={`conexion ${enLinea ? "si" : "no"}`}>{enLinea ? "Con conexión" : "Sin conexión · modo offline"}</span>
      </header>

      <section className="linea-tiempo" aria-label="Día de la misión">
        <label htmlFor="dia">Día {dia + 1} de {diaHoy + 1}{esHoy ? " · hoy" : ""}</label>
        <input id="dia" type="range" min="0" max={diaHoy} value={dia}
          onChange={(e) => { const d = Number(e.target.value); setDiaVista(d === diaHoy ? null : d); setMomento(null); voz.limpiar(); }} />
        {!esHoy && <button type="button" onClick={() => setDiaVista(null)}>Volver a hoy</button>}
      </section>

      <Escena estadoLaica={estadoLaica} mensaje={mensaje} nivel={estado.nivel} voz={voz} esHoy={esHoy}
        checkIn={checkIn} onCheckIn={() => setCheckIn(true)} onAcariciar={acariciar} />

      {checkIn && <CheckIn onGuardar={guardarCheckIn} onCerrar={() => setCheckIn(false)} />}

      <h2>Alertas</h2>
      <Alertas alertas={estado.alertas} />

      <h2>Mapa del cuerpo</h2>
      <CuerpoHumano estado={estado} ultimo={ultimo} seleccion={zona ?? zonaMasGrave(estado)} onSeleccion={elegirZona} />

      <h2>Indicadores del reto</h2>
      <section className="rejilla">{PRINCIPALES.map(tarjeta)}</section>

      <h2>Otros indicadores</h2>
      <section className="rejilla">{SECUNDARIOS.map(tarjeta)}</section>

      <h2>Eventos de la misión</h2>
      <ol className="eventos">
        {eventos.map((e) => (
          <li key={e.id} className={`evento ${e.tipo}${dia >= e.dia && dia <= e.hasta ? " activo" : ""}`}>
            <button type="button" className="dias" onClick={() => { setDiaVista(e.dia === diaHoy ? null : e.hasta); setMomento(null); }}
              title="Ver la misión ese día">
              Día {e.dia + 1}{e.hasta > e.dia ? `–${e.hasta + 1}` : ""}
            </button>
            <strong>{e.titulo}</strong>
            <span>{e.detalle}</span>
          </li>
        ))}
      </ol>

      <footer>
        <p>
          Datos simulados de {DIAS} días. {guarda ? "Se guardan solo en este dispositivo." : "Este navegador no permite guardar: los datos viven en memoria."}
          {" "}Umbrales ilustrativos. Prototipo educativo, no es un dispositivo médico.
          {voz.soporte.escuchar && " Al hablar con Laica, el navegador envía el audio a su servicio de reconocimiento de voz."}
        </p>
        <p className="credito">
          Proyecto para el reto "Create Health Monitoring Software for Astronauts on Space Missions" del NASA Space Apps Challenge 2026.
          No está afiliado ni respaldado por la NASA. Fuentes públicas de NASA, CSA, OMS, OPS y MSP Ecuador.
        </p>
        <button type="button" onClick={regenerar}>Regenerar datos de prueba</button>
      </footer>
    </main>
  );
}
