import Sparkline from "./Sparkline.jsx";

// Tarjeta de un indicador: último valor, unidad y tendencia de la misión.
// En la fase 2 el borde tomará el color del nivel de alerta (🟢🟡🟠🔴).
export default function Tarjeta({ titulo, valor, unidad, serie, detalle, matriz }) {
  return (
    <article className="tarjeta">
      <header>
        <h3>{titulo}</h3>
        <span className="matriz" title="Id en la matriz de riesgo (docs/09)">{matriz}</span>
      </header>
      <p className="valor">
        {valor ?? "—"} <small>{unidad}</small>
      </p>
      {detalle && <p className="detalle">{detalle}</p>}
      {serie?.length > 1 && <Sparkline valores={serie} etiqueta={`Tendencia de ${titulo}`} />}
    </article>
  );
}
