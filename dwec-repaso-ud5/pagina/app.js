// app.js — La página del repaso (el taller La Cadena). No hace falta tocarla: lo tuyo está en src/.
// Monta el escenario del bloque, conecta TUS funciones, deja todo en la consola y ejecuta los ejemplos.
// Cada vez que guardas un fichero de src/, Vite recarga la página sola.
import { BLOQUES, cargarBloque, cargarPredicciones } from "./ejemplos.js";
import * as modelo from "../src/modelo/taller.js";

const n = Number(new URLSearchParams(location.search).get("bloque")) || 1;
const bloque = BLOQUES.find((b) => b.n === n) ?? BLOQUES[0];
const app = document.querySelector("#app");

// ── Mostrar un valor como lo enseñaría la consola (en corto) ──
function mostrar(v, prof = 0) {
  if (v === undefined) return "undefined";
  if (v === null) return "null";
  if (typeof v === "string") return JSON.stringify(v);
  if (typeof v === "function") return /^class\b/.test(Function.prototype.toString.call(v)) ? `class ${v.name}` : `ƒ ${v.name || "(anónima)"}()`;
  if (typeof v !== "object") return String(v);
  if (v instanceof Element) {
    const attrs = [...v.attributes].map((a) => ` ${a.name}="${a.value}"`).join("");
    return `<${v.tagName.toLowerCase()}${attrs}>`;
  }
  if (v instanceof Text) return `#text ${JSON.stringify(v.data)}`;
  if (v instanceof NodeList || v instanceof HTMLCollection) return `${v.constructor.name}(${v.length}) [${[...v].map((x) => mostrar(x, prof + 1)).join(", ")}]`;
  if (v instanceof Date) return Number.isNaN(v.getTime()) ? "Invalid Date" : `Date(${v.toLocaleString("es-ES")})`;
  if (v instanceof Error) return `${v.name}: ${v.message}`;
  if (prof > 3) return "…";
  if (v instanceof Map) return `Map(${v.size}) {${[...v].map(([k, x]) => ` ${mostrar(k, prof + 1)} => ${mostrar(x, prof + 1)}`).join(",")} }`;
  if (Array.isArray(v)) return `[${v.map((x) => mostrar(x, prof + 1)).join(", ")}]`;
  const clase = v.constructor && v.constructor !== Object ? `${v.constructor.name} ` : "";
  const props = Object.entries(v).map(([k, x]) => `${k}: ${mostrar(x, prof + 1)}`);
  return props.length ? `${clase}{ ${props.join(", ")} }` : `${clase}{}`;
}

// ── Ejecutar código como la consola: da el valor de la última sentencia ──
// Las funciones del bloque, escenario, $, anota, las clases del modelo y nuevoTaller() están en window: el código las ve por su nombre.
const ejecutarEnGlobal = (codigo) => (0, eval)(codigo); // eval indirecto: cada ejecución con sus propias const

function ejecutar(codigo) {
  try {
    return { ok: true, valor: ejecutarEnGlobal(codigo) };
  } catch (error) {
    return { ok: false, error };
  }
}

// ── Pintar ──
const el = (etiqueta, props = {}, ...hijos) => {
  const nodo = Object.assign(document.createElement(etiqueta), props);
  nodo.append(...hijos);
  return nodo;
};

// Un TypeError «x is not a function» casi siempre es que ese método o esa función aún no está escrito
const faltaAlgo = (error) => error instanceof TypeError && / is not a (function|constructor)$/.test(error.message);

function textoError(error, codigo) {
  if (error?.message === "Sin hacer") return ["pendiente", "⏳ Sin hacer todavía"];
  if (faltaAlgo(error)) {
    console.info(`⏳ ${error.message} (al ejecutar: ${codigo.split("\n").at(-1)})`);
    return ["pendiente", `⏳ Todavía no existe: ${error.message.replace(/ is not a (function|constructor)$/, "")}. ¿Lo has escrito?`];
  }
  // A la consola, con su pila: pinchando en el enlace (src/bloqueN/…:línea) vas directo a la línea que falla
  console.groupCollapsed(`💥 ${error?.name}: ${error?.message} · al ejecutar: ${codigo.split("\n").at(-1)}`);
  console.error(error);
  console.groupEnd();
  return ["mal", `💥 ${error?.name ?? "Error"}: ${error?.message ?? error}   (más detalle en la consola, F12)`];
}

let montajePendiente = false; // si TU función de montar está sin hacer, los ejemplos que dependen de ella esperan

function filaEjemplo({ codigo, espera, tipo = "✍️", nota, trasMontar }) {
  if (trasMontar && montajePendiente)
    return el(
      "li",
      { className: "ejemplo pendiente" },
      el("span", { className: "tipo", textContent: tipo }),
      el("pre", { className: "codigo", textContent: codigo }),
      el("div", { className: "resultado", textContent: `→ ⏳ Cuando funcione ${bloque.montar[0].nombre}` }),
    );
  const r = ejecutar(codigo);
  let clase;
  let texto;
  if (r.ok) {
    const sale = mostrar(r.valor);
    [clase, texto] = sale === espera ? ["bien", `${sale}  ✔`] : ["mal", `${sale}   ✘ se esperaba ${espera}${nota ? ` (${nota})` : ""}`];
  } else {
    [clase, texto] = textoError(r.error, codigo);
  }
  return el(
    "li",
    { className: `ejemplo ${clase}` },
    el("span", { className: "tipo", textContent: tipo }),
    el("pre", { className: "codigo", textContent: codigo }),
    el("div", { className: "resultado", textContent: `→ ${texto}` }),
  );
}

// El registro: lo que van haciendo tus funciones cuando usas el escenario
const registro = el("ul", { className: "registro" });
function anota(...partes) {
  const texto = partes.map((p) => (typeof p === "string" ? p : mostrar(p))).join(" ");
  registro.prepend(el("li", { textContent: `${new Date().toLocaleTimeString("es-ES")} · ${texto}` }));
  console.log("📝", ...partes);
}

function seccionEscenario() {
  const caja = el("div", { className: "escenario", id: "escenario" });
  caja.innerHTML = bloque.html;
  return [caja, el("div", { className: "panel" }, el("h2", { textContent: "🧩 El escenario" }), el("p", { textContent: "La página de prueba del bloque. Úsala: pulsa, escribe, envía. Lo que hacen tus funciones sale en el registro de abajo." }), caja)];
}

function conectar() {
  const filas = (bloque.montar ?? []).map(({ nombre, codigo }) => {
    const r = ejecutar(codigo);
    const [clase, texto] = r.ok ? ["bien", "✔ conectado"] : textoError(r.error, codigo);
    if (!r.ok) montajePendiente = true;
    return el("li", { className: clase, textContent: `${nombre}  →  ${texto}` });
  });
  if (filas.length === 0) return "";
  return el(
    "div",
    { className: "panel" },
    el("h2", { textContent: "📝 Lo que pasa en el escenario" }),
    el("ul", { className: "conexiones" }, ...filas),
    registro,
  );
}

function seccionPredicciones(predicciones) {
  if (predicciones.length === 0) return "";
  const filas = predicciones.map(({ clave, expresion, tuya }) => {
    const codigo = expresion; // la línea del comentario de predicciones.js, tal cual
    const salida = el("td", { className: "real" });
    const boton = codigo ? el("button", { type: "button", textContent: "Probar", title: codigo }) : el("span", { textContent: "(se piensa)" });
    if (codigo)
      boton.addEventListener("click", () => {
        const r = ejecutar(codigo);
        salida.textContent = r.ok ? mostrar(r.valor) : `💥 ${r.error.name}: ${r.error.message}`;
        console.log(`🔮 ${clave}:\n${codigo}\n→`, r.ok ? r.valor : r.error);
      });
    return el(
      "tr",
      {},
      el("td", { textContent: clave }),
      el("td", {}, el("code", { textContent: expresion })),
      el("td", { textContent: tuya === undefined ? "(sin contestar)" : mostrar(tuya) }),
      el("td", {}, boton),
      salida,
    );
  });
  return el(
    "div",
    { className: "panel" },
    el("h2", { textContent: "🔮 Predicciones" }),
    el("p", { textContent: "Contesta primero en predicciones.js. Después pulsa «Probar»: en la consola (F12) sale el código exacto que se ejecuta, para que lo pruebes tú y lo cambies. El PORQUÉ te lo da docker compose run --rm web npm run comprobar." }),
    el(
      "table",
      {},
      el("thead", {}, el("tr", {}, ...["", "Expresión", "Tu respuesta", "", "Lo que da"].map((t) => el("th", { textContent: t })))),
      el("tbody", {}, ...filas),
    ),
  );
}

function seccionProbar() {
  const area = el("textarea", { rows: 4, spellcheck: false, value: bloque.ejemplos.at(-1).codigo });
  const salida = el("pre", { className: "salida" });
  const boton = el("button", { type: "button", textContent: "▶ Ejecutar" });
  boton.addEventListener("click", () => {
    const r = ejecutar(area.value);
    salida.className = `salida ${r.ok ? "bien" : "mal"}`;
    salida.textContent = r.ok ? `→ ${mostrar(r.valor)}` : textoError(r.error, area.value)[1];
  });
  return el(
    "div",
    { className: "panel" },
    el("h2", { textContent: "🧪 Prueba tu código" }),
    el("p", { textContent: 'Como en la consola: se enseña lo que da la última línea. Puedes usar todo lo del bloque, escenario y $("selector") (busca dentro del escenario).' }),
    area,
    boton,
    salida,
  );
}

function seccionDepurar(nombres) {
  return el(
    "div",
    { className: "panel depurar" },
    el("h2", { textContent: "🐞 Depurar en el navegador" }),
    el(
      "ol",
      {},
      el("li", { textContent: "F12 → Consola: están tus funciones con su nombre, y también escenario y $(\"selector\"). Prueba, por ejemplo: " }, el("code", { textContent: nombres.join(", ") })),
      el("li", { textContent: "F12 → Elements (Elementos): mira cómo cambia el HTML del escenario cuando tus funciones lo tocan (se ilumina lo que cambia)." }),
      el("li", { textContent: "Si algo sale 💥, en la consola está el error: pincha en el enlace azul (src/bloque…:línea) y te lleva a la línea que falla." }),
      el("li", { textContent: "Para ver tu código paso a paso: F12 → Sources (Fuentes) → src/bloque… → pincha en el número de línea (punto de parada) y vuelve a pulsar en el escenario. O escribe debugger; dentro de tu función." }),
      el("li", { textContent: "Con el código parado: pasa el ratón por las variables (e, e.target, e.currentTarget…) y avanza con F10 (siguiente) y F11 (entrar en la función)." }),
    ),
  );
}

// ── Arrancar ──
document.querySelector("#bloques").append(
  ...BLOQUES.map((b) => el("a", { href: `?bloque=${b.n}`, className: b.n === bloque.n ? "activo" : "", textContent: `${b.n} · ${b.titulo}` })),
);

let exportado;
try {
  exportado = await cargarBloque(bloque);
} catch (error) {
  console.error(error);
  app.append(
    el("div", { className: "panel mal" }, el("h2", { textContent: "💥 Tu código no se puede cargar" }), el("pre", { textContent: `${error.name}: ${error.message}` }), el("p", { textContent: "Suele ser un error de sintaxis (una llave o un paréntesis de más o de menos). Vite también lo enseña en la terminal. Arréglalo y guarda: la página se recarga sola." })),
  );
}

if (exportado) {
  delete exportado.predicciones;
  const [caja, seccion] = seccionEscenario();
  // Un taller de ejemplo, nuevo cada vez: Ana y Sergio pendientes, Luis urgente en el taller (con Paco, que ya está
  // lleno), Marta lista y un cliente con malas intenciones (su nombre trae HTML: con textContent se ve como texto).
  function nuevoTaller() {
    const t = new modelo.Taller();
    t.contratar("Lucía", 2);
    t.contratar("Paco", 1);
    t.nuevaReparacion({ cliente: "Ana", bici: "Orbea Alma", horas: 2 });
    const luis = t.nuevaReparacion({ cliente: "Luis", bici: "BH Ultimate", horas: 1.5, urgente: true });
    const marta = t.nuevaReparacion({ cliente: "Marta", bici: "Trek Marlin", horas: 3 });
    t.nuevaReparacion({ cliente: "Sergio", bici: "Canyon Grail", horas: 0.5 });
    t.nuevaReparacion({ cliente: '<img src="x" onerror="alert(\'XSS\')">', bici: "Bici misteriosa", horas: 1 });
    t.asignar(luis.id, "Paco");
    t.asignar(marta.id, "Lucía");
    t.terminar(marta.id);
    return t;
  }
  Object.assign(window, exportado, { escenario: caja, $: (selector) => caja.querySelector(selector), anota, nuevoTaller, ...modelo });
  const nombres = Object.keys(exportado);
  console.info(`Bloque ${bloque.n}: tienes en la consola ${nombres.join(", ")}, escenario, $, nuevoTaller() y las clases del modelo (Taller, Reparacion…)`);
  app.append(el("h2", { className: "titulo-bloque", textContent: `Bloque ${bloque.n} · ${bloque.titulo}` }), seccion);
  const conexiones = conectar();
  const anotadoAlMontar = registro.children.length;
  const predicciones = await cargarPredicciones(bloque.n);
  app.append(
    conexiones,
    el(
      "div",
      { className: "panel" },
      el("h2", { textContent: "▶ Tus funciones, en marcha" }),
      el("p", { textContent: "La página ejecuta estos ejemplos con TU código cada vez que guardas (algunos cambian el escenario de arriba). 👀 = ejemplo resuelto. docker compose run --rm web npm run comprobar prueba muchos casos más." }),
      el("ul", { className: "ejemplos" }, ...bloque.ejemplos.map(filaEjemplo)),
    ),
    seccionPredicciones(predicciones),
    seccionProbar(),
    seccionDepurar(nombres),
  );
  // Lo que hayan anotado los ejemplos no cuenta: en el registro solo queda el montaje y lo que hagas tú
  while (registro.children.length > anotadoAlMontar) registro.firstElementChild.remove();
}
