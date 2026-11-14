import { useState } from "react";
import { CAMPOS, validar } from "../motor/validacion.js";

// Formulario de check-in: entrada por teclado y clics, como pide el reto.
// Todos los campos son opcionales; solo se guardan los que se llenan.

const CARAS = [
  { valor: 1, cara: "😞", texto: "Muy mal" },
  { valor: 2, cara: "🙁", texto: "Mal" },
  { valor: 3, cara: "😐", texto: "Regular" },
  { valor: 4, cara: "🙂", texto: "Bien" },
  { valor: 5, cara: "😄", texto: "Muy bien" },
];

export default function CheckIn({ onGuardar, onCerrar }) {
  const [valores, setValores] = useState({});
  const [animo, setAnimo] = useState(null);
  const [errores, setErrores] = useState({});

  const cambiar = (clave) => (e) => setValores((v) => ({ ...v, [clave]: e.target.value }));

  const enviar = (e) => {
    e.preventDefault();
    const err = validar(valores);
    setErrores(err);
    if (Object.keys(err).length) return;
    const datos = Object.fromEntries(
      Object.entries(valores).filter(([, v]) => v !== "").map(([k, v]) => [k, Number(String(v).replace(",", "."))])
    );
    if (animo) datos.animo = animo;
    if (!Object.keys(datos).length) { setErrores({ general: "Llena al menos un dato." }); return; }
    onGuardar(datos);
  };

  return (
    <form className="checkin" onSubmit={enviar} noValidate>
      <div className="checkin-cabecera">
        <h2>Check-in de hoy</h2>
        <button type="button" className="cerrar" onClick={onCerrar} aria-label="Cerrar el check-in">✕</button>
      </div>

      <fieldset className="animo">
        <legend>¿Cómo te sientes hoy?</legend>
        {CARAS.map((c) => (
          <button key={c.valor} type="button" aria-pressed={animo === c.valor}
            className={animo === c.valor ? "activo" : ""} onClick={() => setAnimo(animo === c.valor ? null : c.valor)}>
            <span aria-hidden="true">{c.cara}</span>{c.texto}
          </button>
        ))}
      </fieldset>

      <div className="campos">
        {CAMPOS.map((c) => (
          <label key={c.clave} htmlFor={`campo-${c.clave}`} className={errores[c.clave] ? "con-error" : ""}>
            <span>{c.etiqueta} <small>{c.unidad}</small></span>
            <input id={`campo-${c.clave}`} type="number" inputMode="decimal" step={c.paso} min={c.min} max={c.max}
              value={valores[c.clave] ?? ""} onChange={cambiar(c.clave)}
              aria-invalid={Boolean(errores[c.clave])} />
            {errores[c.clave] && <em role="alert">{errores[c.clave]}</em>}
          </label>
        ))}
      </div>

      {errores.general && <p className="error-general" role="alert">{errores.general}</p>}
      <div className="acciones">
        <button type="submit" className="primario">Guardar</button>
        <span>Todo es opcional: llena lo que mediste hoy.</span>
      </div>
    </form>
  );
}
