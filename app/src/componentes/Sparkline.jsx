// Mini gráfico de tendencia en SVG, sin dependencias.
// En la fase 5 se reemplaza por gráficos completos con ejes y eventos.
export default function Sparkline({ valores, etiqueta, alto = 36 }) {
  const ancho = 120;
  const min = Math.min(...valores);
  const max = Math.max(...valores);
  const rango = max - min || 1;
  const pad = 3;
  const pts = valores.map((v, i) => [
    (i / (valores.length - 1)) * ancho,
    pad + (1 - (v - min) / rango) * (alto - 2 * pad),
  ]);
  const ultimo = pts[pts.length - 1];
  return (
    <svg className="sparkline" viewBox={`0 0 ${ancho} ${alto}`} preserveAspectRatio="none" role="img" aria-label={etiqueta}>
      <polyline points={pts.map((p) => p.join(",")).join(" ")} fill="none" vectorEffect="non-scaling-stroke" />
      <circle cx={ultimo[0]} cy={ultimo[1]} r="2.5" />
    </svg>
  );
}
