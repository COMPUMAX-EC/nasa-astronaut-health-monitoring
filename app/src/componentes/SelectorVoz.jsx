import { useEffect, useState } from "react";
import { listarVoces, alCambiarVoces, vozActual, elegirVoz, hablar } from "../voz/voz.js";
import { etiquetaVoz } from "../voz/voces.js";

const PRUEBA = "¡Hola! Soy Laica. Tu presión es 118/76 mmHg: todo en orden. ¿Seguimos con el check-in?";

// Selector de voz: las mejores (naturales) salen primero y la primera se usa por defecto.
export default function SelectorVoz() {
  const [voces, setVoces] = useState(listarVoces);
  const [nombre, setNombre] = useState(() => vozActual()?.name ?? "");

  useEffect(() => alCambiarVoces(() => {
    setVoces(listarVoces());
    setNombre(vozActual()?.name ?? "");
  }), []);

  if (!voces.length) return <p className="pista">Este equipo no tiene voces en español instaladas.</p>;

  const cambiar = (e) => {
    setNombre(e.target.value);
    elegirVoz(e.target.value);
    hablar(PRUEBA);
  };

  const natural = /natural|neural|google/i.test(nombre);
  return (
    <div className="selector-voz">
      <label>
        <span>Voz de Laica</span>
        <select value={nombre} onChange={cambiar}>
          {voces.map((v) => <option key={v.name} value={v.name}>{etiquetaVoz(v)}</option>)}
        </select>
      </label>
      <button type="button" onClick={() => hablar(PRUEBA)}>Probar</button>
      {!natural && (
        <p className="pista">
          Para una voz más humana usa Microsoft Edge (voces "natural") o Chrome (voces de Google).
        </p>
      )}
    </div>
  );
}
