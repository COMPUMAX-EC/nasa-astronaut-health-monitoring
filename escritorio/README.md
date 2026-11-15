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

## Cómo iniciarla

**Con el .exe (sin instalar nada):** doble clic en `Laica-1.0.0-portable.exe`. Laica aparece donde está el cursor. Windows puede mostrar "Windows protegió su PC" porque el .exe no está firmado: *Más información → Ejecutar de todas formas*. Para generarlo: `npm run exe` (queda en `escritorio/dist/`).

**Desde el código:**

```bash
cd escritorio
npm install
npm start
```

**Desde la app web:** después de abrirla una vez (con el .exe o con `npm start`), el botón **🖥️ Sacarla al escritorio** la abre sola desde el punto del navegador donde estaba.

## Pausar, reactivar y cerrar

| Qué | Cómo |
|---|---|
| Pausar (se esconde, sin ladridos ni recordatorios) | **Ctrl+Alt+L**, clic en su ícono junto al reloj, o clic derecho sobre ella → *Pausar* |
| Reactivar | **Ctrl+Alt+L** otra vez, clic en el ícono junto al reloj, o el botón *Sacarla al escritorio* de la app web |
| Cerrar | Clic derecho sobre ella o sobre el ícono → *Volver al navegador* / *Salir* |

## Ventanas de otras aplicaciones (Windows)

Laica ve dónde están el navegador y los demás programas (solo la posición y el tamaño de cada ventana, nunca su contenido; ver [ventanas.js](ventanas.js)):

- Con gravedad, **cae y se para sobre el borde de arriba** de cualquier ventana y camina por él. En la orilla se asoma y da la vuelta, o se tira.
- **Rebota** en los costados y en el borde de abajo de las ventanas (también volando sin gravedad).
- Si **arrastras la ventana** donde está parada, viaja con ella. Si la cierras o la minimizas, se cae.
- Solo cuentan los bordes que se ven: una ventana tapa los de las que están detrás. Las ventanas maximizadas no tienen borde de arriba donde pararse.

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
- `npm start` y `npm run exe` copian primero a Laica desde `assets/laica` a `escritorio/laica` (carpeta ignorada por git).
