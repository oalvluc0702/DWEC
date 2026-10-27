// comprobar.mjs — El comprobador de la batería de la UD4. Lo lanza ./bateria.sh comprobar [bloque]
// Te dice qué llevas bien y qué te falta. NO te da la solución: te dice qué caso falla.
//
//   node comprobador/comprobar.mjs            → todos los bloques
//   node comprobador/comprobar.mjs 2          → solo el bloque 2   (1 a 6)
//   node comprobador/comprobar.mjs --informe  → además guarda entrega/informe-comprobador.txt
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { BLOQUES } from "./pruebas.mjs";

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);

// Node no siempre dice en qué fichero está un error de sintaxis: lo buscamos con node --check
function dondeEsta(error, primero = []) {
  const enPila = (error.stack ?? "").split("\n").find((l) => l.includes("/src/"));
  if (enPila) return ` (${enPila.trim().replace(/^at\s+/, "").replace(/^.*\/src\//, "src/")})`;
  if (error.name !== "SyntaxError") return "";
  // Primero los ficheros del bloque, luego los demás bloques y main.js/página al final
  const peso = (f) => (primero.includes(`src/${f}`) ? 0 : f.startsWith("bloque") ? 1 : 2);
  const ficheros = readdirSync(join(RAIZ, "src"), { recursive: true })
    .filter((f) => f.endsWith(".js"))
    .sort((a, b) => peso(a) - peso(b) || a.localeCompare(b));
  for (const f of ficheros) {
    const r = spawnSync(process.execPath, ["--check", join(RAIZ, "src", f)], { encoding: "utf8" });
    if (r.status !== 0) {
      const linea = r.stderr.split("\n").find((l) => l.includes(`src/${f}:`)) ?? "";
      const num = linea.match(/:(\d+)\s*$/)?.[1];
      return ` → en src/${f}${num ? `, línea ${num}` : ""}`;
    }
  }
  return "";
}

// ───────────────────────── modo hijo: ejecuta UN bloque y devuelve JSON ─────────────────────────
// Cada bloque va en un proceso aparte con un tiempo máximo: así un bucle infinito no cuelga todo.
if (args[0] === "--hijo") {
  const bloque = BLOQUES.find((b) => b.id === args[1]);
  const resultados = [];
  const ctx = {
    raiz: RAIZ,
    leer: (ruta) => (existsSync(join(RAIZ, ruta)) ? readFileSync(join(RAIZ, ruta), "utf8") : null),
    cargar: async (ruta) => import(pathToFileURL(join(RAIZ, ruta)).href),
    entorno: process.env,
  };
  let modulos = {};
  try {
    for (const [nombre, ruta] of Object.entries(bloque.modulos ?? {})) {
      modulos[nombre] = await ctx.cargar(ruta);
    }
  } catch (error) {
    resultados.push({
      id: bloque.id.toUpperCase(),
      texto: "Cargar los ficheros del bloque",
      estado: "mal",
      detalle: `💥 No se puede cargar: ${error.name}: ${error.message}${dondeEsta(error, Object.values(bloque.modulos ?? {}))}`,
    });
    modulos = null;
  }
  if (modulos) {
    for (const prueba of bloque.pruebas) {
      let estado = "bien";
      let detalle = "";
      let info = [];
      try {
        const r = await prueba.fn(modulos, ctx);
        if (r === "pendiente") estado = "pendiente";
        else if (typeof r === "string") {
          estado = "mal";
          detalle = r;
        } else if (r && typeof r === "object" && r.aviso) {
          estado = "aviso";
          detalle = r.aviso;
        } else if (r && typeof r === "object" && (r.mal || r.bien)) {
          estado = r.mal ? "mal" : "bien";
          detalle = r.mal ?? "";
          info = r.info ?? [];
        }
      } catch (error) {
        if (error?.message === "Sin hacer") {
          estado = "pendiente";
        } else if (error instanceof TypeError && /read only|not extensible|Cannot add property|Cannot delete/.test(error.message)) {
          estado = "mal";
          detalle = `Estás MODIFICANDO un objeto que no deberías tocar (${error.message}). Devuelve uno nuevo.`;
        } else if (/Invalid array length|Maximum call stack|heap out of memory/.test(error?.message ?? "")) {
          estado = "mal";
          detalle = `💥 ${error.name}: ${error.message} → ¿un bucle que no termina? (en un while, ¿avanza el contador?)`;
        } else {
          estado = "mal";
          detalle = `💥 ${error?.name ?? "Error"}: ${error?.message ?? error}`;
        }
      }
      resultados.push({ id: prueba.id, texto: prueba.texto, estado, detalle, info, opcional: prueba.opcional });
    }
  }
  process.stdout.write(JSON.stringify(resultados));
  process.exit(0);
}

// ───────────────────────── modo normal ─────────────────────────
const color = process.stdout.isTTY || process.env.FORCE_COLOR === "1";
const c = (cod, t) => (color ? `\x1b[${cod}m${t}\x1b[0m` : t);
const ICONO = { bien: c("1;32", "✔"), mal: c("1;31", "✘"), pendiente: c("1;33", "⏳"), aviso: c("1;33", "!") };

const filtro = args.find((a) => !a.startsWith("--"))?.toLowerCase();
const informe = args.includes("--informe");
const elegidos = filtro ? BLOQUES.filter((b) => b.id === filtro) : BLOQUES;
if (elegidos.length === 0) {
  console.error(`No existe el bloque «${filtro}». Bloques: ${BLOQUES.map((b) => b.id).join(", ")}`);
  process.exit(2);
}

const lineas = [];
const salida = (t = "") => {
  console.log(t);
  lineas.push(t.replace(/\x1b\[[0-9;]*m/g, ""));
};

let totalBien = 0;
let totalObligatorias = 0;
const resumen = [];

for (const bloque of elegidos) {
  salida();
  salida(c("1", `━━ ${bloque.titulo} ━━`));
  const hijo = spawnSync(process.execPath, [fileURLToPath(import.meta.url), "--hijo", bloque.id], {
    encoding: "utf8",
    timeout: 8000,
    env: process.env,
  });
  let resultados;
  if (hijo.error?.code === "ETIMEDOUT" || hijo.signal) {
    resultados = [
      {
        id: bloque.id.toUpperCase(),
        texto: "Ejecutar las pruebas del bloque",
        estado: "mal",
        detalle: "⌛ No termina nunca: ¿tienes un bucle infinito? (en un while, ¿avanza el contador?)",
      },
    ];
  } else {
    try {
      resultados = JSON.parse(hijo.stdout);
    } catch {
      resultados = [
        {
          id: bloque.id.toUpperCase(),
          texto: "Ejecutar las pruebas del bloque",
          estado: "mal",
          detalle: `💥 El comprobador no ha podido ejecutar tu código: ${(hijo.stderr || hijo.stdout).trim().split("\n").slice(0, 3).join(" ")}`,
        },
      ];
    }
  }
  let bien = 0;
  let obligatorias = 0;
  for (const r of resultados) {
    const etiqueta = r.opcional ? c("2", " (opcional)") : "";
    salida(`  ${ICONO[r.estado]} ${c("1", r.id.padEnd(5))} ${r.texto}${etiqueta}`);
    if (r.detalle) salida(`         ${r.estado === "mal" ? c("31", r.detalle) : c("33", r.detalle)}`);
    // Las explicaciones de las predicciones solo se enseñan al comprobar UN bloque (si no, sería eterno)
    if (r.info?.length) {
      if (filtro) for (const linea of r.info) salida(`         ${linea}`);
      else salida(c("2", `         (./bateria.sh comprobar ${bloque.id} para ver el porqué de cada una)`));
    }
    if (!r.opcional) {
      obligatorias++;
      if (r.estado === "bien" || r.estado === "aviso") bien++;
    }
  }
  totalBien += bien;
  totalObligatorias += obligatorias;
  resumen.push(`${bloque.id.toUpperCase().padEnd(6)} ${String(bien).padStart(2)}/${obligatorias}`);
}

salida();
salida(c("1", `━━ Resumen ━━`));
salida("  " + resumen.join("   "));
const todo = totalBien === totalObligatorias;
salida(
  todo
    ? c("1;32", `  ✔ ${totalBien}/${totalObligatorias}: ¡todo en verde! ${filtro ? "" : "Has terminado la batería de la UD4."}`)
    : `  ${totalBien}/${totalObligatorias} comprobaciones en verde. ⏳ = sin hacer · ✘ = hay que arreglarlo`,
);

if (informe) {
  mkdirSync(join(RAIZ, "entrega"), { recursive: true });
  const cabecera = `Comprobador · ${new Date().toLocaleString("es-ES", { timeZone: "Europe/Madrid" })}`;
  writeFileSync(join(RAIZ, "entrega", "informe-comprobador.txt"), [cabecera, ...lineas].join("\n") + "\n");
}
process.exit(todo ? 0 : 1);
