// Voz de Laica con la Web Speech API del navegador.
// - Hablar (speechSynthesis): usa las voces instaladas en el sistema; en Windows funciona sin conexión.
// - Escuchar (SpeechRecognition): en Chrome y Edge el audio se procesa en los servidores del
//   navegador, así que necesita internet y sale del dispositivo. Por eso es opcional y se avisa.
//   Para una misión real habría que usar un reconocedor local (ver docs/08).

import { ordenarVoces, dividirFrases } from "./voces.js";

// Se busca al usarlo (no al cargar), así las pruebas pueden inyectar un reconocedor simulado.
const obtenerSR = () => (typeof window !== "undefined" ? window.SpeechRecognition || window.webkitSpeechRecognition : null);

export const soporte = {
  hablar: typeof window !== "undefined" && "speechSynthesis" in window,
  escuchar: Boolean(obtenerSR()),
};

const idioma = () => {
  const n = typeof navigator !== "undefined" ? navigator.language : "es-ES";
  return n?.toLowerCase().startsWith("es") ? n : "es-ES";
};

// ---------- Elegir la voz ----------

const CLAVE_VOZ = "laica-voz-nombre";
const leerVozGuardada = () => { try { return localStorage.getItem(CLAVE_VOZ); } catch { return null; } };

/** Voces en español, de la más natural a la más robótica. */
export function listarVoces() {
  if (!soporte.hablar) return [];
  return ordenarVoces(window.speechSynthesis.getVoices(), idioma());
}

/** Avisa cuando el navegador termina de cargar las voces (en Chrome y Edge llegan tarde). */
export function alCambiarVoces(cb) {
  if (!soporte.hablar) return () => {};
  const s = window.speechSynthesis;
  s.addEventListener?.("voiceschanged", cb);
  return () => s.removeEventListener?.("voiceschanged", cb);
}

export function vozActual() {
  const voces = listarVoces();
  const guardada = leerVozGuardada();
  return voces.find((v) => v.name === guardada) ?? voces[0] ?? null;
}

export function elegirVoz(nombre) {
  try { nombre ? localStorage.setItem(CLAVE_VOZ, nombre) : localStorage.removeItem(CLAVE_VOZ); } catch { /* sin almacenamiento */ }
}

// ---------- Hablar ----------

let turno = 0; // cada llamada a hablar() invalida la anterior

/**
 * Habla frase por frase con la voz más natural disponible.
 * onInicio se llama al empezar la primera frase; onFin, una sola vez, al terminar o al interrumpirse.
 */
export function hablar(texto, { onInicio, onFin } = {}) {
  const frases = dividirFrases(texto);
  if (!soporte.hablar || !frases.length) { onFin?.(); return; }
  const s = window.speechSynthesis;
  s.cancel();
  const mio = ++turno;
  const voz = vozActual();
  let terminado = false;
  const fin = () => { if (!terminado) { terminado = true; onFin?.(); } };

  frases.forEach((frase, i) => {
    const u = new SpeechSynthesisUtterance(frase);
    if (voz) u.voice = voz;
    u.lang = voz?.lang ?? idioma();
    // Tono y ritmo naturales: un tono muy alto suena a juguete. Las preguntas suben un poco.
    u.rate = 1;
    u.pitch = /\?$/.test(frase) ? 1.12 : 1.04;
    if (i === 0) u.onstart = () => { if (mio === turno) onInicio?.(); };
    u.onerror = () => { if (mio === turno) fin(); };
    if (i === frases.length - 1) u.onend = () => { if (mio === turno) fin(); };
    s.speak(u);
  });
}

export function callar() {
  turno++;
  if (soporte.hablar) window.speechSynthesis.cancel();
}

const ERRORES = {
  "not-allowed": "No tengo permiso para usar el micrófono. Actívalo en el candado de la barra de direcciones.",
  "service-not-allowed": "Este navegador no permite reconocer voz aquí.",
  "no-speech": "No escuché nada. Intenta otra vez, un poco más cerca del micrófono.",
  "audio-capture": "No encuentro un micrófono conectado.",
  network: "Para entenderte necesito internet; sin conexión usa el check-in escrito.",
  aborted: null,
};

/**
 * Escucha una frase. Devuelve { detener } y llama a onFinal(texto) u onError(mensaje).
 */
export function escuchar({ onParcial, onFinal, onError, onFin }) {
  const SR = obtenerSR();
  if (!SR) { onError?.("Este navegador no puede escucharte. Prueba con Chrome o Edge."); onFin?.(); return { detener() {} }; }
  callar();
  const rec = new SR();
  rec.lang = idioma();
  rec.interimResults = true;
  rec.continuous = false;
  rec.maxAlternatives = 1;
  let final = "";
  rec.onresult = (e) => {
    let parcial = "";
    for (let i = e.resultIndex; i < e.results.length; i++) {
      const r = e.results[i];
      if (r.isFinal) final += r[0].transcript;
      else parcial += r[0].transcript;
    }
    onParcial?.(final + parcial);
  };
  rec.onerror = (e) => {
    const msg = e.error in ERRORES ? ERRORES[e.error] : `No pude escucharte (${e.error}).`;
    if (msg) onError?.(msg);
    final = null;
  };
  rec.onend = () => {
    if (final) onFinal?.(final.trim());
    else if (final === "") onError?.(ERRORES["no-speech"]);
    onFin?.();
  };
  try { rec.start(); } catch (err) { onError?.(String(err.message ?? err)); onFin?.(); }
  return { detener: () => rec.abort() };
}

// Las voces cargan de forma asíncrona en Chrome; esto las precarga.
if (soporte.hablar) window.speechSynthesis.getVoices();
