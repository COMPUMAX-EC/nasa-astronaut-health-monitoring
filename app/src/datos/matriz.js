// La matriz de riesgo (data/indicadores.csv) se incluye en la compilación, así la app
// explica cada indicador sin conexión y siempre con la misma fuente que la documentación.
import csv from "../../../data/indicadores.csv?raw";
import { indexarMatriz } from "./csv.js";

export const MATRIZ = indexarMatriz(csv);
