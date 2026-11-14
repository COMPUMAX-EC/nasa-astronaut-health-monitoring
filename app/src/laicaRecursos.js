// Le dice a <laica-mascota> dónde están sus fotos (diseño de Canva del equipo) y sus sonidos
// (ladridos, gruñidos y quejidos reales, CC0). Vite les pone nombre con huella y el service
// worker los guarda para funcionar sin conexión. Debe importarse antes que laica.js.
import frente from "../../assets/laica/canva/frente.webp";
import izquierda from "../../assets/laica/canva/izquierda.webp";
import derecha from "../../assets/laica/canva/derecha.webp";
import espalda from "../../assets/laica/canva/espalda.webp";
import saludando from "../../assets/laica/canva/saludando.webp";

const sonidos = import.meta.glob("../../assets/laica/sonidos/*.wav", { eager: true, query: "?url", import: "default" });
const deTipo = (tipo) => Object.entries(sonidos)
  .filter(([ruta]) => ruta.includes(`/${tipo}-`))
  .map(([, url]) => url);

window.LAICA_RECURSOS = {
  fotos: { frente, izquierda, derecha, espalda, saludando },
  sonidos: { ladrido: deTipo("ladrido"), grunido: deTipo("grunido"), quejido: deTipo("quejido") },
};
