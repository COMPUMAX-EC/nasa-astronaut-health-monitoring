// Voz de Laica con la Web Speech API del navegador.
// - Hablar (speechSynthesis): usa las voces instaladas en el sistema; en Windows funciona sin conexión.
// - Escuchar (SpeechRecognition): en Chrome y Edge el audio se procesa en los servidores del
//   navegador, así que necesita internet y sale del dispositivo. Por eso es opcional y se avisa.
//   Para una misión real habría que usar un reconocedor local (ver docs/08).

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

function elegirVoz() {
  const voces = window.speechSynthesis.getVoices().filter((v) => v.lang?.toLowerCase().startsWith("es"));
  const pref = idioma().toLowerCase();
  return (
    voces.find((v) => v.lang.toLowerCase() === pref && v.localService) ||
    voces.find((v) => v.lang.toLowerCase() === pref) ||
    voces.find((v) => v.localService) ||
    voces[0] ||
    null
  );
}

// Quita emojis y símbolos que el sintetizador leería en voz alta.
const limpiar = (t) => t.replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/gu, "").replace(/₂/g, "2").trim();

let actual = null;

export function hablar(texto, { onInicio, onFin } = {}) {
  if (!soporte.hablar || !texto) { onFin?.(); return; }
  const s = window.speechSynthesis;
  s.cancel();
  const u = new SpeechSynthesisUtterance(limpiar(texto));
  const voz = elegirVoz();
  if (voz) u.voice = voz;
  u.lang = voz?.lang ?? idioma();
  u.rate = 1.03;
  u.pitch = 1.2; // un poco más aguda: es una perrita corgi
  u.onstart = () => onInicio?.();
  u.onend = u.onerror = () => { if (actual === u) actual = null; onFin?.(); };
  actual = u;
  s.speak(u);
}

export function callar() {
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
