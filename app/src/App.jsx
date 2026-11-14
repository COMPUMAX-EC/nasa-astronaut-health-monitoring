import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { INDICADORES, PRINCIPALES } from "./datos/indicadores.js";
import { generarMision, inicioParaHoy, ASTRONAUTA } from "./datos/generador.js";
import { guardarVarios, leerTodos, leerMeta, guardarMeta, vaciar, persistente } from "./datos/db.js";
import Tarjeta from "./componentes/Tarjeta.jsx";

const DIAS = 30;
const SECUNDARIOS = ["spo2", "peso", "who5", "dosis"];

async function sembrar() {
  const mision = generarMision({ inicio: inicioParaHoy(DIAS), dias: DIAS });
  await guardarVarios("mediciones", mision.mediciones);
  await guardarVarios("eventos", mision.eventos);
  await guardarMeta("generado", new Date().toISOString());
}

function agrupar(mediciones) {
  const porIndicador = {};
  for (const m of [...mediciones].sort((a, b) => a.timestamp.localeCompare(b.timestamp))) {
    (porIndicador[m.indicador] ??= []).push(m);
  }
  return porIndicador;
}

function saludo(datos) {
  const sueno = datos.sueno?.at(-1)?.valor;
  const dia = (datos.fc?.at(-1)?.dia ?? DIAS - 1) + 1;
  const hora = new Date().getHours();
  const hola = hora < 12 ? "¡Buenos días!" : hora < 19 ? "¡Buenas tardes!" : "¡Buenas noches!";
  const extra = sueno == null ? "" : sueno < 6
    ? ` Anoche dormiste ${sueno} h. Hoy toca ir con calma.`
    : ` Anoche dormiste ${sueno} h. Bien hecho, mejor que yo con mis 14.`;
  return `${hola} Día ${dia} de la misión.${extra}`;
}

export default function App() {
  const [mediciones, setMediciones] = useState(null);
  const [eventos, setEventos] = useState([]);
  const [guarda, setGuarda] = useState(true);
  const [enLinea, setEnLinea] = useState(navigator.onLine);
  const laica = useRef(null);

  const cargar = useCallback(async () => {
    if (!(await leerMeta("generado"))) await sembrar();
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

  useEffect(() => {
    if (mediciones && laica.current?.accion) laica.current.accion("saludar", 3000);
  }, [mediciones]);

  const datos = useMemo(() => (mediciones ? agrupar(mediciones) : {}), [mediciones]);

  const regenerar = async () => {
    await vaciar();
    setMediciones(null);
    await cargar();
  };

  if (!mediciones) return <main className="cargando">Preparando la misión…</main>;

  const ultimo = (clave) => datos[clave]?.at(-1)?.valor;
  const serie = (clave) => datos[clave]?.map((m) => m.valor) ?? [];

  const tarjeta = (clave) => {
    const ind = INDICADORES[clave];
    if (clave === "pa_sis") {
      return (
        <Tarjeta key={clave} titulo="Presión arterial" matriz={ind.matriz} unidad="mmHg"
          valor={`${ultimo("pa_sis")}/${ultimo("pa_dia")}`} serie={serie("pa_sis")} detalle="Sistólica / diastólica" />
      );
    }
    return (
      <Tarjeta key={clave} titulo={ind.corto} matriz={ind.matriz} unidad={ind.unidad}
        valor={ultimo(clave)} serie={serie(clave)} detalle={ind.frecuencia === "semanal" ? "Medición semanal" : null} />
    );
  };

  return (
    <main>
      <header className="barra">
        <div>
          <h1>Laica · Salud del tripulante</h1>
          <p>{ASTRONAUTA.nombre} · {ASTRONAUTA.mision}</p>
        </div>
        <span className={`conexion ${enLinea ? "si" : "no"}`}>{enLinea ? "Con conexión" : "Sin conexión · modo offline"}</span>
      </header>

      <section className="escena" aria-live="polite">
        <laica-mascota ref={laica} estado="reposo" tamano="170"></laica-mascota>
        <p className="burbuja">{saludo(datos)}</p>
      </section>

      <h2>Indicadores del reto</h2>
      <section className="rejilla">{PRINCIPALES.map(tarjeta)}</section>

      <h2>Otros indicadores</h2>
      <section className="rejilla">{SECUNDARIOS.map(tarjeta)}</section>

      <h2>Eventos de la misión</h2>
      <ol className="eventos">
        {eventos.map((e) => (
          <li key={e.id} className={`evento ${e.tipo}`}>
            <span className="dias">Día {e.dia + 1}{e.hasta > e.dia ? `–${e.hasta + 1}` : ""}</span>
            <strong>{e.titulo}</strong>
            <span>{e.detalle}</span>
          </li>
        ))}
      </ol>

      <footer>
        <p>
          Datos simulados de {DIAS} días. {guarda ? "Se guardan solo en este dispositivo." : "Este navegador no permite guardar: los datos viven en memoria."}
          {" "}Prototipo educativo, no es un dispositivo médico.
        </p>
        <button type="button" onClick={regenerar}>Regenerar datos de prueba</button>
      </footer>
    </main>
  );
}
