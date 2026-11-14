import Sparkline from "./Sparkline.jsx";
import { ETIQUETA } from "../motor/reglas.js";

// Tarjeta de un indicador: último valor, nivel de alerta y tendencia de la misión.
export default function Tarjeta({ titulo, valor, unidad, serie, detalle, matriz, nivel = "verde" }) {
  return (
    <article className={`tarjeta nivel-${nivel}`}>
      <header>
        <h3>{titulo}</h3>
        <span className="matriz" title="Id en la matriz de riesgo (docs/09)">{matriz}</span>
      </header>
      <p className="valor">
        {valor ?? "—"} <small>{unidad}</small>
      </p>
      <p className="estado-nivel">{ETIQUETA[nivel]}</p>
      {detalle && <p className="detalle">{detalle}</p>}
      {serie?.length > 1 && <Sparkline valores={serie} etiqueta={`Tendencia de ${titulo}`} />}
    </article>
  );
}
