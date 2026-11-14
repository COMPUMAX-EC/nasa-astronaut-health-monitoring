import React from "react";
import { createRoot } from "react-dom/client";
import "../../assets/laica/laica.js"; // registra <laica-mascota>
import App from "./App.jsx";
import "./styles.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Service worker solo en la versión compilada: en desarrollo la caché estorba.
if (import.meta.env.PROD && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch((e) => console.warn("Service worker no registrado:", e));
  });
}
