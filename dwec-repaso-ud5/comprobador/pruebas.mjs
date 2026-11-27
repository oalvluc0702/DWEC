// pruebas.mjs — Las pruebas del repaso de la UD5. Puedes leerlas: dicen QUÉ se espera, no CÓMO hacerlo.
// Cada prueba monta una página de verdad con happy-dom (un navegador sin ventana), pulsa, escribe y envía.
import { GlobalRegistrator } from "@happy-dom/global-registrator";
import { inspect } from "node:util";

if (!globalThis.document) GlobalRegistrator.register({ url: "http://localhost/" });

// ───────────────────────── utilidades ─────────────────────────
const muestra = (v) => inspect(v, { depth: 4, breakLength: Infinity, compact: true });
function igual(a, b) {
  if (Object.is(a, b)) return true;
  if (typeof a !== "object" || typeof b !== "object" || a === null || b === null) return false;
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  const ka = Object.keys(a);
  const kb = Object.keys(b);
  return ka.length === kb.length && ka.every((k) => igual(a[k], b[k]));
}
function pagina(html) {
  document.body.innerHTML = html;
  return document.body;
}
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => [...document.querySelectorAll(sel)];
const clic = (el) => el.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
const tecla = (el, key, extra = {}) => {
  const e = new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true, ...extra });
  el.dispatchEvent(e);
  return e;
};
const enviar = (form) => {
  const e = new Event("submit", { bubbles: true, cancelable: true });
  form.dispatchEvent(e);
  return e;
};

function predicciones(datos) {
  return ({ pred }) => {
    const p = pred.predicciones ?? {};
    const claves = Object.keys(datos);
    const sinContestar = claves.filter((k) => p[k] === undefined);
    if (sinContestar.length === claves.length) return "pendiente";
    if (sinContestar.length > 0) return `Te faltan: ${sinContestar.join(", ")}`;
    const falladas = claves.filter((k) => !igual(p[k], datos[k][1]));
    const info = claves.map((k) => {
      const [expresion, valor, porque, pista] = datos[k];
      return falladas.includes(k)
        ? `✘ ${k} · ${expresion}  → no es ${muestra(p[k])}. Pista: ${pista}`
        : `✔ ${k} · ${expresion}  → ${muestra(valor)}: ${porque}`;
    });
    if (falladas.length > 0) return { mal: `${claves.length - falladas.length}/${claves.length} bien. Revisa: ${falladas.join(", ")} → pruébalas con «Probar» en la página del kit o en la consola (F12)`, info };
    return { bien: true, info };
  };
}

// La página del bloque 1 (y la lista «ya pintada» del bloque 4), con los saltos de línea de un HTML de verdad
const LISTA = `<section id="taller">
<ul id="reparaciones">
  <li class="reparacion estado-pendiente" data-id="1" data-estado="pendiente" data-horas="2"><h3 class="cliente">Ana</h3><p class="bici">Orbea Alma</p><button type="button" data-accion="empezar"><span class="icono">🔧</span> Empezar</button></li>
  <li class="reparacion urgente estado-en-taller" data-id="2" data-estado="en-taller" data-horas="1.5"><h3 class="cliente">Luis</h3><p class="bici">BH Ultimate</p><button type="button" data-accion="terminar"><span class="icono">✅</span> Terminar</button></li>
  <li class="reparacion estado-lista" data-id="3" data-estado="lista" data-horas="3"><h3 class="cliente">Marta</h3><p class="bici">Trek Marlin</p></li>
  <li class="reparacion urgente estado-pendiente" data-id="4" data-estado="pendiente" data-horas="0.5"><h3 class="cliente">Sergio</h3><p class="bici">Canyon Grail</p><button type="button" data-accion="empezar"><span class="icono">🔧</span> Empezar</button></li>
  <li class="reparacion estado-en-taller" data-id="5" data-estado="en-taller" data-horas="4"><h3 class="cliente">Eva</h3><p class="bici">Giant Talon</p><button type="button" data-accion="terminar"><span class="icono">✅</span> Terminar</button></li>
</ul>
<p id="aviso" hidden></p>
</section>
<aside id="lateral"><p>Horario: de 9 a 14</p></aside>`;
const tarjeta = (id) => $(`.reparacion[data-id="${id}"]`);

// Un taller con Lucía (2 trabajos) y Paco (1): Ana pendiente, Luis urgente en el taller (con Paco),
// Marta lista y Sergio pendiente.
function nuevoTaller(M) {
  const t = new M.Taller();
  t.contratar("Lucía", 2);
  t.contratar("Paco", 1);
  const ana = t.nuevaReparacion({ cliente: "Ana", bici: "Orbea Alma", horas: 2 });
  const luis = t.nuevaReparacion({ cliente: "Luis", bici: "BH Ultimate", horas: 1.5, urgente: true });
  const marta = t.nuevaReparacion({ cliente: "Marta", bici: "Trek Marlin", horas: 3 });
  const sergio = t.nuevaReparacion({ cliente: "Sergio", bici: "Canyon Grail", horas: 0.5 });
  t.asignar(luis.id, "Paco");
  t.asignar(marta.id, "Lucía");
  t.terminar(marta.id);
  return { t, ana, luis, marta, sergio };
}

// Las tarjetas del taller escritas por nosotros (para que el bloque 4 no dependa de tu bloque 2)
function tarjetasDe(t) {
  return t
    .reparaciones()
    .map((r) => {
      const boton = { pendiente: ["empezar", "🔧 ", "Empezar"], "en-taller": ["terminar", "✅ ", "Terminar"] }[r.estado];
      const html = boton ? `<button type="button" data-accion="${boton[0]}"><span class="icono">${boton[1]}</span>${boton[2]}</button>` : "";
      return `<li class="reparacion" data-id="${r.id}" data-estado="${r.estado}"><h3 class="cliente">${r.cliente}</h3>${html}</li>`;
    })
    .join("\n");
}

const FORM_ALTA = `<form id="alta" novalidate>
  <label>Cliente <input name="cliente"></label><p class="error" data-error-de="cliente"></p>
  <label>Bici <input name="bici"></label><p class="error" data-error-de="bici"></p>
  <label>Horas <input name="horas" type="number" step="0.5"></label><p class="error" data-error-de="horas"></p>
  <label><input type="checkbox" name="urgente"> Urgente</label>
  <button>Dar de alta</button>
</form>`;

// ───────────────────────── bloques ─────────────────────────
export const BLOQUES = [
  {
    id: "1",
    titulo: "Bloque 1 · Seleccionar, leer y modificar",
    modulos: { m: "src/bloque1/leer.js", pred: "src/bloque1/predicciones.js" },
    pruebas: [
      {
        id: "1.p",
        texto: "🔮 Predicciones",
        fn: predicciones({
          p1: ['li.dataset.horas = 2; typeof li.dataset.horas', "string", "dataset guarda y devuelve SIEMPRE textos: para sumar, Number()", "¿se guarda como número?"],
          p2: ['li.dataset.fechaEntrada = "hoy"; li.getAttribute("data-fecha-entrada")', "hoy", "fechaEntrada en dataset es data-fecha-entrada en el HTML: las mayúsculas pasan a guiones", "¿cómo se escribe en el HTML un nombre camelCase de dataset?"],
          p3: ["querySelectorAll('.a') y después se añade otro .a · fija.length", 2, "querySelectorAll da una foto FIJA (NodeList estática): no ve lo que se añade después", "¿querySelectorAll se actualiza solo?"],
          p4: ['b.closest("button") === b', true, "closest empieza por el PROPIO elemento: si ya cumple el selector, se devuelve a sí mismo", "¿closest mira solo hacia arriba o también al elemento?"],
          p5: ['classList.add("a", "b"); classList.toggle("a"); p.className', "b", "toggle quita la clase si está (y la pone si no está)", "¿qué hace toggle si la clase ya está?"],
        }),
      },
      {
        id: "1.E",
        texto: "👀 Ejemplo: clientes(raiz, estado)",
        fn: ({ m }) => (pagina(LISTA), igual(m.clientes(document, "pendiente"), ["Ana", "Sergio"]) || `clientes(document, "pendiente") da ${muestra(m.clientes(document, "pendiente"))}`),
      },
      {
        id: "1.e1",
        texto: "🪜 contarUrgentes",
        fn: ({ m }) => {
          pagina(LISTA);
          const n = m.contarUrgentes(document);
          if (n !== 2) return `con la página de ejemplo debería dar 2 y da ${muestra(n)}`;
          pagina("<p>sin reparaciones</p>");
          return m.contarUrgentes(document) === 0 || "en una página sin reparaciones debería dar 0";
        },
      },
      {
        id: "1.e2",
        texto: "🪜 idDe: el id de la tarjeta desde cualquier elemento de dentro",
        fn: ({ m }) => {
          pagina(LISTA);
          const r = m.idDe(tarjeta(4).querySelector("button span"));
          if (r === "4") return "da el TEXTO «4»: dataset siempre devuelve texto. Conviértelo con Number()";
          if (r !== 4) return `idDe(el span del botón de Sergio) debería dar 4 y da ${muestra(r)} (¿subes con closest hasta la tarjeta?)`;
          if (m.idDe(tarjeta(2).querySelector("h3")) !== 2) return "idDe(el h3 de Luis) debería dar 2";
          if (m.idDe(tarjeta(3)) !== 3) return "idDe(la propia tarjeta de Marta) debería dar 3 (closest empieza por el propio elemento)";
          return m.idDe($("#lateral p")) === null || "un elemento que no está en ninguna tarjeta debería dar null";
        },
      },
      {
        id: "1.1",
        texto: "✍️ horasPendientes: sumar data-horas",
        fn: ({ m }) => {
          pagina(LISTA);
          const r = m.horasPendientes(document);
          if (typeof r === "string") return `da el texto ${muestra(r)}: estás sumando TEXTOS (dataset da string y "2" + "0.5" pega). Number()`;
          if (r !== 2.5) return `debería dar 2.5 (Ana 2 + Sergio 0.5) y da ${muestra(r)}`;
          pagina("<ul id='reparaciones'></ul>");
          return m.horasPendientes(document) === 0 || "sin reparaciones debería dar 0";
        },
      },
      {
        id: "1.2",
        texto: "✍️ marcarEstado: data-estado y clases sin borrar las demás",
        fn: ({ m }) => {
          pagina(LISTA);
          const t = tarjeta(2);
          const antes = m.marcarEstado(t, "lista");
          if (antes !== "en-taller") return `debería devolver el estado que tenía («en-taller») y devuelve ${muestra(antes)}`;
          if (t.dataset.estado !== "lista") return "data-estado no ha cambiado a «lista»";
          if (!t.classList.contains("urgente") || !t.classList.contains("reparacion")) return `has borrado otras clases (quedan: «${t.className}»): ¿className = …? Con classList se toca solo una`;
          if (!t.classList.contains("estado-lista") || t.classList.contains("estado-en-taller")) return `las clases quedan «${t.className}»: debe estar estado-lista y no estado-en-taller`;
          if (t.classList.length !== 3) return `sobran clases: «${t.className}»`;
          const otra = m.marcarEstado(t, "pendiente");
          return (otra === "lista" && t.className.split(" ").sort().join(" ") === "estado-pendiente reparacion urgente") || `al volver a «pendiente» queda «${t.className}» y devuelve ${muestra(otra)}`;
        },
      },
      {
        id: "1.3",
        opcional: true,
        texto: "➕ siguienteIgual: recorrer los hermanos",
        fn: ({ m }) => {
          pagina(LISTA);
          const casos = [[1, 4], [2, 5], [4, null], [5, null], [3, null]];
          for (const [desde, espera] of casos) {
            const r = m.siguienteIgual(tarjeta(desde));
            if (r !== espera) {
              const pista = desde === 1 && r === null ? " ¿usas nextSibling? Da también los nodos de texto (los saltos de línea): nextElementSibling" : "";
              return `siguienteIgual(tarjeta ${desde}) debería dar ${muestra(espera)} y da ${muestra(r)}.${pista}`;
            }
          }
          return true;
        },
      },
    ],
  },
  {
    id: "2",
    titulo: "Bloque 2 · Crear nodos sin XSS y pintar desde el modelo",
    modulos: { m: "src/bloque2/pintar.js", pred: "src/bloque2/predicciones.js", M: "src/modelo/taller.js" },
    pruebas: [
      {
        id: "2.p",
        texto: "🔮 Predicciones",
        fn: predicciones({
          p1: ['p.innerHTML = "<b>Ana</b>"; p.textContent = p.innerHTML; p.querySelector("b")', null, "textContent sustituye TODO lo de dentro por texto: el <b> desaparece y se ve «<b>Ana</b>» como letras", "¿textContent crea etiquetas?"],
          p2: ["ul.append(fragmento con 2 li) · [ul.children.length, f.childNodes.length]", [2, 0], "al insertar un fragmento se insertan sus hijos, y el fragmento se queda VACÍO", "¿el fragmento se copia o se vacía?"],
          p3: ['div.innerHTML += "" y luego clic en el botón · n', 0, "innerHTML += vuelve a crear TODOS los nodos: el botón es otro, sin el listener", "¿el botón de después es el mismo objeto?"],
          p4: ["li.innerHTML = \"<img src=x onerror=…>\"; li.children.length", 1, "con innerHTML el navegador crea el <img> de verdad, y su onerror se ejecuta: eso es XSS", "¿innerHTML crea etiquetas?"],
        }),
      },
      {
        id: "2.E",
        texto: "👀 Ejemplo: crearBoton",
        fn: ({ m }) => {
          const html = m.crearBoton("empezar", "🔧", "Empezar").outerHTML;
          return html === '<button type="button" data-accion="empezar"><span class="icono">🔧</span> Empezar</button>' || `crearBoton da ${html}`;
        },
      },
      {
        id: "2.e1",
        texto: "🪜 crearDato",
        fn: ({ m }) => {
          const p = m.crearDato("bici", "<b>Orbea</b>");
          if (p?.tagName !== "P" || p.className !== "bici") return "debería ser un <p class=\"bici\">";
          if (p.querySelector("b")) return "se ha creado un <b> con el texto: textContent, no innerHTML";
          return p.textContent === "<b>Orbea</b>" || `el texto debería verse tal cual y es ${muestra(p.textContent)}`;
        },
      },
      {
        id: "2.1",
        texto: "✍️ crearTarjeta: clases, data-*, datos y el botón según el estado",
        fn: ({ m, M }) => {
          const { luis, ana, marta } = nuevoTaller(M);
          const t = m.crearTarjeta(luis);
          if (t?.tagName !== "LI") return "la tarjeta tiene que ser un <li>";
          const clases = [...t.classList].sort().join(" ");
          if (clases !== "estado-en-taller reparacion urgente") return `las clases de Luis (urgente, en el taller) son «${clases}» y deberían ser reparacion, urgente y estado-en-taller`;
          if (t.dataset.id !== String(luis.id) || t.dataset.estado !== "en-taller") return "faltan data-id o data-estado (o no tienen el valor de la reparación)";
          const texto = (sel) => t.querySelector(sel)?.textContent;
          const datos = [texto("h3.cliente"), texto("p.bici"), texto("p.tipo"), texto("p.total"), texto("p.estado")];
          if (!igual(datos, ["Luis", "BH Ultimate", "urgente", "48.75 €", "en-taller"])) return `h3.cliente, p.bici, p.tipo, p.total y p.estado dan ${muestra(datos)} (el total con toFixed(2) y « €»)`;
          const botones = t.querySelectorAll("button");
          if (botones.length !== 1 || botones[0].dataset.accion !== "terminar" || botones[0].textContent !== "✅ Terminar" || !botones[0].querySelector("span.icono")) return "en el taller: un solo botón, el de crearBoton(\"terminar\", \"✅\", \"Terminar\")";
          const a = m.crearTarjeta(ana);
          if (a.classList.contains("urgente") || a.querySelector("p.total")?.textContent !== "50.00 €") return "Ana (normal): sin la clase urgente y total «50.00 €»";
          if (a.querySelector("button")?.dataset.accion !== "empezar") return "una pendiente lleva el botón de empezar";
          return m.crearTarjeta(marta).querySelector("button") === null || "una reparación «lista» no lleva ningún botón";
        },
      },
      {
        id: "2.2",
        texto: "✍️ crearTarjeta no permite XSS",
        fn: ({ m, M }) => {
          const malo = '<img src="x" onerror="globalThis.hackeado = true">';
          const r = new M.Reparacion(malo, "<b>BMX</b>", 1);
          const t = m.crearTarjeta(r);
          if (t.querySelector("img, b")) return "XSS: se ha creado una etiqueta con el cliente o la bici. Has usado innerHTML con datos que escribe la gente: textContent";
          return t.querySelector("h3")?.textContent === malo || "el cliente tiene que verse tal cual, como texto";
        },
      },
      {
        id: "2.3",
        texto: "✍️ pintarLista: orden, sin acumular, sin tocar el array y el «vacío»",
        fn: ({ m, M }) => {
          pagina('<ul id="reparaciones"></ul>');
          const lista = $("#reparaciones");
          const reps = [
            new M.Reparacion("A", "x", 1, { id: 101, entrada: "2026-11-20" }),
            new M.ReparacionUrgente("B", "x", 1, { id: 102, entrada: "2026-11-22" }),
            new M.Reparacion("C", "x", 1, { id: 103, entrada: "2026-11-18" }),
            new M.ReparacionUrgente("D", "x", 1, { id: 104, entrada: "2026-11-19" }),
          ];
          m.pintarLista(lista, reps);
          if (reps.map((r) => r.cliente).join("") !== "ABCD") return "has cambiado el array que te pasan: sort() ordena EN EL SITIO. Ordena una copia ([...reparaciones])";
          m.pintarLista(lista, reps);
          if (lista.children.length !== 4) return `tras pintar dos veces hay ${lista.children.length} elementos: ¿vacías la lista antes de pintar?`;
          const orden = [...lista.querySelectorAll(".cliente")].map((h) => h.textContent).join("");
          if (orden !== "DBCA") return `el orden es ${orden} y debería ser DBCA (urgentes primero; dentro, la entrada más antigua primero)`;
          m.pintarLista(lista, []);
          if (lista.children.length !== 1 || lista.firstElementChild.className !== "vacio" || lista.firstElementChild.textContent !== "No hay reparaciones") return 'con [] la lista debe tener solo <li class="vacio">No hay reparaciones</li>';
          m.pintarLista(lista, reps.slice(0, 1));
          return (lista.children.length === 1 && !lista.querySelector(".vacio")) || "al volver a pintar con reparaciones, el «vacío» tiene que desaparecer";
        },
      },
    ],
  },
  {
    id: "3",
    titulo: "Bloque 3 · Listeners y el objeto evento",
    modulos: { m: "src/bloque3/listeners.js", pred: "src/bloque3/predicciones.js" },
    pruebas: [
      {
        id: "3.p",
        texto: "🔮 Predicciones",
        fn: predicciones({
          p1: ["dos addEventListener con () => n++ · clic · n", 2, "cada flecha es una función NUEVA: se registran las dos y se suman", "¿son la misma función las dos flechas?"],
          p2: ["addEventListener(() => n++) y removeEventListener(() => n++) · clic · n", 1, "removeEventListener necesita LA MISMA función; una flecha nueva es otra y no quita nada", "¿qué función quita removeEventListener?"],
          p3: ["addEventListener(..., { once: true }) · dos clics · n", 1, "once: true quita el listener después de la primera vez", "repasa el apartado 10.4"],
          p4: ["listener con function () { quien = this.id } · quien", "b", "en un listener escrito con function, this es el elemento que escucha (currentTarget)", "¿quién es this en una function usada de listener?"],
          p5: ["class Caja con function () { quien = this.nombre } dentro · quien", "botón", "con function, this es el BOTÓN (que tiene nombre «botón»), no la Caja: se pierde el this de la clase. Por eso se usa una flecha", "¿this es la Caja o el botón?"],
          p6: ["clic en el span de dentro del botón · [e.target.tagName, e.currentTarget.tagName]", ["SPAN", "BUTTON"], "target es lo que se pulsó de verdad (el span); currentTarget, el que tiene el listener (el botón)", "¿cuál es lo pulsado y cuál el que escucha?"],
        }),
      },
      {
        id: "3.E",
        texto: "👀 Ejemplo: vigilar (y desconectar)",
        fn: ({ m }) => {
          pagina('<button data-accion="empezar"><span>🔧</span> Empezar</button><output></output>');
          const quitar = m.vigilar($("button"), $("output"));
          clic($("span"));
          if ($("output").textContent !== "click en empezar") return `tras pulsar dice ${muestra($("output").textContent)}`;
          $("output").textContent = "";
          quitar();
          clic($("button"));
          return $("output").textContent === "" || "tras desconectar sigue escribiendo";
        },
      },
      {
        id: "3.e1",
        texto: "🪜 soloUnaVez",
        fn: ({ m }) => {
          pagina('<button data-id="7">Avisar</button>');
          const llamadas = [];
          m.soloUnaVez($("button"), (id) => llamadas.push(id));
          clic($("button"));
          clic($("button"));
          clic($("button"));
          if (igual(llamadas, ["7"])) return "llega el texto «7»: dataset da texto, conviértelo con Number()";
          if (llamadas.length > 1) return `con tres clics se ha llamado ${llamadas.length} veces: ¿{ once: true }?`;
          return igual(llamadas, [7]) || `llamadas: ${muestra(llamadas)} (debería ser [7])`;
        },
      },
      {
        id: "3.e2",
        texto: "🪜 flechasHoras (e.key y preventDefault)",
        fn: ({ m }) => {
          pagina('<input type="number" step="0.5" value="2">');
          const campo = $("input");
          m.flechasHoras(campo);
          const e = tecla(campo, "ArrowUp");
          if (campo.value !== "2.5") return `de 2, con ArrowUp, debería quedar "2.5" y queda ${muestra(campo.value)} (¿sumas un número a un texto? Number())`;
          if (!e.defaultPrevented) return "con las flechas falta e.preventDefault() (el navegador sumaría otra vez por su cuenta)";
          for (let i = 0; i < 6; i++) tecla(campo, "ArrowDown");
          if (campo.value !== "0.5") return `bajando muchas veces queda ${muestra(campo.value)}: nunca por debajo de "0.5"`;
          const otra = tecla(campo, "a");
          return (campo.value === "0.5" && !otra.defaultPrevented) || "con otra tecla no tiene que hacer nada (ni preventDefault)";
        },
      },
      {
        id: "3.1",
        texto: "✍️ MarcadorHoras: suma con cada clic (this en el listener)",
        fn: ({ m }) => {
          pagina('<button id="a" data-paso="0.5">+½ h</button><output id="sa"></output><button id="b" data-paso="2">+2 h</button><output id="sb"></output>');
          const a = new m.MarcadorHoras($("#a"), $("#sa"));
          clic($("#a"));
          clic($("#a"));
          clic($("#a"));
          if (a.horas === 0) return "al pulsar no suma: dentro del listener, ¿this es el marcador? Con function, o pasando this.sumar sin más, this es el BOTÓN. Usa una flecha";
          if (a.horas === "00.50.50.5" || typeof a.horas === "string") return "las horas son texto: data-paso hay que pasarlo a número";
          if (a.horas !== 1.5 || $("#sa").textContent !== "1.5 h") return `tras 3 clics de 0.5: horas ${muestra(a.horas)} y la salida ${muestra($("#sa").textContent)} (se esperaba 1.5 y «1.5 h»)`;
          const b = new m.MarcadorHoras($("#b"), $("#sb"));
          clic($("#b"));
          if (b.horas !== 2 || a.horas !== 1.5) return "dos marcadores tienen que ir cada uno por su lado (las horas, privadas de cada uno)";
          a.sumar(1);
          return (a.horas === 2.5 && $("#sa").textContent === "2.5 h") || "sumar(1) llamado directamente no suma o no escribe";
        },
      },
      {
        id: "3.2",
        texto: "✍️ MarcadorHoras: desconectar (removeEventListener)",
        fn: ({ m }) => {
          pagina('<button data-paso="1">+1 h</button><output></output>');
          const a = new m.MarcadorHoras($("button"), $("output"));
          clic($("button"));
          if (a.horas !== 1) return "antes de desconectar, cada clic tiene que sumar (mira el 3.1)";
          a.desconectar();
          clic($("button"));
          clic($("button"));
          return a.horas === 1 || `después de desconectar sigue sumando (lleva ${a.horas}): removeEventListener necesita LA MISMA función que diste a addEventListener; una flecha nueva es otra. Guárdala`;
        },
      },
      {
        id: "3.3",
        opcional: true,
        texto: "➕ atajos: «n» y Escape, e.target, Ctrl y quitar",
        fn: ({ m }) => {
          pagina('<main><input name="cliente"><textarea></textarea><button type="button">x</button></main>');
          let nueva = 0;
          let cerrar = 0;
          const quitar = m.atajos($("main"), { nueva: () => nueva++, cerrar: () => cerrar++ });
          tecla($("button"), "n");
          if (nueva !== 1) return "«n» pulsada fuera de un campo tiene que llamar a nueva()";
          tecla($("input"), "n");
          tecla($("textarea"), "n");
          if (nueva !== 1) return "con el foco en un input o un textarea, «n» es una letra que se escribe: no llames a nueva() (mira e.target.tagName)";
          tecla($("button"), "n", { ctrlKey: true });
          if (nueva !== 1) return "Ctrl+N es del navegador: con e.ctrlKey no hagas nada";
          tecla($("input"), "Escape");
          if (cerrar !== 1) return "Escape tiene que llamar a cerrar() aunque el foco esté en un campo";
          if (typeof quitar !== "function") return "atajos tiene que devolver una función para quitarlos";
          quitar();
          tecla($("button"), "n");
          tecla($("button"), "Escape");
          return (nueva === 1 && cerrar === 1) || "tras quitar() los atajos siguen funcionando: removeEventListener con LA MISMA función";
        },
      },
    ],
  },
  {
    id: "4",
    titulo: "Bloque 4 · Propagación y delegación",
    modulos: { m: "src/bloque4/delegacion.js", pred: "src/bloque4/predicciones.js", M: "src/modelo/taller.js" },
    pruebas: [
      {
        id: "4.p",
        texto: "🔮 Predicciones",
        fn: predicciones({
          p1: ["listeners en ul, button y li (en ese orden) · clic en el botón · orden", "button,li,ul", "el clic SUBE (burbuja) desde el botón: da igual en qué orden se añadieron los listeners", "¿manda el orden de addEventListener o el del árbol?"],
          p2: ["igual, pero el del ul con { capture: true }", "ul,button,li", "con capture el listener escucha al BAJAR: el ul se entera antes que el botón", "repasa el apartado 10.1 (captura, objetivo y burbuja)"],
          p3: ["el li hace e.preventDefault() · ¿llega el clic al ul?", true, "preventDefault cancela lo que haría el navegador, pero el evento SIGUE subiendo", "¿preventDefault para la burbuja?"],
          p4: ["el enlace hace e.stopPropagation() · ev.defaultPrevented", false, "stopPropagation para el viaje, pero NO cancela la acción del navegador: el enlace navegaría", "¿stopPropagation cancela lo que hace el navegador?"],
          p5: ["delegación con e.target.dataset.accion, pulsando el span del botón", "nada", "e.target es el span, que no tiene data-accion: por eso se usa e.target.closest('[data-accion]')", "¿quién es e.target si pulsas el span?"],
        }),
      },
      {
        id: "4.E",
        texto: "👀 Ejemplo: elegirAlPulsar",
        fn: ({ m }) => {
          pagina(LISTA);
          m.elegirAlPulsar($("#reparaciones"));
          clic(tarjeta(1).querySelector("span"));
          if (!tarjeta(1).classList.contains("elegida")) return "al pulsar el span del botón de Ana, su tarjeta no se marca";
          clic(tarjeta(1).querySelector("h3"));
          if (tarjeta(1).classList.contains("elegida")) return "al pulsar otra vez (el h3) no se desmarca";
          clic($("#reparaciones"));
          return $$(".elegida").length === 0 || "pulsando fuera de las tarjetas no tiene que marcarse nada";
        },
      },
      {
        id: "4.e1",
        texto: "🪜 enlacesInternos: preventDefault sin cortar la burbuja",
        fn: ({ m }) => {
          pagina('<main><p><a data-interno href="#ficha"><span>Ver ficha</span></a> · <a href="#fuera">Otra</a></p></main>');
          let subeHastaBody = 0;
          let cancelado = null;
          document.body.addEventListener("click", (e) => {
            subeHastaBody++;
            cancelado = e.defaultPrevented;
            e.preventDefault(); // (para que la prueba no navegue)
          });
          m.enlacesInternos($("main"));
          clic($("a[data-interno] span"));
          if (subeHastaBody === 0) return "el clic no llega al body: ¡stopPropagation corta la burbuja! Aquí solo hace falta preventDefault";
          if (!cancelado) return "el enlace interno sigue navegando (también si se pulsa el span de dentro): falta preventDefault, y closest para encontrar el enlace";
          clic($("a:not([data-interno])"));
          return cancelado === false || "un enlace sin data-interno no se toca";
        },
      },
      {
        id: "4.1",
        texto: "✍️ conectarAcciones: UN listener, closest y Number",
        fn: ({ m, M }) => {
          const { t, ana, luis } = nuevoTaller(M);
          pagina(`<ul id="reparaciones">${tarjetasDe(t)}</ul>`);
          const lista = $("#reparaciones");
          let listeners = 0;
          const original = lista.addEventListener.bind(lista);
          lista.addEventListener = (...a) => (listeners++, original(...a));
          for (const b of $$("button")) b.addEventListener = () => { throw new Error("listener en un botón"); };
          let cambios = 0;
          let enDocumento = 0;
          const contar = () => enDocumento++;
          document.addEventListener("click", contar);
          try {
            m.conectarAcciones(lista, t, { mecanico: "Lucía", alCambiar: () => cambios++, alError: () => {} });
          } catch (e) {
            document.removeEventListener("click", contar);
            if (e.message === "listener en un botón") return "pones un listener en cada botón: pon UNO solo en la lista (delegación)";
            throw e;
          }
          if (listeners !== 1) return `has puesto ${listeners} listeners en la lista: con uno basta`;
          clic(tarjeta(ana.id).querySelector("span"));
          const llegaArriba = enDocumento;
          if (ana.estado !== "en-taller") {
            clic(tarjeta(ana.id).querySelector("button"));
            document.removeEventListener("click", contar);
            if (ana.estado === "en-taller") return "pulsando el BOTÓN funciona, pero pulsando su <span> no: delegación sin closest (e.target es el span). e.target.closest(\"[data-accion]\")";
            return `al pulsar «Empezar» de Ana sigue «${ana.estado}» (¿taller.asignar(id, mecanico) con el id como NÚMERO?)`;
          }
          document.removeEventListener("click", contar);
          if (llegaArriba === 0) return "el clic no llega a document: ¡stopPropagation rompe a los de arriba! No hace falta";
          if (cambios !== 1) return `alCambiar se ha llamado ${cambios} veces y debería ser 1`;
          clic(tarjeta(luis.id).querySelector("h3"));
          clic(lista);
          if (cambios !== 1) return "pulsando fuera de los botones (el h3, la lista) no tiene que pasar nada";
          clic(tarjeta(luis.id).querySelector("button"));
          return (luis.estado === "lista" && cambios === 2) || "«Terminar» de Luis no lo termina (taller.terminar(id)) o no llama a alCambiar";
        },
      },
      {
        id: "4.2",
        texto: "✍️ conectarAcciones: tarjetas pintadas DESPUÉS",
        fn: ({ m, M }) => {
          const { t } = nuevoTaller(M);
          pagina(`<ul id="reparaciones">${tarjetasDe(t)}</ul>`);
          m.conectarAcciones($("#reparaciones"), t, { mecanico: "Lucía", alCambiar: () => {}, alError: () => {} });
          const nueva = t.nuevaReparacion({ cliente: "Nuevo", bici: "BMX", horas: 1 });
          $("#reparaciones").innerHTML = tarjetasDe(t); // se repinta todo: los botones son otros
          clic(tarjeta(nueva.id).querySelector("span"));
          return nueva.estado === "en-taller" || "tras repintar, el botón de una tarjeta nueva no funciona: el listener tiene que estar en la lista (que no se repinta), no en los botones";
        },
      },
      {
        id: "4.3",
        texto: "✍️ conectarAcciones: los ErrorTaller van a alError",
        fn: ({ m, M }) => {
          const { t, ana, sergio } = nuevoTaller(M);
          pagina(`<ul id="reparaciones">${tarjetasDe(t)}</ul>`);
          let cambios = 0;
          const errores = [];
          m.conectarAcciones($("#reparaciones"), t, { mecanico: "Paco", alCambiar: () => cambios++, alError: (e) => errores.push(e) });
          clic(tarjeta(ana.id).querySelector("button")); // Paco ya tiene a Luis: está lleno
          if (errores.length !== 1 || !(errores[0] instanceof M.ErrorMecanicoLleno)) return `con Paco lleno, alError debería recibir el ErrorMecanicoLleno; ha recibido ${muestra(errores.map((e) => e?.name ?? e))} (¿try/catch alrededor de la acción?)`;
          if (cambios !== 0) return "si hay error NO se llama a alCambiar";
          if (ana.estado !== "pendiente") return "Ana tendría que seguir pendiente";
          tarjeta(sergio.id).dataset.id = "999"; // una tarjeta de una reparación que no existe
          clic(tarjeta(999).querySelector("button"));
          return (errores.length === 2 && errores[1] instanceof M.ErrorTaller && cambios === 0) || "una reparación que no existe (ErrorTaller) también tiene que ir a alError";
        },
      },
      {
        id: "4.4",
        opcional: true,
        texto: "➕ montarLista: repintar sin duplicar listeners y el #aviso",
        fn: ({ m, M }) => {
          const { t, ana } = nuevoTaller(M);
          pagina('<main><ul id="reparaciones"></ul><p id="aviso" hidden></p></main>');
          let asignaciones = 0;
          const asignar = t.asignar.bind(t);
          t.asignar = (...a) => (asignaciones++, asignar(...a));
          const pintar = m.montarLista($("main"), t, "Lucía");
          if (typeof pintar !== "function") return "montarLista tiene que devolver la función pintar";
          if ($$("#reparaciones .reparacion").length !== 4) return "al montar, la lista debería tener las 4 reparaciones del taller (pintarLista del bloque 2)";
          pintar();
          pintar();
          pintar();
          clic(tarjeta(ana.id).querySelector("button span"));
          if (asignaciones > 1) return `un clic ha llamado ${asignaciones} veces a taller.asignar: hay un listener dentro de pintar() y se suma uno en cada repintado. Ponlo UNA vez, al montar`;
          if (ana.estado !== "en-taller") return "al pulsar «Empezar» de Ana no ha empezado";
          if (tarjeta(ana.id).dataset.estado !== "en-taller") return "la lista no se ha repintado tras la acción";
          if (!$("#aviso").hidden) return "si todo va bien, #aviso tiene que estar oculto";
          const otro = nuevoTaller(M);
          pagina('<main><ul id="reparaciones"></ul><p id="aviso" hidden></p></main>');
          m.montarLista($("main"), otro.t, "Paco");
          clic(tarjeta(otro.ana.id).querySelector("button"));
          if ($("#aviso").hidden || $("#aviso").textContent !== "Paco ya tiene 1 trabajo: no le caben más") return `con Paco lleno, #aviso debería verse con el mensaje del error; está ${$("#aviso").hidden ? "oculto" : "visible"} y dice ${muestra($("#aviso").textContent)}`;
          return tarjeta(otro.ana.id).dataset.estado === "pendiente" || "con el error, la tarjeta de Ana tiene que seguir pendiente";
        },
      },
    ],
  },
  {
    id: "5",
    titulo: "Bloque 5 · Formularios",
    modulos: { m: "src/bloque5/formulario.js", pred: "src/bloque5/predicciones.js", M: "src/modelo/taller.js" },
    pruebas: [
      {
        id: "5.p",
        texto: "🔮 Predicciones",
        fn: predicciones({
          p1: ['<input type="checkbox" name="urgente"> sin marcar · Object.fromEntries(new FormData(f))', {}, "una casilla SIN marcar no aparece en el FormData: se mira con has()", "¿sale la casilla si no está marcada?"],
          p2: ['Number("")', 0, "un campo vacío pasado a número da 0, no NaN: por eso se mira antes si está vacío", "¿NaN o 0?"],
          p3: ['Number("2,5")', NaN, "Number solo entiende el punto decimal: con coma da NaN", "¿entiende Number la coma?"],
          p4: ['value="Ana" en el HTML, se escribe «Luis» y f.reset() · value', "Ana", "reset() vuelve al valor del ATRIBUTO del HTML, no a vacío", "¿reset vacía o vuelve al principio?"],
          p5: ["clic en el <button> de un formulario con listener de submit · n", 1, "un <button> dentro de un form es de envío (type=submit por defecto): pulsarlo lanza submit", "¿qué type tiene un button sin type dentro de un form?"],
        }),
      },
      {
        id: "5.E",
        texto: "👀 Ejemplo: leerAlta",
        fn: ({ m }) => {
          pagina(FORM_ALTA);
          const f = $("form");
          f.elements.cliente.value = "  Ana ";
          f.elements.bici.value = "Orbea Alma";
          f.elements.horas.value = "2";
          f.elements.urgente.checked = true;
          if (!igual(m.leerAlta(f), { cliente: "Ana", bici: "Orbea Alma", horas: 2, urgente: true })) return `leerAlta da ${muestra(m.leerAlta(f))}`;
          f.reset();
          return igual(m.leerAlta(f), { cliente: "", bici: "", horas: null, urgente: false }) || `con el formulario vacío da ${muestra(m.leerAlta(f))}`;
        },
      },
      {
        id: "5.e1",
        texto: "🪜 errorDeHoras",
        fn: ({ m }) => {
          const mal = "Entre 0,5 y 40 horas, de media en media";
          const casos = [[null, "Indica las horas"], [NaN, mal], [0, mal], [0.25, mal], [41, mal], [2.3, mal], [0.5, ""], [2, ""], [7.5, ""], [40, ""]];
          for (const [h, espera] of casos) {
            const r = m.errorDeHoras(h);
            if (r !== espera) return `errorDeHoras(${muestra(h)}) da ${muestra(r)} y debería dar ${muestra(espera)}`;
          }
          return true;
        },
      },
      {
        id: "5.1",
        texto: "✍️ conectarAlta: alta correcta (submit, preventDefault, reset y foco)",
        fn: ({ m, M }) => {
          pagina(FORM_ALTA);
          const f = $("form");
          const t = new M.Taller();
          const avisos = [];
          m.conectarAlta(f, t, (r) => avisos.push(r));
          f.elements.cliente.value = "  Ana ";
          f.elements.bici.value = "Orbea Alma";
          f.elements.horas.value = "2.5";
          f.elements.urgente.checked = true;
          const e = enviar(f);
          if (!e.defaultPrevented) return "falta preventDefault() en el submit: la página se recargaría y se perdería todo";
          const [r] = t.reparaciones();
          if (!r) return "no se ha dado de alta ninguna reparación (taller.nuevaReparacion(datos))";
          if (r.cliente !== "Ana" || r.horas !== 2.5 || r.tipo !== "urgente") return `la reparación es ${muestra({ cliente: r.cliente, horas: r.horas, tipo: r.tipo })}: las horas como número y la casilla de urgente`;
          if (avisos.length !== 1 || avisos[0] !== r) return `alCambiar se ha llamado ${avisos.length} veces (debería ser 1, con la reparación nueva)`;
          if (f.elements.cliente.value !== "" || f.elements.urgente.checked) return "tras el alta, el formulario tiene que quedar vacío (form.reset())";
          return document.activeElement === f.elements.cliente || "tras el alta, el foco tiene que volver al campo del cliente";
        },
      },
      {
        id: "5.2",
        texto: "✍️ conectarAlta: errores junto al campo, aria-invalid, foco y sin perder lo escrito",
        fn: ({ m, M }) => {
          pagina(FORM_ALTA);
          const f = $("form");
          const t = new M.Taller();
          let avisos = 0;
          m.conectarAlta(f, t, () => avisos++);
          f.elements.cliente.value = "Ana";
          f.elements.horas.value = "2.3";
          enviar(f);
          if (t.reparaciones().length || avisos) return "con errores no se da de alta nada ni se llama a alCambiar";
          if (f.elements.cliente.value !== "Ana" || f.elements.horas.value !== "2.3") return "con errores se ha perdido lo escrito: no hagas reset si hay errores";
          const msg = (n) => $(`[data-error-de="${n}"]`).textContent;
          if (msg("bici") !== "Escribe qué bici es" || msg("horas") !== "Entre 0,5 y 40 horas, de media en media" || msg("cliente") !== "") return `los mensajes salen ${muestra([msg("cliente"), msg("bici"), msg("horas")])} (cliente, bici, horas)`;
          const inv = (n) => f.elements[n].getAttribute("aria-invalid");
          if (inv("bici") !== "true" || inv("horas") !== "true" || f.elements.cliente.hasAttribute("aria-invalid")) return 'aria-invalid="true" solo en bici y horas (y el cliente, sin el atributo)';
          if (document.activeElement !== f.elements.bici) return "el foco tiene que ir al PRIMER campo con error (la bici)";
          f.elements.bici.value = "BH";
          f.elements.horas.value = "3";
          enviar(f);
          if (msg("bici") !== "" || f.elements.bici.hasAttribute("aria-invalid")) return "al corregirlo, el mensaje y el aria-invalid tienen que desaparecer";
          return t.reparaciones().length === 1 || "al corregirlo, se tiene que dar de alta";
        },
      },
      {
        id: "5.3",
        opcional: true,
        texto: "➕ editarHoras: el campo, el foco y Enter",
        fn: ({ m }) => {
          pagina('<p>Horas: <span class="horas">2 h</span></p>');
          const celda = $(".horas");
          const guardadas = [];
          m.editarHoras(celda, 2, (h) => guardadas.push(h));
          const campo = celda.querySelector("input");
          if (celda.children.length !== 1 || campo?.name !== "horas" || campo.type !== "number") return 'en la celda tiene que quedar solo un <input name="horas" type="number">';
          if (campo.value !== "2" || document.activeElement !== campo) return "el campo empieza con las horas (2) y con el foco";
          campo.value = "41";
          tecla(campo, "Enter");
          if (guardadas.length) return "con 41 horas no se puede guardar";
          if (!celda.contains(campo) || campo.getAttribute("aria-invalid") !== "true" || campo.value !== "41") return 'con un error, el campo se queda (con lo escrito) y con aria-invalid="true"';
          campo.value = "2.5";
          tecla(campo, "Enter");
          if (!igual(guardadas, [2.5])) return `alGuardar recibe ${muestra(guardadas)} y debería ser [2.5] (un número)`;
          return (celda.textContent === "2.5 h" && !celda.querySelector("input")) || `tras guardar, la celda dice ${muestra(celda.textContent)} (se esperaba «2.5 h», sin el campo)`;
        },
      },
      {
        id: "5.4",
        opcional: true,
        texto: "➕ editarHoras: Escape cancela sin cambiar nada",
        fn: ({ m }) => {
          pagina('<p>Horas: <span class="horas">2 h</span></p>');
          const celda = $(".horas");
          const guardadas = [];
          m.editarHoras(celda, 2, (h) => guardadas.push(h));
          const campo = celda.querySelector("input");
          campo.value = "9";
          tecla(campo, "Escape");
          if (guardadas.length) return "Escape tiene que CANCELAR: has llamado a alGuardar y cambiarías el modelo";
          return celda.textContent === "2 h" || `tras Escape la celda dice ${muestra(celda.textContent)}: tiene que volver al texto de ANTES («2 h»)`;
        },
      },
    ],
  },
  {
    id: "6",
    titulo: "Bloque 6 · Simulacro: «Añadir pieza»",
    puntos: true,
    modulos: { m: "src/bloque6/taller-app.js", M: "src/modelo/taller.js" },
    pruebas: [
      punto("6.1", "El botón «➕ Pieza» solo en pendiente y en el taller, también tras repintar", [
        ({ ana, luis, marta, botonPieza }) => {
          const b = botonPieza(ana);
          if (!b || !botonPieza(luis)) return "falta el botón en Ana (pendiente) o en Luis (en el taller)";
          if (botonPieza(marta)) return "una reparación «lista» no lleva el botón de pieza";
          return (b.type === "button" && b.textContent === "➕ Pieza" && b.querySelector("span.icono")?.textContent === "➕") || `el botón tiene que ser <button type="button" data-accion="pieza"><span class="icono">➕</span> Pieza</button> y es ${b.outerHTML}`;
        },
        ({ sergio, ana, botonPieza, boton }) => {
          clic(boton(sergio, "empezar"));
          return (botonPieza(sergio) && botonPieza(ana)) || "tras repintar (Empezar en Sergio), el botón de pieza ya no sale";
        },
      ]),
      punto("6.2", "Se abre el formulario en ESA tarjeta, vacío, con el foco, sin cambiar nada", [
        ({ ana, abrir, tarjeta: t }) => {
          abrir(ana);
          const f = t(ana).querySelector('form[data-form="pieza"]');
          if (!f) return "al pulsar «Pieza» no aparece <form data-form=\"pieza\"> dentro de la tarjeta de Ana";
          const faltan = ['input[name="nombre"]', 'input[name="precio"][type="number"]', '[data-error-de="nombre"]', '[data-error-de="precio"]', 'button[type="submit"]', 'button[data-accion="cancelar"]', "p.para"].filter((s) => !f.querySelector(s));
          if (faltan.length) return `al formulario le falta: ${faltan.join(" · ")}`;
          return f.querySelector("p.para").textContent === "Pieza para «Orbea Alma» de Ana" || `p.para dice ${muestra(f.querySelector("p.para").textContent)}`;
        },
        ({ ana, abrir }) => {
          abrir(ana);
          const f = $('form[data-form="pieza"]');
          if (!f) return "no se abre el formulario";
          if (f.elements.nombre.value !== "" || f.elements.precio.value !== "") return "los campos tienen que empezar vacíos";
          return document.activeElement === f.elements.nombre || "el foco tiene que ir al campo «nombre»";
        },
        ({ ana, abrir, estado }) => {
          abrir(ana);
          return (estado.cambios === 0 && ana.piezas.length === 0) || "abrir el formulario no puede cambiar el modelo ni llamar a alCambiar";
        },
      ]),
      punto("6.3", "Guardar: anadirPieza, repintado y alCambiar una vez", [
        ({ ana, abrir, tarjeta: t }) => {
          abrir(ana);
          const f = $('form[data-form="pieza"]');
          if (!f) return "no se abre el formulario";
          f.elements.nombre.value = "  Cadena KMC ";
          f.elements.precio.value = "12.5";
          const e = enviar(f);
          if (!e.defaultPrevented) return "falta preventDefault() en el submit: la página se recargaría";
          if (!igual(ana.piezas, [{ nombre: "Cadena KMC", precio: 12.5 }])) return `las piezas de Ana son ${muestra(ana.piezas)} (nombre sin espacios a los lados y el precio como número)`;
          if (t(ana).querySelector(".total")?.textContent !== "62.50 €") return "la tarjeta no se ha repintado: el total debería ser «62.50 €»";
          return !$('form[data-form="pieza"]') || "tras guardar, el formulario tiene que desaparecer";
        },
        ({ ana, abrir, estado }) => {
          abrir(ana);
          const f = $('form[data-form="pieza"]');
          if (!f) return "no se abre el formulario";
          f.elements.nombre.value = "Cámara";
          f.elements.precio.value = "6";
          enviar(f);
          return estado.cambios === 1 || `al guardar, alCambiar se ha llamado ${estado.cambios} veces (debería ser 1)`;
        },
      ]),
      punto("6.4", "Escape y Cancelar no cambian nada; solo un formulario abierto", [
        ({ ana, abrir, estado }) => {
          abrir(ana);
          const f = $('form[data-form="pieza"]');
          if (!f) return "no se abre el formulario";
          f.elements.nombre.value = "Sillín";
          f.elements.precio.value = "20";
          tecla(f.elements.nombre, "Escape");
          if (ana.piezas.length || estado.cambios) return "Escape tiene que CANCELAR: has cambiado el modelo o llamado a alCambiar";
          return !$('form[data-form="pieza"]') || "con Escape el formulario tiene que cerrarse";
        },
        ({ ana, abrir, estado }) => {
          abrir(ana);
          const f = $('form[data-form="pieza"]');
          if (!f) return "no se abre el formulario";
          clic(f.querySelector('[data-accion="cancelar"]'));
          if (estado.cambios || ana.piezas.length) return "«Cancelar» no puede llamar a alCambiar ni cambiar el modelo";
          return !$('form[data-form="pieza"]') || "con «Cancelar» el formulario tiene que cerrarse";
        },
        ({ ana, luis, abrir, tarjeta: t }) => {
          abrir(ana);
          abrir(luis);
          const forms = $$('form[data-form="pieza"]');
          return (forms.length === 1 && t(luis).contains(forms[0])) || `hay ${forms.length} formularios abiertos: abrir otro tiene que cerrar el anterior`;
        },
      ]),
      punto("6.5", "Errores junto al campo sin perder lo escrito, y el ErrorTaller en #aviso", [
        ({ ana, abrir, estado }) => {
          abrir(ana);
          const f = $('form[data-form="pieza"]');
          if (!f) return "no se abre el formulario";
          const msg = (n) => f.querySelector(`[data-error-de="${n}"]`).textContent;
          const MAL_N = "Escribe el nombre de la pieza (1 a 40 caracteres)";
          const MAL_P = "El precio va de 0,01 a 1000 €";
          f.elements.nombre.value = "   ";
          f.elements.precio.value = "0";
          enviar(f);
          if (!f.isConnected) return "con errores, el formulario no puede cerrarse (¿repintas aunque haya errores?)";
          if (msg("nombre") !== MAL_N || msg("precio") !== MAL_P) return `los mensajes salen ${muestra([msg("nombre"), msg("precio")])}`;
          if (f.elements.nombre.getAttribute("aria-invalid") !== "true" || f.elements.precio.getAttribute("aria-invalid") !== "true") return 'los dos campos tienen que llevar aria-invalid="true"';
          if (f.elements.precio.value !== "0" || ana.piezas.length || estado.cambios) return "con errores: lo escrito se queda, el modelo no cambia y no se llama a alCambiar";
          f.elements.nombre.value = "x".repeat(41);
          f.elements.precio.value = "1001";
          enviar(f);
          if (msg("nombre") !== MAL_N || msg("precio") !== MAL_P) return "un nombre de 41 caracteres y un precio de 1001 también son errores";
          f.elements.nombre.value = "Cámara";
          f.elements.precio.value = "1000.01";
          enviar(f);
          if (msg("nombre") !== "" || f.elements.nombre.hasAttribute("aria-invalid")) return "el nombre ya está bien: su mensaje y su aria-invalid tienen que desaparecer";
          return (msg("precio") === MAL_P && ana.piezas.length === 0) || "1000.01 € se pasa de 1000";
        },
        ({ ana, abrir, estado }) => {
          for (let i = 1; i <= 5; i++) ana.anadirPieza(`Pieza ${i}`, 1);
          abrir(ana);
          const f = $('form[data-form="pieza"]');
          if (!f) return "no se abre el formulario";
          f.elements.nombre.value = "Freno";
          f.elements.precio.value = "20";
          enviar(f);
          if ($("#aviso").hidden || $("#aviso").textContent !== "Como mucho 5 piezas por reparación") return `con 5 piezas el modelo lanza un ErrorTaller: su mensaje tiene que verse en #aviso (está ${$("#aviso").hidden ? "oculto" : "visible"}: ${muestra($("#aviso").textContent)})`;
          const sigue = $('form[data-form="pieza"]');
          if (!sigue || sigue.elements.nombre.value !== "Freno") return "con el error del modelo, el formulario sigue abierto y con lo escrito";
          return (ana.piezas.length === 5 && estado.cambios === 0) || "con el error, la reparación no cambia y no se llama a alCambiar";
        },
      ]),
      punto("6.6", "La trampa: XSS, tarjetas nuevas y el span, sin listeners duplicados", [
        ({ t: taller, boton, sergio, botonPieza, tarjeta: t }) => {
          const mala = taller.nuevaReparacion({ cliente: '<img src="x" onerror="globalThis.hackeado = true">', bici: "<b>BMX</b>", horas: 1 });
          clic(boton(sergio, "empezar")); // repinta: aparece la tarjeta nueva
          const b = botonPieza(mala);
          if (!b) return "la tarjeta nueva (creada después) no tiene botón de pieza";
          clic(b);
          if ($("#reparaciones img, #reparaciones b")) return "XSS: el cliente o la bici han creado etiquetas en el formulario. Nada de innerHTML con datos: createElement y textContent";
          return t(mala).querySelector("p.para")?.textContent === 'Pieza para «<b>BMX</b>» de <img src="x" onerror="globalThis.hackeado = true">' || "el cliente y la bici tienen que verse tal cual, como texto, en p.para";
        },
        ({ t: taller, boton, sergio, botonPieza, tarjeta: t }) => {
          const nueva = taller.nuevaReparacion({ cliente: "Nuevo", bici: "Brompton", horas: 1 });
          clic(boton(sergio, "empezar"));
          const b = botonPieza(nueva);
          if (!b) return "la tarjeta nueva (creada después) no tiene botón de pieza";
          clic(b.querySelector("span"));
          return !!t(nueva).querySelector('form[data-form="pieza"]') || "pulsando el <span> de dentro del botón no se abre: ¿closest?";
        },
        ({ ana, luis, sergio, abrir, boton, estado }) => {
          const otra = estado.t.nuevaReparacion({ cliente: "Otra", bici: "Bh", horas: 1 });
          clic(boton(sergio, "empezar"));
          clic(boton(sergio, "terminar"));
          clic(boton(luis, "terminar"));
          const antes = estado.cambios;
          abrir(ana);
          let f = $('form[data-form="pieza"]');
          if (!f) return "tras repintar varias veces, el formulario ya no se abre";
          f.elements.nombre.value = "Radio";
          f.elements.precio.value = "3";
          enviar(f);
          if (ana.piezas.length !== 1) return `tras 3 repintados, un envío ha añadido ${ana.piezas.length} piezas: hay listeners que se suman (¿dentro de pintar o en cada formulario?)`;
          if (estado.cambios - antes !== 1) return `tras 3 repintados, un envío llama ${estado.cambios - antes} veces a alCambiar (debería ser 1)`;
          abrir(ana);
          f = $('form[data-form="pieza"]');
          if (!f) return "no se vuelve a abrir el formulario";
          f.elements.nombre.value = "Timbre";
          f.elements.precio.value = "4";
          clic(boton(otra, "empezar"));
          return (!$('form[data-form="pieza"]') && ana.piezas.length === 1) || "si con el formulario abierto se repinta por otra acción (Empezar en otra tarjeta), el formulario se cierra sin guardar";
        },
      ], true),
    ],
  },
];

// Cada punto del simulacro monta la página de nuevo para cada una de sus pruebas (de 1 a 3).
function punto(id, texto, pruebas, opcional = false) {
  return {
    id,
    opcional,
    texto: `${opcional ? "➕" : "✍️"} ${texto}`,
    fn: ({ m, M }) => {
      for (const [i, prueba] of pruebas.entries()) {
        const ctx = montarSimulacro(m, M);
        if (!document.querySelector('#reparaciones [data-accion="pieza"]')) return "pendiente";
        const r = prueba(ctx);
        if (typeof r === "string" || r === false) {
          return pruebas.length > 1 ? `(prueba ${i + 1} de ${pruebas.length}) ${r || "falla"}` : r || "falla";
        }
      }
      return true;
    },
  };
}

function montarSimulacro(m, M) {
  pagina('<main><ul id="reparaciones"></ul><p id="aviso" hidden></p></main>');
  const datos = nuevoTaller(M);
  const estado = { cambios: 0, t: datos.t };
  m.iniciarTaller($("main"), datos.t, { mecanico: "Lucía", alCambiar: () => estado.cambios++ });
  const tarjetaDe = (r) => document.querySelector(`#reparaciones [data-id="${r.id}"]`);
  const boton = (r, accion) => tarjetaDe(r)?.querySelector(`[data-accion="${accion}"]`) ?? null;
  return {
    ...datos,
    estado,
    tarjeta: tarjetaDe,
    boton,
    botonPieza: (r) => boton(r, "pieza"),
    abrir: (r) => {
      const b = boton(r, "pieza");
      if (b) clic(b);
    },
  };
}

// 💡 Para empezar: lo que enseña el comprobador junto al ejercicio que toca hacer.
// Más ayuda, paso a paso (idea → ejemplo parecido → esqueleto), en la web: «🆘 ¿Atascado?» de cada bloque.
export const EMPEZAR = {
  "1.p": "En predicciones.js cambia cada undefined por lo que crees que da. Después pruébalo con «Probar» en la página del kit (docker compose up).",
  "1.e1": "querySelectorAll con un selector que pida las DOS clases a la vez (sin espacio entre ellas). ¿Qué propiedad dice cuántos hay?",
  "1.e2": "closest(\"[data-id]\") sube desde el elemento hasta su tarjeta (o da null). El id, con dataset… ¿y es un número?",
  "1.1": "Recorre las tarjetas pendientes (el selector del ejemplo te sirve) y suma su data-horas. Ojo: dataset da texto.",
  "1.2": "Guarda primero el estado de antes. Después: classList.remove de las tres clases de estado, classList.add de la nueva y dataset.estado.",
  "1.3": "Un while con nextElementSibling (no nextSibling: ese da también los saltos de línea) hasta encontrar una con el mismo dataset.estado.",
  "2.p": "En predicciones.js cambia cada undefined por lo que crees que da.",
  "2.e1": "Como crearBoton (el ejemplo), pero más corto: createElement(\"p\"), className y textContent.",
  "2.1": "createElement(\"li\"), classList.add, dataset.id y dataset.estado; el h3 y los p con crearDato; el botón según el estado con un if.",
  "2.2": "Si crearTarjeta usa solo createElement y textContent, esto ya está: nada de innerHTML con el cliente o la bici.",
  "2.3": "Copia y ordena: [...reparaciones].sort(…). Crea las tarjetas en un fragmento y lista.replaceChildren(fragmento). Si no hay ninguna, el li.vacio.",
  "3.p": "En predicciones.js cambia cada undefined por lo que crees que da.",
  "3.e1": "addEventListener tiene un tercer parámetro de opciones: { once: true }. El id, con Number(boton.dataset.id).",
  "3.e2": "keydown y e.key (\"ArrowUp\", \"ArrowDown\"). Si no es una flecha, return. Si lo es: preventDefault y Number(campo.value) ± 0.5, con Math.max.",
  "3.1": "En el constructor guarda el botón y la salida en privados, y añade un listener que sea una FLECHA: () => this.sumar(…). Con function, this sería el botón.",
  "3.2": "Para quitar un listener hace falta la MISMA función: guarda la flecha en un privado (this.#alPulsar) y úsala en addEventListener y en removeEventListener.",
  "3.3": "Una función con nombre (alTeclear) para poder quitarla. Dentro, e.key, e.target.tagName y e.ctrlKey. Devuelve () => raiz.removeEventListener(…).",
  "4.p": "En predicciones.js cambia cada undefined por lo que crees que da.",
  "4.e1": "Como el ejemplo: un listener en raiz y e.target.closest(\"a[data-interno]\"). Si lo hay, e.preventDefault(). Nada más (sin stopPropagation).",
  "4.1": "UN addEventListener(\"click\") en la lista. Dentro: boton = e.target.closest(\"[data-accion]\"); si no hay, return. El id, de la tarjeta (closest + Number). La acción, con try/catch.",
  "4.2": "Si conectarAcciones usa delegación (el listener en la lista), esto ya funciona solo. Si no, arréglalo allí.",
  "4.3": "catch (error): si es un ErrorTaller (instanceof), alError(error) y return, para no llegar a alCambiar. Si es otro error, vuelve a lanzarlo.",
  "4.4": "Busca la lista y el aviso, define pintar() (solo pinta: llama a pintarLista) y llama a conectarAcciones UNA vez, FUERA de pintar.",
  "5.p": "En predicciones.js cambia cada undefined por lo que crees que da.",
  "5.e1": "Primero el caso null. Después un if con todas las condiciones malas: Number.isNaN, < 0.5, > 40, y (horas * 2) % 1 !== 0 para «de media en media».",
  "5.1": "form.addEventListener(\"submit\", (e) => { e.preventDefault(); … }): leerAlta → errores → si no hay, taller.nuevaReparacion, reset, focus y alCambiar.",
  "5.2": "Un objeto { cliente: mensaje o \"\", bici: …, horas: … }. Recórrelo con Object.entries: texto del <p data-error-de>, aria-invalid puesto o quitado, y el primero con error a una variable para el focus.",
  "5.3": "Crea el input, celda.replaceChildren(input), input.focus(). Un listener de keydown en el input: con Enter, valida con errorDeHoras.",
  "5.4": "En el mismo listener de keydown: si e.key === \"Escape\", la celda vuelve al texto con las horas de ANTES (las que recibiste). Y nada más.",
  "6.1": "En crearTarjeta, después del botón que ya hay: si el estado no es «lista», otro crearBoton(\"pieza\", \"➕\", \"Pieza\").",
  "6.2": "Una variable abierta (el id con el formulario abierto o null). En el listener de click: si la acción es «pieza», abierta = id y pintar(). En pintar, si hay abierta, añade el formulario a su tarjeta y focus().",
  "6.3": "UN listener de submit en la LISTA (submit sube): preventDefault, lee los campos, anadirPieza en la reparación abierta, abierta = null, pintar y alCambiar.",
  "6.4": "Cancelar: en el click, si la acción es «cancelar», abierta = null y pintar (y return, sin alCambiar). Escape: UN listener de keydown en la lista.",
  "6.5": "Valida antes de tocar el modelo; si hay errores, escribe los mensajes en el formulario que YA está (no repintes). El ErrorTaller del modelo, con try/catch, a #aviso.",
  "6.6": "createElement y textContent en el formulario; todo con delegación en la lista (nada de listeners dentro de pintar) y, en Empezar/Terminar, abierta = null.",
};
