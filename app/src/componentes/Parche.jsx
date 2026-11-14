// Parche de la misión Laica: diseño original del equipo (huella de corgi orbitando la Tierra).
// No usa ni imita la insignia ni el logotipo de la NASA, que requieren permiso de la agencia.
export default function Parche({ tamano = 56 }) {
  return (
    <svg width={tamano} height={tamano} viewBox="0 0 100 100" role="img" aria-label="Parche de la misión Laica">
      <defs>
        <radialGradient id="pm-tierra" cx="35%" cy="35%">
          <stop offset="0" stopColor="#7dd3fc" />
          <stop offset=".55" stopColor="#2563eb" />
          <stop offset="1" stopColor="#0b2a6b" />
        </radialGradient>
        <path id="pm-arco" d="M18 50 a32 32 0 0 1 64 0" />
        <path id="pm-arco-abajo" d="M14 52 a36 36 0 0 0 72 0" />
      </defs>
      <circle cx="50" cy="50" r="47" fill="#0d1a3d" stroke="#E8B53A" strokeWidth="4" />
      <circle cx="50" cy="50" r="40" fill="none" stroke="#E8B53A" strokeWidth="1" opacity=".6" />
      <text fontSize="9.5" fontWeight="800" letterSpacing="2.5" fill="#fff" fontFamily="Segoe UI, system-ui, sans-serif">
        <textPath href="#pm-arco" startOffset="50%" textAnchor="middle">MISIÓN LAICA</textPath>
      </text>
      <text fontSize="6.5" fontWeight="700" letterSpacing="1.6" fill="#E8B53A" fontFamily="Segoe UI, system-ui, sans-serif">
        <textPath href="#pm-arco-abajo" startOffset="50%" textAnchor="middle">ECUADOR · 2026</textPath>
      </text>
      <circle cx="44" cy="56" r="13" fill="url(#pm-tierra)" />
      <path d="M36 54 q4 -5 9 -2 q3 2 7 -1" fill="none" stroke="#86efac" strokeWidth="2.2" strokeLinecap="round" />
      <ellipse cx="50" cy="52" rx="28" ry="9" fill="none" stroke="#9FD3FF" strokeWidth="1.6" transform="rotate(-22 50 52)" />
      <g fill="#FFD447" transform="translate(66 36)">
        <ellipse cx="0" cy="3" rx="5" ry="4" />
        <circle cx="-5" cy="-3" r="2" /><circle cx="-1.5" cy="-5" r="2" />
        <circle cx="2.5" cy="-4.6" r="2" /><circle cx="5.6" cy="-1.8" r="2" />
      </g>
      <g fill="#fff">
        <circle cx="26" cy="38" r="1" /><circle cx="74" cy="64" r="1.2" /><circle cx="30" cy="70" r=".9" /><circle cx="60" cy="74" r=".8" />
      </g>
    </svg>
  );
}
