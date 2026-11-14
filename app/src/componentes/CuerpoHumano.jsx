import { ZONAS, ORDEN_ZONAS, nivelZona } from "../datos/zonas.js";
import { INDICADORES } from "../datos/indicadores.js";
import { ETIQUETA } from "../motor/reglas.js";
import { MATRIZ } from "../datos/matriz.js";

// Figura humana clicable (requisito del reto). Cada zona toma el color del peor nivel de
// sus indicadores. Se usa con ratón, teclado (Tab + Enter) o con los botones de abajo.

const ETIQ = { ...ETIQUETA, "sin-datos": "Sin datos aún" };

const FORMAS = {
  cabeza: <circle cx="100" cy="48" r="30" />,
  ojos: <rect x="80" y="38" width="40" height="14" rx="7" />,
  pulmones: (
    <>
      <ellipse cx="83" cy="128" rx="15" ry="25" />
      <ellipse cx="117" cy="128" rx="15" ry="25" />
    </>
  ),
  corazon: <path d="M104 166 C88 155 84 144 92 137 C98 132 104 136 104 141 C104 136 110 132 116 137 C124 144 120 155 104 166 Z" />,
  abdomen: <ellipse cx="100" cy="204" rx="30" ry="22" />,
  piernas: (
    <>
      <path d="M70 240 L98 240 L95 372 C95 385 76 385 76 372 Z" />
      <path d="M102 240 L130 240 L124 372 C124 385 105 385 105 372 Z" />
    </>
  ),
};

function Zona({ id, nivel, activa, onElegir }) {
  const elegir = () => onElegir(id);
  return (
    <g className={`zona nivel-${nivel}${activa ? " activa" : ""}`} role="button" tabIndex={0}
      aria-label={`${ZONAS[id].nombre}: ${ETIQ[nivel]}`} aria-pressed={activa}
      onClick={elegir} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); elegir(); } }}>
      <title>{`${ZONAS[id].nombre}: ${ETIQ[nivel]}`}</title>
      {FORMAS[id]}
    </g>
  );
}

function valorDe(clave, ultimo) {
  if (clave === "pa_sis") return `${ultimo("pa_sis") ?? "—"}/${ultimo("pa_dia") ?? "—"} mmHg`;
  const v = ultimo(clave);
  return v == null ? "—" : `${v} ${INDICADORES[clave].unidad}`;
}

export default function CuerpoHumano({ estado, ultimo, seleccion, onSeleccion }) {
  const niveles = Object.fromEntries(ORDEN_ZONAS.map((id) => [id, nivelZona(id, estado)]));
  const zona = ZONAS[seleccion];
  const nivel = niveles[seleccion];
  const alertasZona = estado.alertas.filter((a) => zona.claves.includes(a.clave) || (seleccion === "cuerpo" && a.clave === "sep"));

  return (
    <section className="cuerpo">
      <div className="figura">
        <svg viewBox="0 0 200 400" role="group" aria-label="Mapa del cuerpo: elige una zona">
          <g
            className={`zona aura nivel-${niveles.cuerpo}${seleccion === "cuerpo" ? " activa" : ""}`}
            role="button" tabIndex={0} aria-label={`${ZONAS.cuerpo.nombre}: ${ETIQ[niveles.cuerpo]}`}
            aria-pressed={seleccion === "cuerpo"} onClick={() => onSeleccion("cuerpo")}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSeleccion("cuerpo"); } }}>
            <title>{ZONAS.cuerpo.nombre}</title>
            <rect x="10" y="6" width="180" height="388" rx="28" />
          </g>
          <g className="silueta" aria-hidden="true">
            <circle cx="100" cy="48" r="30" />
            <rect x="90" y="74" width="20" height="16" />
            <path d="M62 92 Q100 82 138 92 L146 190 Q142 236 132 242 L68 242 Q58 236 54 190 Z" />
            <path d="M60 96 C44 100 38 118 36 138 L28 222 C27 232 39 234 41 224 L54 146 Z" />
            <path d="M140 96 C156 100 162 118 164 138 L172 222 C173 232 161 234 159 224 L146 146 Z" />
            <path d="M70 240 L98 240 L95 372 C95 385 76 385 76 372 Z" />
            <path d="M102 240 L130 240 L124 372 C124 385 105 385 105 372 Z" />
          </g>
          {["cabeza", "pulmones", "abdomen", "piernas", "corazon", "ojos"].map((id) => (
            <Zona key={id} id={id} nivel={niveles[id]} activa={seleccion === id} onElegir={onSeleccion} />
          ))}
        </svg>
        <div className="chips" role="group" aria-label="Zonas del cuerpo">
          {ORDEN_ZONAS.map((id) => (
            <button key={id} type="button" className={`chip nivel-${niveles[id]}`} aria-pressed={seleccion === id} onClick={() => onSeleccion(id)}>
              <span className="punto" aria-hidden="true"></span>{ZONAS[id].nombre.split(":")[0]}
            </button>
          ))}
        </div>
      </div>

      <article className={`detalle-zona nivel-${nivel}`} aria-live="polite">
        <header>
          <h3>{zona.nombre}</h3>
          <span className="insignia">{ETIQ[nivel]}</span>
        </header>
        <p className="porque">{zona.porque}</p>

        {alertasZona.map((a) => (
          <p key={a.clave} className={`aviso ${a.nivel}`}><strong>{a.motivo}.</strong> {a.accion}</p>
        ))}

        {zona.claves.length > 0 && (
          <>
            <h4>Lo que mides en la app</h4>
            <ul>
              {zona.claves.map((c) => {
                const ind = INDICADORES[c];
                const m = MATRIZ[ind.matriz];
                const n = estado.porIndicador[c];
                return (
                  <li key={c}>
                    <div className="fila"><strong>{c === "pa_sis" ? "Presión arterial" : ind.nombre}</strong><span className={`valor-zona nivel-${n}`}>{valorDe(c, ultimo)} · {ETIQ[n]}</span></div>
                    {m && <small>Riesgo: {m.riesgo}. Frecuencia: {m.frecuencia_medicion}.</small>}
                  </li>
                );
              })}
            </ul>
          </>
        )}

        <h4>{zona.claves.length ? "También lo vigila la matriz de riesgo" : "Lo que vigila la matriz de riesgo"}</h4>
        <ul>
          {zona.matriz.map((id) => {
            const m = MATRIZ[id];
            if (!m) return null;
            return (
              <li key={id}>
                <div className="fila"><strong>{m.indicador}</strong><span className="matriz">{id}</span></div>
                <small>Riesgo: {m.riesgo}. Frecuencia: {m.frecuencia_medicion}. A bordo: {m.instrumentacion_a_bordo.toLowerCase()}.</small>
                <small>Cómo se mide: {m.metodos_recoleccion.split(" | ").join("; ")}.</small>
              </li>
            );
          })}
        </ul>
      </article>
    </section>
  );
}
