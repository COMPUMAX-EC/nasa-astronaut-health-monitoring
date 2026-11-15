// Charla de Laica: mezcla conversación casual (chistes, curiosidades del espacio, compañía)
// con preguntas cortas sobre la salud mental y física del astronauta. Son preguntas de un toque:
// la persona responde con un botón y Laica contesta con empatía y, si hace falta, con una acción
// concreta o la sugerencia de avisar al médico de vuelo. Solo el ánimo (1 a 5) se guarda como dato,
// porque es el indicador PS-01 que ya evalúa el motor de alertas.

export const CASUAL = [
  "¿Sabías que en la Estación Espacial ven unos 16 amaneceres al día? Yo con uno ya bostezo.",
  "Dato perruno: en microgravedad mi cola flota sola. Muy elegante, la verdad.",
  "Si pudieras traer una comida de la Tierra ahora mismo, ¿cuál sería? Yo pido croquetas, obvio.",
  "Me pregunto si en Marte habrá ardillas. Por si acaso, estoy lista.",
  "La Tierra se ve chiquita desde aquí, pero la gente que te quiere sigue siendo enorme.",
  "Hace rato no te cuento un chiste: ¿qué hace un perro astronauta? ¡Explora la vía láctea… a lengüetazos!",
  "En el espacio no hay arriba ni abajo. Para mí, arriba es donde están las croquetas.",
  "¿Ya viste por la ventana hoy? Dicen que mirar la Tierra baja el estrés. A mí me sube la cola.",
  "Tu racha de check-ins va bien. Yo llevo 0 días sin perseguir mi propia cola.",
  "Si te aburres, cuéntame algo. Soy excelente escuchando. También comiendo.",
];

// tipo: "mente" o "cuerpo". En cada opción: etiqueta del botón, respuesta de Laica y, si es
// preocupante, cuidado: true (Laica sugiere avisar). guardar: dato del check-in que se registra.
export const PREGUNTAS = [
  {
    id: "animo", tipo: "mente", texto: "Pregunta rápida: del 1 al 5, ¿cómo va tu ánimo hoy?",
    opciones: [1, 2, 3, 4, 5].map((n) => ({
      etiqueta: String(n), guardar: { animo: n }, cuidado: n === 1,
      respuesta: n >= 4 ? "¡Qué bueno! Lo anoto en tu registro de ánimo."
        : n === 3 ? "Un día normal también cuenta. Lo anoto."
          : n === 2 ? "Lo anoto. Gracias por decírmelo; ¿hacemos algo que te guste en el próximo descanso?"
            : "Lo anoto. Es importante: habla hoy con el equipo de apoyo psicológico o el médico de vuelo. No estás solo.",
    })),
  },
  {
    id: "soledad", tipo: "mente", texto: "¿Te has sentido solo o lejos de todos estos días?",
    opciones: [
      { etiqueta: "No", respuesta: "Me alegra. Igual aquí estoy, por si acaso." },
      { etiqueta: "Un poco", respuesta: "Es muy normal en misiones largas. ¿Y si hoy agendas una llamada con tu familia?" },
      { etiqueta: "Mucho", cuidado: true, respuesta: "Gracias por contármelo. Cuéntaselo también al equipo de apoyo psicológico: el aislamiento es uno de los 5 peligros de la misión y tiene apoyo." },
    ],
  },
  {
    id: "estres", tipo: "mente", texto: "¿Algo te está estresando hoy?",
    opciones: [
      { etiqueta: "Nada", respuesta: "¡Perfecto! Día tranquilo, cola tranquila." },
      { etiqueta: "Un poco", respuesta: "Probemos algo: tres respiraciones lentas, exhalando más largo de lo que inhalas." },
      { etiqueta: "Bastante", cuidado: true, respuesta: "Vamos paso a paso. Si sigue así, coméntalo con tu equipo hoy; no tienes que cargarlo solo." },
    ],
  },
  {
    id: "contacto", tipo: "mente", texto: "¿Hablaste hoy con alguien de tu familia o del equipo?",
    opciones: [
      { etiqueta: "Sí", respuesta: "¡Bien! Hablar con los tuyos es la mejor medicina que no viene en frasco." },
      { etiqueta: "Todavía no", respuesta: "Aún hay tiempo. Un mensaje corto también cuenta." },
    ],
  },
  {
    id: "agua", tipo: "cuerpo", texto: "¿Tomaste agua en las últimas dos horas?",
    opciones: [
      { etiqueta: "Sí", respuesta: "¡Bien! En microgravedad la sed engaña, así que vas muy bien." },
      { etiqueta: "No", respuesta: "Toma un poco ahora. En el espacio los líquidos suben a la cabeza y no sientes tanta sed." },
    ],
  },
  {
    id: "ejercicio", tipo: "cuerpo", texto: "¿Ya hiciste tu ejercicio de hoy?",
    opciones: [
      { etiqueta: "Sí", respuesta: "¡Excelente! Tus huesos y músculos te lo agradecen." },
      { etiqueta: "Aún no", respuesta: "Sin gravedad, hueso y músculo se pierden rápido. ¿Lo agendamos para la próxima hora?" },
    ],
  },
  {
    id: "vista", tipo: "cuerpo", texto: "¿Has notado dolor de cabeza o la vista borrosa?",
    opciones: [
      { etiqueta: "No", respuesta: "Perfecto. Lo pregunto porque en el espacio la presión en los ojos puede cambiar." },
      { etiqueta: "Un poco", respuesta: "Anótalo en tu check-in de hoy. Si sigue mañana, avisa al médico de vuelo." },
      { etiqueta: "Sí", cuidado: true, respuesta: "Avísale hoy al médico de vuelo: cambios en la vista pueden ser parte del síndrome neuro-ocular del vuelo espacial (SANS)." },
    ],
  },
  {
    id: "espalda", tipo: "cuerpo", texto: "¿Cómo está tu espalda hoy?",
    opciones: [
      { etiqueta: "Bien", respuesta: "¡Bien! Recuerda estirarte entre tareas." },
      { etiqueta: "Molesta", respuesta: "Sin gravedad la columna se estira y es común. Prueba posición fetal suave unos minutos." },
      { etiqueta: "Duele mucho", cuidado: true, respuesta: "No lo dejes pasar: comunícalo al médico de vuelo." },
    ],
  },
  {
    id: "mareo", tipo: "cuerpo", texto: "¿Sientes mareo o náuseas?",
    opciones: [
      { etiqueta: "No", respuesta: "¡Genial! Estómago de astronauta." },
      { etiqueta: "Un poco", respuesta: "Mueve la cabeza despacio y fija la vista en un punto. Si sigue, anótalo." },
      { etiqueta: "Bastante", cuidado: true, respuesta: "Descansa y avísale al médico de vuelo, sobre todo si vomitas o no puedes comer." },
    ],
  },
];

/**
 * Elige lo siguiente que dirá Laica. Patrón: dos charlas casuales y luego una pregunta de
 * salud, alternando mente y cuerpo y sin repetir lo reciente.
 * historial: lista de { tipo: "casual" | "mente" | "cuerpo", id } (lo más reciente al final).
 * Devuelve { tipo: "casual", id, texto } o { tipo: "pregunta", ...pregunta }.
 */
export function siguiente(historial = [], azar = Math.random) {
  const recientes = historial.slice(-8).map((h) => h.id);
  const casualesSeguidas = (() => {
    let n = 0;
    for (let i = historial.length - 1; i >= 0 && historial[i].tipo === "casual"; i--) n++;
    return n;
  })();
  const elegir = (lista) => {
    const libres = lista.filter((x) => !recientes.includes(x.id));
    const pool = libres.length ? libres : lista;
    return pool[Math.floor(azar() * pool.length)];
  };
  if (casualesSeguidas >= 2) {
    const ultimaSalud = [...historial].reverse().find((h) => h.tipo !== "casual");
    const tipo = ultimaSalud?.tipo === "mente" ? "cuerpo" : "mente";
    return { ...elegir(PREGUNTAS.filter((p) => p.tipo === tipo)), tipo: "pregunta", area: tipo };
  }
  const casuales = CASUAL.map((texto, i) => ({ id: `c${i}`, texto }));
  return { ...elegir(casuales), tipo: "casual" };
}
