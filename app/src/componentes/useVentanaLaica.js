import { useCallback, useEffect, useRef, useState } from "react";

// Laica fuera del navegador: abre una mini ventana flotante (Document Picture-in-Picture,
// Chrome y Edge de escritorio) que queda siempre encima, incluso sobre otras aplicaciones,
// y se puede arrastrar a cualquier parte de la pantalla. Una página web no puede dibujar
// directamente sobre el escritorio; esta es la forma estándar de "salirse" de la ventana.

const CSS = `
html, body { margin: 0; height: 100%; overflow: hidden; }
body {
  display: flex; flex-direction: column; align-items: center; justify-content: flex-end;
  gap: 6px; padding: 10px; box-sizing: border-box; color: #eef2ff;
  font: 14px "Segoe UI", system-ui, sans-serif;
  background: radial-gradient(circle at 50% 35%, #1d2f66, #0b1530 70%);
}
p {
  margin: 0; background: #13214a; border: 1px solid #24376e; border-radius: 12px;
  padding: 6px 10px; text-align: center; max-width: 96%;
  display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;
}
button { border: none; background: none; padding: 0; cursor: pointer; line-height: 0; animation: flotar 3.5s ease-in-out infinite; }
@keyframes flotar { 50% { transform: translateY(-6px); } }
@media (prefers-reduced-motion: reduce) { button { animation: none; } }
`;

export const ventanaSoportada = () =>
  typeof window !== "undefined" && "documentPictureInPicture" in window;

export function useVentanaLaica({ estado, mensaje, onAcariciar }) {
  const [abierta, setAbierta] = useState(false);
  const ventana = useRef(null);
  const laica = useRef(null);
  const texto = useRef(null);
  const acariciar = useRef(onAcariciar);
  acariciar.current = onAcariciar;

  const abrir = useCallback(async () => {
    if (!ventanaSoportada() || ventana.current) return;
    let w;
    try {
      w = await window.documentPictureInPicture.requestWindow({ width: 240, height: 300 });
    } catch {
      return; // el navegador la rechazó (por ejemplo, sin un clic del usuario)
    }
    ventana.current = w;
    w.document.title = "Laica";
    const estilo = w.document.createElement("style");
    estilo.textContent = CSS;
    w.document.head.append(estilo);

    // Se crean en este documento (donde está registrado <laica-mascota>) y se mueven a la ventana.
    const p = document.createElement("p");
    const boton = document.createElement("button");
    boton.type = "button";
    boton.setAttribute("aria-label", "Acariciar a Laica");
    const l = document.createElement("laica-mascota");
    l.setAttribute("tamano", "170");
    l.setAttribute("curiosa", "");
    boton.append(l);
    boton.addEventListener("click", () => {
      l.girar?.("vuelta");
      acariciar.current?.();
    });
    w.document.body.append(p, boton);
    laica.current = l;
    texto.current = p;

    w.addEventListener("pagehide", () => {
      ventana.current = laica.current = texto.current = null;
      setAbierta(false);
    });
    setAbierta(true);
  }, []);

  const cerrar = useCallback(() => ventana.current?.close(), []);

  useEffect(() => {
    laica.current?.setAttribute("estado", estado);
    if (texto.current) texto.current.textContent = mensaje;
  }, [estado, mensaje, abierta]);

  useEffect(() => () => ventana.current?.close(), []);

  return { soportada: ventanaSoportada(), abierta, abrir, cerrar };
}
