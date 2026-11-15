import { useCallback, useEffect, useRef, useState } from "react";
import { siguiente } from "./charla.js";

// Cada 35 a 60 segundos de calma, Laica dice algo casual o hace una pregunta rápida de salud
// (patrón: casual, casual, salud). Nunca interrumpe: espera a que nadie le esté hablando, a que
// no haya nada por confirmar y a que la burbuja quede libre. Con alertas no charla (activa = false).

export function useCharla({ activa, voz, onGuardar }) {
  const [pregunta, setPregunta] = useState(null);
  const [vuelta, setVuelta] = useState(0); // fuerza un nuevo turno si la pestaña estaba oculta
  const historial = useRef([]);
  const vozRef = useRef(voz);
  vozRef.current = voz;
  const libre = activa && !pregunta && !voz.respuesta && !voz.escuchando && !voz.pendiente && !voz.hablando;

  useEffect(() => {
    if (!libre) return;
    const t = setTimeout(() => {
      if (document.hidden) { setVuelta((v) => v + 1); return; }
      const s = siguiente(historial.current);
      historial.current.push({ tipo: s.tipo === "casual" ? "casual" : s.area, id: s.id });
      if (s.tipo === "pregunta") setPregunta(s);
      vozRef.current.decir(s.texto);
    }, 35000 + Math.random() * 25000);
    return () => clearTimeout(t);
  }, [libre, vuelta]);

  // Una pregunta sin responder se retira sola al minuto y medio.
  useEffect(() => {
    if (!pregunta) return;
    const t = setTimeout(() => setPregunta(null), 90000);
    return () => clearTimeout(t);
  }, [pregunta]);

  // Si aparece una alerta, la pregunta casual se retira para no tapar lo importante.
  useEffect(() => { if (!activa) setPregunta(null); }, [activa]);

  const responder = useCallback((opcion) => {
    setPregunta(null);
    vozRef.current.decir(opcion.respuesta);
    if (opcion.guardar) onGuardar?.(opcion.guardar);
  }, [onGuardar]);

  const omitir = useCallback(() => {
    setPregunta(null);
    vozRef.current.decir("¡Va! Te pregunto en otro momento.");
  }, []);

  return { pregunta, responder, omitir };
}
