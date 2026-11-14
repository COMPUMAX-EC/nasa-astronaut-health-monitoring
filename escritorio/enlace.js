// Lee los enlaces laica:// con los que la app web llama a la app de escritorio.
//   laica://salir?x=640&y=360&estado=reposo&msg=Hola   → Laica sale en ese punto de la pantalla
//   laica://volver                                       → Laica vuelve al navegador (cierra la app)

const ESTADOS = [
  "reposo", "saludar", "hablar", "celebrar", "ejercicio",
  "respirar", "dormir", "alerta", "urgente", "radiacion",
];

function leerEnlace(url) {
  let u;
  try {
    u = new URL(url);
  } catch {
    return { accion: "salir", x: null, y: null, estado: "reposo", mensaje: "" };
  }
  const nombre = (u.hostname || u.pathname).replace(/\//g, "").toLowerCase();
  const num = (k) => {
    if (!u.searchParams.has(k)) return null;
    const v = Number(u.searchParams.get(k));
    return Number.isFinite(v) ? v : null;
  };
  const estado = u.searchParams.get("estado");
  return {
    accion: nombre === "volver" ? "volver" : "salir",
    x: num("x"),
    y: num("y"),
    estado: ESTADOS.includes(estado) ? estado : "reposo",
    mensaje: (u.searchParams.get("msg") || "").slice(0, 140),
  };
}

module.exports = { leerEnlace, ESTADOS };
