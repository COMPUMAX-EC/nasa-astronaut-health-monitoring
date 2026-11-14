# Laica en el escritorio

Una página web no puede dibujar fuera de la ventana del navegador. Esta pequeña app de escritorio (Electron) es lo que permite que Laica **salga del navegador** y ande por todo tu escritorio:

- Salta desde el punto del navegador donde estaba.
- Vuela por la pantalla y rebota contra los bordes (se aplasta y suelta una chispa).
- Aterriza y camina sobre la barra de tareas, luego despega otra vez.
- Se esconde por un borde y se asoma (por abajo, desde detrás de la barra de tareas).
- Te mira cuando el cursor está cerca.
- La puedes **agarrar y lanzar**; un clic es una caricia.
- Camina en dos patas o en **cuatro patas**.
- **Gravedad opcional**: con gravedad cae, rebota en el suelo, camina sobre la barra de tareas, salta, se sienta y, si la lanzas, hace una parábola. Sin gravedad flota como en el espacio.
- **Clic derecho** sobre ella: Explorar, Caminar, Esconderse y asomarse, Gravedad (casilla), En cuatro patas (casilla), Volver al navegador. Las casillas se recuerdan.
- Cada 4 a 7 minutos te recuerda tomar agua, descansar la vista o estirarte.

Es una ventana transparente, sin marco y siempre encima que cubre la pantalla. Los clics la atraviesan, así que puedes seguir usando tu computadora normalmente; solo Laica responde al ratón.

## Cómo usarla

```bash
cd escritorio
npm install
npm start
```

`npm start` muestra a Laica y registra el enlace `laica://` en tu usuario. Desde ese momento, el botón **🖥️ Sacarla al escritorio** de la app web la abre, y **Traer a Laica de vuelta** la cierra. El navegador te preguntará la primera vez si permites abrir la app.

Enlaces que entiende (ver [enlace.js](enlace.js)):

| Enlace | Qué hace |
|---|---|
| `laica://salir?x=640&y=360&estado=reposo&msg=Hola` | Sale en ese punto de la pantalla, con ese estado y mensaje |
| `laica://volver` | Vuelve al navegador (cierra la app) |

## Pruebas

```bash
npm test
```

Para revisar que se dibuja sin mirar la pantalla: `LAICA_CAPTURA=captura.png npm start` guarda una imagen a los 2,5 s y se cierra (no registra el enlace).

## Notas

- Si el sistema tiene activado "reducir movimiento", Laica se queda quieta en la esquina inferior derecha.
- Usa el área de trabajo de la pantalla donde estaba el navegador; con varios monitores, sale en ese monitor.
- Es una versión de desarrollo: para repartirla como instalador habría que empaquetarla (por ejemplo con electron-builder) y copiar `assets/laica/laica.js` dentro del paquete.
