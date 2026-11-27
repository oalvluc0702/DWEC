// ejemplos.js — Qué enseña la página en cada bloque. No hace falta tocarlo.
//   html:      la página de prueba del bloque (el «escenario»): la ves y la puedes usar.
//   montar:    cómo se conectan TUS funciones al escenario (botones, teclado, formulario…).
//              Lo que pasa sale en el registro: así ves cuándo se llama a cada función y con qué.
//   ejemplos:  código que la página ejecuta con TUS funciones; «espera» es lo que debería salir.
// En el código: escenario = la caja del escenario; $("selector") = el primer elemento del escenario que lo cumple;
// anota(...) escribe en el registro; nuevoTaller() = un taller de ejemplo nuevo; Taller, Reparacion… = el modelo.
// El comprobador (docker compose run --rm web npm run comprobar N) prueba muchos más casos: esto es para VER y DEPURAR.
const modulos = import.meta.glob("../src/bloque*/*.js");
const cargar = (ruta) => modulos[`../src/${ruta}`]();

const LISTA = `<ul id="reparaciones">
  <li class="reparacion estado-pendiente" data-id="1" data-estado="pendiente" data-horas="2"><h3 class="cliente">Ana</h3><p class="bici">Orbea Alma</p><button type="button" data-accion="empezar"><span class="icono">🔧</span> Empezar</button></li>
  <li class="reparacion urgente estado-en-taller" data-id="2" data-estado="en-taller" data-horas="1.5"><h3 class="cliente">Luis</h3><p class="bici">BH Ultimate</p><button type="button" data-accion="terminar"><span class="icono">✅</span> Terminar</button></li>
  <li class="reparacion estado-lista" data-id="3" data-estado="lista" data-horas="3"><h3 class="cliente">Marta</h3><p class="bici">Trek Marlin</p></li>
  <li class="reparacion urgente estado-pendiente" data-id="4" data-estado="pendiente" data-horas="0.5"><h3 class="cliente">Sergio</h3><p class="bici">Canyon Grail</p><button type="button" data-accion="empezar"><span class="icono">🔧</span> Empezar</button></li>
  <li class="reparacion estado-en-taller" data-id="5" data-estado="en-taller" data-horas="4"><h3 class="cliente">Eva</h3><p class="bici">Giant Talon</p><button type="button" data-accion="terminar"><span class="icono">✅</span> Terminar</button></li>
</ul>`;

const FORM_ALTA = `<form id="alta" novalidate>
  <label>Cliente <input name="cliente"></label><p class="error" data-error-de="cliente"></p>
  <label>Bici <input name="bici"></label><p class="error" data-error-de="bici"></p>
  <label>Horas <input name="horas" type="number" step="0.5"></label><p class="error" data-error-de="horas"></p>
  <label><input type="checkbox" name="urgente"> Urgente</label>
  <button>Dar de alta</button>
</form>`;

export const BLOQUES = [
  {
    n: 1,
    titulo: "Seleccionar, leer y modificar",
    modulos: ["bloque1/leer.js"],
    html: `${LISTA}<aside id="lateral"><p>Horario: de 9 a 14</p></aside>
<p><small>Pulsa en cualquier sitio de una tarjeta: el registro enseña lo que dan TUS idDe y siguienteIgual.</small></p>`,
    montar: [
      {
        nombre: "clic en una tarjeta → idDe(lo pulsado) y siguienteIgual(tarjeta)",
        codigo: `escenario.addEventListener("click", (e) => {
  const tarjeta = e.target.closest(".reparacion");
  if (tarjeta) anota("idDe(", e.target, ") →", idDe(e.target), "· siguienteIgual →", siguienteIgual(tarjeta));
});`,
      },
    ],
    ejemplos: [
      { codigo: 'clientes(escenario, "pendiente")', espera: '["Ana", "Sergio"]', tipo: "👀" },
      { codigo: "contarUrgentes(escenario)", espera: "2" },
      { codigo: 'idDe($("[data-id=\'4\'] button span"))', espera: "4" },
      { codigo: 'idDe($("#lateral p"))', espera: "null" },
      { codigo: "horasPendientes(escenario)", espera: "2.5" },
      {
        codigo: 'const t = $("[data-id=\'2\']");\nconst antes = marcarEstado(t, "lista");\nconst clases = t.className;\nmarcarEstado(t, antes);\n[antes, clases]',
        espera: '["en-taller", "reparacion urgente estado-lista"]',
        nota: "el orden de las clases puede cambiar; lo que importa es cuáles están",
      },
      { codigo: 'siguienteIgual($("[data-id=\'1\']"))', espera: "4" },
    ],
  },
  {
    n: 2,
    titulo: "Crear nodos sin XSS y pintar desde el modelo",
    modulos: ["bloque2/pintar.js"],
    html: `<p><button type="button" id="pintar">Pintar el taller</button> <button type="button" id="vaciar">Pintar una lista vacía</button></p>
<ul id="reparaciones"></ul>`,
    montar: [
      {
        nombre: "pintarLista($(\"#reparaciones\"), nuevoTaller().reparaciones())",
        codigo: `pintarLista($("#reparaciones"), nuevoTaller().reparaciones());
anota("Pintado el taller de ejemplo. El último cliente trae HTML en el nombre: con textContent se ve como texto y no salta ninguna alerta");`,
      },
      {
        nombre: "botones «Pintar…»",
        codigo: `$("#pintar").addEventListener("click", () => { pintarLista($("#reparaciones"), nuevoTaller().reparaciones()); anota("pintarLista con el taller"); });
$("#vaciar").addEventListener("click", () => { pintarLista($("#reparaciones"), []); anota("pintarLista con []"); });`,
      },
    ],
    ejemplos: [
      { codigo: 'crearBoton("empezar", "🔧", "<b>Empezar</b>").outerHTML', espera: '"<button type=\\"button\\" data-accion=\\"empezar\\"><span class=\\"icono\\">🔧</span> &lt;b&gt;Empezar&lt;/b&gt;</button>"', tipo: "👀" },
      { codigo: 'crearDato("bici", "Orbea").outerHTML', espera: '"<p class=\\"bici\\">Orbea</p>"' },
      {
        codigo: 'const luis = nuevoTaller().reparaciones()[1];\nconst t = crearTarjeta(luis);\n[t.className, t.dataset.estado, t.querySelector(".total").textContent, t.querySelector("button").textContent]',
        espera: '["reparacion estado-en-taller urgente", "en-taller", "48.75 €", "✅ Terminar"]',
        nota: "el orden de las clases puede cambiar",
      },
      { codigo: 'crearTarjeta(nuevoTaller().reparaciones()[4]).querySelector("img")', espera: "null", nota: "¡se ha creado un img con el nombre del cliente! XSS" },
      { codigo: 'const t = nuevoTaller();\npintarLista($("#reparaciones"), t.reparaciones());\npintarLista($("#reparaciones"), t.reparaciones());\n[...$("#reparaciones").querySelectorAll(".cliente")].map((h) => h.textContent).slice(0, 2)', espera: '["Luis", "Ana"]', nota: "dos veces = las mismas 5 tarjetas, con la urgente primero" },
    ],
  },
  {
    n: 3,
    titulo: "Listeners y el objeto evento",
    modulos: ["bloque3/listeners.js"],
    html: `<p><button type="button" class="vigilado" data-accion="empezar"><span>🔧</span> Empezar (vigilado)</button> <output class="salida-vigilar"></output></p>
<p><button type="button" class="una-vez" data-id="7">Solo la primera vez</button></p>
<p><label>Horas (flechas ↑ ↓) <input class="horas" type="number" step="0.5" value="2"></label></p>
<p><button type="button" class="marcador" data-paso="0.5">+½ h</button> <output class="salida-marcador">0 h</output> <button type="button" class="desconectar">desconectar()</button></p>
<p><label>Escribe aquí (prueba «n» dentro y fuera del campo, y Escape) <input class="nota"></label></p>`,
    montar: [
      { nombre: 'vigilar($(".vigilado"), $(".salida-vigilar"))', codigo: 'vigilar($(".vigilado"), $(".salida-vigilar"));' },
      { nombre: 'soloUnaVez($(".una-vez"), accion)', codigo: 'soloUnaVez($(".una-vez"), (id) => anota("accion(", id, ") · ¿es un número?", typeof id === "number"));' },
      { nombre: 'flechasHoras($(".horas"))', codigo: 'flechasHoras($(".horas"));' },
      {
        nombre: 'new MarcadorHoras($(".marcador"), $(".salida-marcador"))',
        codigo: `window.marcador = new MarcadorHoras($(".marcador"), $(".salida-marcador"));
$(".desconectar").addEventListener("click", () => { marcador.desconectar(); anota("desconectar(): a partir de ahora +½ h no tiene que sumar. Lleva", marcador.horas); });`,
      },
      { nombre: "atajos(escenario, { nueva, cerrar })", codigo: 'atajos(escenario, { nueva: () => anota("nueva()"), cerrar: () => anota("cerrar()") });' },
    ],
    ejemplos: [
      { codigo: 'const b = document.createElement("button");\nb.dataset.accion = "terminar";\nconst salida = document.createElement("output");\nconst quitar = vigilar(b, salida);\nb.click();\nquitar();\nb.click();\nsalida.textContent', espera: '"click en terminar"', tipo: "👀" },
      { codigo: 'const b = document.createElement("button");\nb.dataset.id = "3";\nconst llegan = [];\nsoloUnaVez(b, (id) => llegan.push(id));\nb.click();\nb.click();\nllegan', espera: "[3]" },
      { codigo: 'const c = document.createElement("input");\nc.value = "2";\nflechasHoras(c);\nc.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowUp" }));\nc.value', espera: '"2.5"' },
      { codigo: 'const b = document.createElement("button");\nb.dataset.paso = "1";\nconst m = new MarcadorHoras(b, document.createElement("output"));\nb.click();\nm.desconectar();\nb.click();\nm.horas', espera: "1" },
    ],
  },
  {
    n: 4,
    titulo: "Propagación y delegación",
    modulos: ["bloque2/pintar.js", "bloque4/delegacion.js"],
    html: `<ul id="reparaciones"></ul>
<p id="aviso" class="aviso" hidden></p>
<p><a data-interno href="#ficha"><span>Enlace interno (no navega)</span></a> · <a href="#otro">Enlace normal</a></p>
<p><small>Empieza reparaciones hasta llenar a Lucía (2 trabajos): el error tiene que salir en el aviso.</small></p>`,
    montar: [
      { nombre: 'montarLista(escenario, nuevoTaller(), "Lucía")', codigo: 'window.pintar = montarLista(escenario, nuevoTaller(), "Lucía");' },
      { nombre: 'elegirAlPulsar($("#reparaciones"))', codigo: 'elegirAlPulsar($("#reparaciones"));' },
      { nombre: "enlacesInternos(escenario)", codigo: "enlacesInternos(escenario);" },
      {
        nombre: "document escucha todos los clics (para ver si llegan arriba)",
        codigo: 'document.addEventListener("click", (e) => { if (escenario.contains(e.target)) anota("el clic ha llegado a document · target:", e.target, "· defaultPrevented:", e.defaultPrevented); });',
      },
    ],
    ejemplos: [
      { codigo: 'const ul = document.createElement("ul");\nul.innerHTML = \'<li class="reparacion"><h3>Ana</h3></li>\';\nelegirAlPulsar(ul);\nul.querySelector("h3").click();\nul.firstElementChild.className', espera: '"reparacion elegida"', tipo: "👀" },
      {
        codigo: 'const t = nuevoTaller();\nconst ul = document.createElement("ul");\nul.innerHTML = `<li data-id="${t.reparaciones()[0].id}"><button data-accion="empezar"><span>🔧</span></button></li>`;\nconst cambios = [];\nconectarAcciones(ul, t, { mecanico: "Lucía", alCambiar: () => cambios.push("ok"), alError: (e) => cambios.push(e.name) });\nul.querySelector("span").click();\n[t.reparaciones()[0].estado, ...cambios]',
        espera: '["en-taller", "ok"]',
      },
      { codigo: "typeof pintar", espera: '"function"', nota: "montarLista tiene que devolver la función pintar", trasMontar: true },
    ],
  },
  {
    n: 5,
    titulo: "Formularios",
    modulos: ["bloque5/formulario.js"],
    html: `${FORM_ALTA}
<p>Horas de la reparación de Ana: <span class="horas">2 h</span> <button type="button" id="editar">Editar</button> <small>(Enter guarda, Escape cancela)</small></p>
<p><small>Prueba a enviar vacío, con horas «2.3» o «0». Al dar de alta bien, alCambiar sale en el registro.</small></p>`,
    montar: [
      {
        nombre: 'conectarAlta($("#alta"), taller, alCambiar)',
        codigo: `window.tallerAlta = new Taller();
conectarAlta($("#alta"), tallerAlta, (r) => anota("alCambiar(", r.cliente, "·", r.bici, "·", r.horas, "h ·", r.tipo, ") · el taller tiene", tallerAlta.reparaciones().length));`,
      },
      {
        nombre: "botón Editar → editarHoras($(\".horas\"), horas, alGuardar)",
        codigo: `window.horasAna = 2;
$("#editar").addEventListener("click", () => editarHoras($(".horas"), horasAna, (h) => { horasAna = h; anota("alGuardar(", h, ")"); }));`,
      },
    ],
    ejemplos: [
      { codigo: 'const f = $("#alta");\nf.elements.cliente.value = " Ana ";\nf.elements.bici.value = "Orbea";\nf.elements.horas.value = "2";\nconst datos = leerAlta(f);\nf.reset();\ndatos', espera: '{ cliente: "Ana", bici: "Orbea", horas: 2, urgente: false }', tipo: "👀" },
      { codigo: "errorDeHoras(null)", espera: '"Indica las horas"' },
      { codigo: "[errorDeHoras(2.3), errorDeHoras(7.5)]", espera: '["Entre 0,5 y 40 horas, de media en media", ""]' },
      {
        codigo: 'const celda = document.createElement("span");\nconst guardadas = [];\neditarHoras(celda, 2, (h) => guardadas.push(h));\nceld = celda.querySelector("input");\nceld.value = "9";\nceld.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));\n[celda.textContent, guardadas.length]',
        espera: '["2 h", 0]',
      },
    ],
  },
  {
    n: 6,
    titulo: "Simulacro: «Añadir pieza»",
    modulos: ["bloque6/taller-app.js"],
    html: `<ul id="reparaciones"></ul>
<p id="aviso" class="aviso" hidden></p>`,
    montar: [{ nombre: 'iniciarTaller(escenario, nuevoTaller(), { mecanico: "Lucía", alCambiar })', codigo: 'iniciarTaller(escenario, nuevoTaller(), { mecanico: "Lucía", alCambiar: () => anota("alCambiar()") });' }],
    ejemplos: [
      { codigo: '$("#reparaciones").children.length', espera: "5", trasMontar: true },
      { codigo: 'escenario.querySelectorAll(\'[data-accion="pieza"]\').length', espera: "4", nota: "el botón de pieza sale en las 4 que no están «lista»", trasMontar: true },
      { codigo: 'escenario.querySelector("#reparaciones img")', espera: "null", nota: "¡XSS!", trasMontar: true },
    ],
  },
];

export async function cargarBloque(bloque) {
  const cargados = await Promise.all(bloque.modulos.map(cargar));
  return Object.assign({}, ...cargados);
}

// Las predicciones: el texto de predicciones.js (para leer las expresiones) y tus respuestas
const textos = import.meta.glob("../src/bloque*/predicciones.js", { query: "?raw", import: "default" });
export async function cargarPredicciones(n) {
  const ruta = `../src/bloque${n}/predicciones.js`;
  if (!textos[ruta]) return [];
  const [texto, modulo] = await Promise.all([textos[ruta](), modulos[ruta]()]);
  return [...texto.matchAll(/^\s*(p\d+):.*?\/\/\s*(.+)$/gm)].map(([, clave, expresion]) => ({
    clave,
    expresion: expresion.trim(),
    tuya: modulo.predicciones?.[clave],
  }));
}
