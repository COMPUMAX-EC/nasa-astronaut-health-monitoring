import { useCallback, useEffect, useRef, useState } from "react";
import { interpretar, describir } from "./interpretar.js";
import { hablar, escuchar, callar, soporte } from "./voz.js";

// Conversación por voz con Laica: escuchar → interpretar → confirmar → guardar → responder.
// Antes de guardar un dato dicho en voz alta, Laica siempre repite lo que entendió y pide
// confirmación: un error de reconocimiento no debe convertirse en un dato médico.

function leerPref() {
  try { return localStorage.getItem("laica-voz") === "1"; } catch { return false; }
}
function guardarPref(v) {
  try { localStorage.setItem("laica-voz", v ? "1" : "0"); } catch { /* sin almacenamiento: no pasa nada */ }
}

const AYUDA = "Puedes decirme, por ejemplo: mi presión es 120 sobre 80, pulso 62, dormí 7 horas, me siento bien, o preguntarme ¿cómo estoy?";

export function resumenDe(estado) {
  if (!estado.alertas.length) return "Todo en orden: ningún indicador fuera de rango. Sigue así.";
  const a = estado.alertas[0];
  const n = estado.alertas.length;
  return `Tienes ${n} alerta${n > 1 ? "s" : ""}. La más importante: ${a.motivo}. ${a.accion}`;
}

export function useConversacion({ estado, guardar, abrirCheckIn }) {
  const [vozActiva, setVozActivaState] = useState(leerPref);
  const [escuchando, setEscuchando] = useState(false);
  const [hablando, setHablando] = useState(false);
  const [parcial, setParcial] = useState("");
  const [respuesta, setRespuesta] = useState(null);
  const [pendiente, setPendiente] = useState(null);

  const vozRef = useRef(vozActiva);
  const pendienteRef = useRef(null);
  const estadoRef = useRef(estado);
  const recRef = useRef(null);
  const guardarRef = useRef(guardar);
  const abrirRef = useRef(abrirCheckIn);
  estadoRef.current = estado;
  guardarRef.current = guardar; // siempre la versión más reciente (con las mediciones actuales)
  abrirRef.current = abrirCheckIn;

  const setVozActiva = useCallback((v) => {
    vozRef.current = v;
    setVozActivaState(v);
    guardarPref(v);
    if (!v) { callar(); setHablando(false); }
  }, []);

  const fijarPendiente = (p) => { pendienteRef.current = p; setPendiente(p); };

  // `decir` y `oir` se llaman entre sí (Laica pregunta y luego escucha la respuesta).
  const oirRef = useRef(null);

  const decir = useCallback((texto, { luegoEscuchar = false } = {}) => {
    setRespuesta(texto);
    if (!vozRef.current || !soporte.hablar) return;
    hablar(texto, {
      onInicio: () => setHablando(true),
      onFin: () => { setHablando(false); if (luegoEscuchar && pendienteRef.current) oirRef.current?.(); },
    });
  }, []);

  const procesar = useCallback(async (texto) => {
    const r = interpretar(texto);

    if (pendienteRef.current && r.intencion !== "registrar") {
      if (r.intencion === "confirmar") {
        const p = pendienteRef.current;
        fijarPendiente(null);
        const nuevo = await guardarRef.current(p.datos);
        decir(nuevo.nivel === "verde" ? "¡Guardado! Todo en orden." : `Guardado. ${nuevo.alertas[0].mensaje}`);
        return;
      }
      if (r.intencion === "cancelar") { fijarPendiente(null); decir("Listo, no guardé nada."); return; }
      decir("¿Guardo lo que te dije? Responde sí o no.", { luegoEscuchar: true });
      return;
    }

    switch (r.intencion) {
      case "registrar": {
        const errores = Object.values(r.errores);
        if (errores.length) { fijarPendiente(null); decir(`${errores[0]}. Repíteme el dato, por favor.`); return; }
        fijarPendiente({ datos: r.datos });
        decir(`Entendí ${describir(r.datos)}. ¿Lo guardo?`, { luegoEscuchar: true });
        return;
      }
      case "resumen": decir(resumenDe(estadoRef.current)); return;
      case "ayuda": decir(AYUDA); return;
      case "checkin": abrirRef.current(); decir("Te abro el check-in. Llena lo que mediste hoy."); return;
      case "gracias": decir("¡Para eso estoy! Bueno, para eso y para las croquetas."); return;
      case "saludo": decir("¡Hola! ¿Qué mediste hoy? También puedes preguntarme cómo estás."); return;
      case "confirmar":
      case "cancelar": decir("No tengo nada pendiente por guardar."); return;
      default: decir(`No te entendí: "${texto}". ${AYUDA}`);
    }
  }, [decir]);

  const oir = useCallback(() => {
    if (recRef.current) return;
    setParcial("");
    setEscuchando(true);
    recRef.current = escuchar({
      onParcial: setParcial,
      onFinal: (t) => { setParcial(t); procesar(t); },
      onError: (msg) => decir(msg),
      onFin: () => { recRef.current = null; setEscuchando(false); },
    });
  }, [procesar, decir]);
  oirRef.current = oir;

  const alternarMicrofono = () => {
    if (recRef.current) { recRef.current.detener(); return; }
    if (!vozRef.current) setVozActiva(true); // quien habla espera que le respondan en voz alta
    oir();
  };

  const alternarVoz = (mensajeActual) => {
    const v = !vozRef.current;
    setVozActiva(v);
    if (v) hablar(mensajeActual, { onInicio: () => setHablando(true), onFin: () => setHablando(false) });
  };

  const responderPendiente = (si) => procesar(si ? "si" : "no");

  // La respuesta se queda 15 s en la burbuja y luego vuelve el mensaje de salud (sin repetirlo en voz).
  useEffect(() => {
    if (!respuesta || pendiente || escuchando || hablando) return;
    const t = setTimeout(() => setRespuesta(null), 15000);
    return () => clearTimeout(t);
  }, [respuesta, pendiente, escuchando, hablando]);

  useEffect(() => () => { recRef.current?.detener(); callar(); }, []);

  return {
    soporte, vozActiva, escuchando, hablando, parcial, respuesta, pendiente,
    alternarMicrofono, alternarVoz, responderPendiente, decir, limpiar: () => setRespuesta(null),
  };
}
