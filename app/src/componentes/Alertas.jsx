import { ETIQUETA } from "../motor/reglas.js";

const ICONO = { verde: "🟢", amarillo: "🟡", naranja: "🟠", rojo: "🔴" };

// Panel de alertas: el color siempre va con texto (nunca es la única señal).
export default function Alertas({ alertas }) {
  if (!alertas.length) {
    return <p className="sin-alertas"><span aria-hidden="true">🟢</span> Todo en orden: ningún indicador fuera de rango.</p>;
  }
  return (
    <ul className="alertas">
      {alertas.map((a) => (
        <li key={a.clave} className={`alerta-item ${a.nivel}`}>
          <span className="nivel"><span aria-hidden="true">{ICONO[a.nivel]}</span> {ETIQUETA[a.nivel]}</span>
          <div>
            <strong>{a.motivo}</strong>
            <p>{a.accion}</p>
            {a.medico && <p className="medico">Requiere avisar al médico de vuelo.</p>}
            <small>{a.matriz_id} · {a.referencia}</small>
          </div>
        </li>
      ))}
    </ul>
  );
}
