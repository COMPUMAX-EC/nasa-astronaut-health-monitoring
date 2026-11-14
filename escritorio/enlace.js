// Lee los enlaces laica:// con los que la app web llama a la app de escritorio.
//   laica://salir?x=640&y=360&estado=reposo&msg=Hola   → Laica sale en ese punto de la pantalla
//     (opcionales: gravedad=1|0, patas=cuatro|dos)
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
    return { accion: "salir", x: null, y: null, estado: "reposo", mensaje: "", gravedad: null, patas: null };
  }
  const nombre = (u.hostname || u.pathname).replace(/\//g, "").toLowerCase();
  const num = (k) => {
    if (!u.searchParams.has(k)) return null;
    const v = Number(u.searchParams.get(k));
    return Number.isFinite(v) ? v : null;
  };
  const estado = u.searchParams.get("estado");
  const g = u.searchParams.get("gravedad");
  const patas = u.searchParams.get("patas");
  return {
    accion: nombre === "volver" ? "volver" : "salir",
    x: num("x"),
    y: num("y"),
    estado: ESTADOS.includes(estado) ? estado : "reposo",
    mensaje: (u.searchParams.get("msg") || "").slice(0, 140),
    gravedad: g === "1" ? true : g === "0" ? false : null,
    patas: patas === "cuatro" || patas === "dos" ? patas : null,
  };
}

module.exports = { leerEnlace, ESTADOS };
