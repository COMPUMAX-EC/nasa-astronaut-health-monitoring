import { useCallback, useEffect, useRef, useState } from "react";
import { aMapa, leerCara, crearAnimo } from "./gestos.js";

// Cámara de Laica: ella pide permiso antes de prenderla, copia en espejo los gestos de la
// persona (girar e inclinar la cabeza, abrir la boca, levantar las cejas), se ríe cuando la
// persona se ríe y la acompaña cuando la nota triste. Privacidad: la imagen se analiza en este
// equipo, no se graba, no se envía y no se guarda ningún dato; la cámara se apaga al salir.

const PREGUNTA = "¿Me dejas prender la cámara? Así veo tus gestos, me río contigo y te acompaño si te noto triste. "
  + "La imagen no sale de este equipo y no guardo nada.";
const RISAS = ["¡Jajaja! ¡Me contagias la risa!", "¡Jaja! Esa risa vale más que diez croquetas.", "¡Jajaja! Sigue así, me encanta verte reír."];
const SONRISAS = ["¡Esa sonrisa me encanta!", "Te ves contento. ¡Así da gusto la misión!", "¡Sonrisa detectada! Moviendo la cola…"];
const TRISTEZA = "Te noto un poco triste. Aquí estoy contigo. ¿Respiramos juntos un minuto, o me cuentas qué pasa?";
const SORPRESAS = ["¡Uy! ¿Qué viste?", "¡Wow! Yo también me asusté."];
const azar = (lista) => lista[Math.floor(Math.random() * lista.length)];
const CLAVE_PREGUNTADA = "laica-camara-preguntada";

export const camaraDisponible = () => typeof navigator !== "undefined" && Boolean(navigator.mediaDevices?.getUserMedia);

export function useCamaraLaica({ laicaRef, nivel, voz, puedePreguntar }) {
  const [fase, setFase] = useState("apagada"); // apagada | preguntando | encendiendo | encendida | triste
  const [reaccion, setReaccion] = useState(null); // estado temporal de Laica mientras reacciona
  const [hayCara, setHayCara] = useState(false);
  const videoRef = useRef(null);
  const flujo = useRef(null);
  const detector = useRef(null);
  const bucle = useRef(0);
  const nivelRef = useRef(nivel);
  nivelRef.current = nivel;
  const vozRef = useRef(voz);
  vozRef.current = voz;
  const tReaccion = useRef(0);

  const reaccionar = useCallback((estado, ms) => {
    clearTimeout(tReaccion.current);
    setReaccion(estado);
    tReaccion.current = setTimeout(() => setReaccion(null), ms);
  }, []);

  const detener = useCallback(() => {
    cancelAnimationFrame(bucle.current);
    bucle.current = 0;
    flujo.current?.getTracks().forEach((t) => t.stop());
    flujo.current = null;
    detector.current?.cerrar();
    detector.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    const laica = laicaRef.current;
    if (laica) { laica.style.rotate = ""; laica.boca?.(null); }
    setHayCara(false);
  }, [laicaRef]);

  const pedir = useCallback(() => {
    try { localStorage.setItem(CLAVE_PREGUNTADA, "1"); } catch { /* sin almacenamiento */ }
    setFase("preguntando");
    laicaRef.current?.mirar?.(0, 0);
    vozRef.current.decir(PREGUNTA);
  }, [laicaRef]);

  const rechazar = useCallback(() => {
    setFase("apagada");
    vozRef.current.decir("¡Está bien! Si cambias de idea, toca el botón de la cámara.");
  }, []);

  const apagar = useCallback(() => {
    detener();
    setFase("apagada");
    vozRef.current.decir("Listo, apagué la cámara.");
  }, [detener]);

  // Laica copia los gestos y reacciona al ánimo, unas 15 veces por segundo.
  const iniciarBucle = useCallback(() => {
    const animo = crearAnimo();
    let tPrevio = 0, sinCara = 0, tCejas = 0;
    const paso = (t) => {
      bucle.current = requestAnimationFrame(paso);
      const video = videoRef.current, det = detector.current, laica = laicaRef.current;
      if (!video || !det || video.readyState < 2 || t - tPrevio < 66) return;
      tPrevio = t;
      let lectura = null;
      try { lectura = det.leer(video, t); } catch { return; }
      if (!lectura) {
        animo(null, t);
        if (++sinCara === 8) { setHayCara(false); if (laica) laica.style.rotate = ""; laica?.boca?.(null); }
        return;
      }
      if (sinCara >= 8) setHayCara(true);
      sinCara = 0;
      const cara = leerCara(aMapa(lectura.blend), lectura.matriz);
      const tranquila = nivelRef.current === "verde" || nivelRef.current === "amarillo";

      // Espejo: con alertas serias Laica se queda de frente y seria, sin imitar.
      if (laica && tranquila) {
        laica.mirar?.(cara.giro, cara.cabeceo * 0.5);
        laica.style.rotate = `${(cara.inclinacion * 14).toFixed(1)}deg`;
        laica.boca?.(cara.bocaAbierta > 0.3 ? true : null);
        if (cara.cejasArriba > 0.5 && t - tCejas > 1500) { tCejas = t; laica.sacudir?.(0.7); }
      }

      const evento = animo(cara, t);
      if (!evento || !tranquila || vozRef.current.escuchando || vozRef.current.pendiente) return;
      if (evento === "risa") {
        reaccionar("celebrar", 2600);
        laica?.saltar?.(650);
        laica?.ladrar?.(0.55);
        vozRef.current.decir(azar(RISAS));
      } else if (evento === "sonrisa") {
        reaccionar("celebrar", 1800);
        vozRef.current.decir(azar(SONRISAS));
      } else if (evento === "sorpresa") {
        laica?.sacudir?.(1);
        laica?.pararse?.(true, 1200);
        vozRef.current.decir(azar(SORPRESAS));
      } else if (evento === "tristeza") {
        reaccionar("saludar", 3000);
        laica?.quejarse?.(0.35);
        laica?.mirar?.(0, 0.2);
        setFase("triste");
        vozRef.current.decir(TRISTEZA);
      }
    };
    bucle.current = requestAnimationFrame(paso);
  }, [laicaRef, reaccionar]);

  const aceptar = useCallback(async () => {
    setFase("encendiendo");
    vozRef.current.decir("¡Gracias! Dame un segundo para verte…");
    try {
      flujo.current = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } }, audio: false,
      });
    } catch (e) {
      setFase("apagada");
      vozRef.current.decir(e?.name === "NotAllowedError"
        ? "No tengo permiso para la cámara. No pasa nada; si cambias de idea, actívala en el candado junto a la dirección."
        : "No encontré una cámara que pueda usar.");
      return;
    }
    try {
      const { crearDetector } = await import("./detector.js");
      detector.current = await crearDetector();
    } catch {
      detener();
      setFase("apagada");
      vozRef.current.decir("No pude cargar mi detector de gestos en este equipo. Apagué la cámara.");
      return;
    }
    const video = videoRef.current;
    if (video) { video.srcObject = flujo.current; await video.play().catch(() => {}); }
    setFase("encendida");
    setHayCara(true);
    laicaRef.current?.ladrar?.(0.5);
    vozRef.current.decir("¡Ya te veo! Prueba a sonreír, reírte o mover la cabeza.");
    iniciarBucle();
  }, [detener, iniciarBucle, laicaRef]);

  const respirar = useCallback(() => {
    setFase("encendida");
    reaccionar("respirar", 60000);
    vozRef.current.decir("Respira conmigo: inhala 4 segundos, sostén 4, exhala 6. Sigue el ritmo de mi pecho. "
      + "Si la tristeza dura varios días, habla con el equipo de apoyo psicológico de la misión.");
  }, [reaccionar]);

  const estoyBien = useCallback(() => {
    setFase("encendida");
    setReaccion(null);
    vozRef.current.decir("Me alegra. Si me necesitas, aquí estoy.");
  }, []);

  // Laica pregunta sola una vez (en la primera visita, cuando todo está en calma).
  useEffect(() => {
    if (!puedePreguntar || fase !== "apagada" || !camaraDisponible()) return;
    let preguntada = true;
    try { preguntada = localStorage.getItem(CLAVE_PREGUNTADA) === "1"; } catch { /* sin almacenamiento */ }
    if (preguntada) return;
    const t = setTimeout(() => { if (!document.hidden) pedir(); }, 12000);
    return () => clearTimeout(t);
  }, [puedePreguntar, fase, pedir]);

  // Al ocultar la pestaña o salir, se apaga la cámara (no queda encendida a escondidas).
  useEffect(() => {
    const alOcultar = () => { if (document.hidden && flujo.current) { detener(); setFase("apagada"); } };
    document.addEventListener("visibilitychange", alOcultar);
    return () => { document.removeEventListener("visibilitychange", alOcultar); detener(); clearTimeout(tReaccion.current); };
  }, [detener]);

  return {
    disponible: camaraDisponible(),
    fase, hayCara, reaccion, videoRef,
    encendida: fase === "encendida" || fase === "triste",
    pedir, aceptar, rechazar, apagar, respirar, estoyBien,
  };
}
