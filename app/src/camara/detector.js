// Carga MediaPipe Face Landmarker desde archivos de la propia app (carpeta mediapipe/ que arma
// vite.config.js): el modelo corre en el navegador, sin internet y sin enviar la imagen a nadie.
// Se importa bajo demanda, solo cuando la persona acepta prender la cámara.

const ruta = (archivo) => new URL(`mediapipe/${archivo}`, document.baseURI).href;

export async function crearDetector() {
  const { FaceLandmarker } = await import("@mediapipe/tasks-vision");
  const archivos = {
    wasmLoaderPath: ruta("vision_wasm_internal.js"),
    wasmBinaryPath: ruta("vision_wasm_internal.wasm"),
  };
  const opciones = (delegate) => ({
    baseOptions: { modelAssetPath: ruta("face_landmarker.task"), delegate },
    runningMode: "VIDEO",
    numFaces: 1,
    outputFaceBlendshapes: true,
    outputFacialTransformationMatrixes: true,
  });
  let lm;
  try { lm = await FaceLandmarker.createFromOptions(archivos, opciones("GPU")); }
  catch { lm = await FaceLandmarker.createFromOptions(archivos, opciones("CPU")); } // sin WebGL2
  return {
    /** Devuelve { blend: [...categorías], matriz: [16] } de la primera cara, o null si no hay cara. */
    leer(video, t) {
      const r = lm.detectForVideo(video, t);
      if (!r.faceBlendshapes?.length) return null;
      return { blend: r.faceBlendshapes[0].categories, matriz: r.facialTransformationMatrixes?.[0]?.data ?? null };
    },
    cerrar() { lm.close(); },
  };
}
