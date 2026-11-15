// Ventanas de otras aplicaciones (solo Windows): dónde están el navegador y los demás programas,
// para que Laica camine sobre sus bordes, se caiga por las orillas y rebote en sus costados.
// Sin módulos nativos: un proceso de PowerShell llama a user32/dwmapi y cada 300 ms imprime
// una línea JSON con [id, x, y, ancho, alto] de cada ventana visible, de la de más arriba a la de
// más abajo (orden Z). Solo lee posiciones y tamaños; no lee títulos ni contenido.

const { spawn } = require("node:child_process");

const CSHARP = String.raw`
using System; using System.Runtime.InteropServices; using System.Text;
public static class VentanasLaica {
  delegate bool Recorrer(IntPtr h, IntPtr l);
  [StructLayout(LayoutKind.Sequential)] public struct Rect { public int L, T, R, B; }
  [DllImport("user32.dll")] static extern bool EnumWindows(Recorrer f, IntPtr l);
  [DllImport("user32.dll")] static extern bool IsWindowVisible(IntPtr h);
  [DllImport("user32.dll")] static extern bool IsIconic(IntPtr h);
  [DllImport("user32.dll")] static extern int GetWindowTextLength(IntPtr h);
  [DllImport("user32.dll")] static extern int GetClassName(IntPtr h, StringBuilder s, int n);
  [DllImport("user32.dll")] static extern uint GetWindowThreadProcessId(IntPtr h, out uint p);
  [DllImport("user32.dll")] static extern int GetWindowLong(IntPtr h, int i);
  [DllImport("dwmapi.dll")] static extern int DwmGetWindowAttribute(IntPtr h, int a, out Rect r, int s);
  [DllImport("dwmapi.dll")] static extern int DwmGetWindowAttribute(IntPtr h, int a, out int v, int s);
  public static string Leer(uint yo) {
    var sb = new StringBuilder("[");
    bool primero = true;
    EnumWindows((h, l) => {
      if (!IsWindowVisible(h) || IsIconic(h) || GetWindowTextLength(h) == 0) return true;
      uint pid; GetWindowThreadProcessId(h, out pid);
      if (pid == yo) return true;
      if ((GetWindowLong(h, -20) & 0x80) != 0) return true; // ventanas de herramientas
      int oculta; if (DwmGetWindowAttribute(h, 14, out oculta, 4) == 0 && oculta != 0) return true;
      var c = new StringBuilder(64); GetClassName(h, c, 64); var k = c.ToString();
      if (k == "Progman" || k == "WorkerW" || k == "Shell_TrayWnd" || k == "Shell_SecondaryTrayWnd") return true;
      Rect r; if (DwmGetWindowAttribute(h, 9, out r, 16) != 0) return true; // borde visible real
      if (r.R - r.L < 120 || r.B - r.T < 80) return true;
      if (!primero) sb.Append(',');
      primero = false;
      sb.Append('[').Append(h.ToInt64()).Append(',').Append(r.L).Append(',').Append(r.T)
        .Append(',').Append(r.R - r.L).Append(',').Append(r.B - r.T).Append(']');
      return true;
    }, IntPtr.Zero);
    return sb.Append(']').ToString();
  }
}`;

function guion(pid) {
  return `$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'
Add-Type -TypeDefinition @'
${CSHARP}
'@
while ($true) {
  [Console]::Out.WriteLine([VentanasLaica]::Leer(${pid}))
  [Console]::Out.Flush()
  Start-Sleep -Milliseconds 300
}`;
}

/**
 * Empieza a vigilar las ventanas. alCambiar recibe [{ id, x, y, w, h }] en píxeles físicos de
 * pantalla, ordenadas de la de más arriba a la de más abajo. Devuelve una función para detener.
 */
function vigilarVentanas(alCambiar, pid = process.pid) {
  if (process.platform !== "win32") return () => {};
  const codificado = Buffer.from(guion(pid), "utf16le").toString("base64");
  let proc;
  try {
    proc = spawn("powershell.exe", ["-NoProfile", "-NonInteractive", "-ExecutionPolicy", "Bypass", "-EncodedCommand", codificado],
      { windowsHide: true, stdio: ["ignore", "pipe", "pipe"] });
  } catch {
    return () => {};
  }
  let resto = "", ultimo = "";
  proc.stdout.setEncoding("utf8");
  proc.stdout.on("data", (trozo) => {
    resto += trozo;
    const lineas = resto.split(/\r?\n/);
    resto = lineas.pop();
    const linea = lineas.filter(Boolean).pop();
    if (!linea || linea === ultimo) return;
    ultimo = linea;
    let lista;
    try { lista = JSON.parse(linea).map(([id, x, y, w, h]) => ({ id: String(id), x, y, w, h })); } catch { return; } // línea incompleta
    try { alCambiar(lista); } catch (e) { console.log("[ventanas]", e.message); }
  });
  proc.stderr.on("data", (d) => {
    const t = String(d).trim();
    if (t && !t.startsWith("#< CLIXML") && !t.startsWith("<Objs")) console.log("[ventanas]", t.slice(0, 200));
  });
  proc.on("error", () => {});
  return () => { try { proc.kill(); } catch { /* ya cerrado */ } };
}

module.exports = { vigilarVentanas };
