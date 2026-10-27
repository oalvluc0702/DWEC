// pruebas.mjs — Las pruebas de cada bloque de la batería de la UD4. Puedes leerlas: dicen QUÉ se espera, no CÓMO hacerlo.
// Cada prueba devuelve: true (bien) · "pendiente" · un texto (lo que falla) · { aviso: "..." } · { bien|mal, info }
import { inspect } from "node:util";

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

// Prueba una función con varios casos y explica el primero que falla
function casos(fn, nombre, lista) {
  for (const [argumentos, esperado] of lista) {
    const obtenido = fn(...argumentos);
    if (!igual(obtenido, esperado)) {
      return `${nombre}(${argumentos.map(muestra).join(", ")}) debería dar ${muestra(esperado)} y da ${muestra(obtenido)}`;
    }
  }
  return true;
}

// ¿Lanza un error de esta clase? Devuelve null si sí, o el texto de lo que ha pasado
function lanza(fn, Clase = Error) {
  try {
    fn();
  } catch (e) {
    if (e?.message === "Sin hacer") throw e;
    return e instanceof Clase ? null : `lanza un ${e?.name ?? typeof e}, no un ${Clase.name}`;
  }
  return "no lanza ningún error";
}

// Predicciones: no se dice cuál es la buena. Al acertar, se explica POR QUÉ; al fallar, una pista.
// datos = { p1: [expresión, valor correcto, por qué, pista], ... }
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
    if (falladas.length > 0) {
      return { mal: `${claves.length - falladas.length}/${claves.length} bien. Revisa: ${falladas.join(", ")} → pruébalas con ./bateria.sh probar`, info };
    }
    return { bien: true, info };
  };
}

const d = (a, m, dia, h = 10) => new Date(a, m - 1, dia, h, 0); // fecha local: d(2026, 10, 20) = 20/10/2026 10:00

// ───────────────────────── bloques ─────────────────────────
export const BLOQUES = [
  {
    id: "1",
    titulo: "Bloque 1 · Objetos, this, referencias y copias",
    modulos: { m: "src/bloque1/objetos.js", pred: "src/bloque1/predicciones.js" },
    pruebas: [
      {
        id: "1.p",
        texto: "Predicciones",
        fn: predicciones({
          p1: ["const a = { n: 1 }; const b = a; b.n = 2; a.n", 2, "b no es una copia: a y b son DOS nombres del MISMO objeto", "¿= copia el objeto o solo la referencia?"],
          p2: ["const a = { n: 1 }; const b = { ...a }; b.n = 2; a.n", 1, "el spread crea un objeto NUEVO con las mismas propiedades", "¿{ ...a } es el mismo objeto que a?"],
          p3: ["const a = { x: { n: 1 } }; const b = { ...a }; b.x.n = 2; a.x.n", 2, "el spread es una copia SUPERFICIAL: b.x y a.x siguen siendo el mismo objeto", "el spread copia el primer nivel… ¿y lo que hay dentro de x?"],
          p4: ["Object.keys({ a: 1, b: 2 }).length", 2, "keys devuelve un array con los nombres de las propiedades propias", "¿qué devuelve Object.keys, y cuántas claves hay?"],
          p5: ["typeof { saludo() { return 'hola'; } }.saludo", "function", "un método es una propiedad cuyo valor es una función", "¿qué es saludo sin los paréntesis?"],
        }),
      },
      {
        id: "1.E",
        texto: "👀 Ejemplo: crearLibro con un método que usa this",
        fn: ({ m }) => {
          const l = m.crearLibro("Dune", "Herbert", 600);
          if (l.resumen() !== "Dune (Herbert), 600 págs.") return `resumen() da ${muestra(l.resumen())}`;
          l.titulo = "Dune II";
          return l.resumen().startsWith("Dune II") || "resumen() no usa this.titulo: al cambiar el título no cambia";
        },
      },
      { id: "1.e1", texto: "🪜 leerPropiedad (corchetes)", fn: ({ m }) => casos(m.leerPropiedad, "leerPropiedad", [[[{ a: 1, "b c": 2 }, "b c"], 2], [[{ a: 1 }, "a"], 1], [[{ a: 1 }, "z"], undefined]]) },
      {
        id: "1.e2",
        texto: "🪜 tienePropia (propia, no heredada)",
        fn: ({ m }) => casos(m.tienePropia, "tienePropia", [[[{ a: 1 }, "a"], true], [[{ a: 1 }, "toString"], false], [[{ a: undefined }, "a"], true]]),
      },
      {
        id: "1.1",
        texto: "✍️ marcarPrestado devuelve un objeto NUEVO",
        fn: ({ m }) => {
          const original = Object.freeze({ titulo: "Dune", prestado: false });
          let r;
          try {
            r = m.marcarPrestado(original);
          } catch (e) {
            if (e instanceof TypeError) return "Estás MODIFICANDO el libro original. Devuelve uno nuevo con { ...libro, … }";
            throw e;
          }
          if (r === original) return "devuelves el MISMO objeto: crea uno nuevo";
          if (r?.prestado !== true || r?.titulo !== "Dune") return `devuelve ${muestra(r)}`;
          return original.prestado === false || "has cambiado el original";
        },
      },
      {
        id: "1.2",
        texto: "✍️ contarPorAutor",
        fn: ({ m }) =>
          casos(m.contarPorAutor, "contarPorAutor", [
            [[[{ autor: "Ende" }, { autor: "Tolkien" }, { autor: "Ende" }]], { Ende: 2, Tolkien: 1 }],
            [[[]], {}],
          ]),
      },
      {
        id: "1.3",
        texto: "✍️ copiaProfunda: los cambios en la copia no tocan el original",
        fn: ({ m }) => {
          const original = { nombre: "Ana", direccion: { ciudad: "Cádiz" }, prestamos: ["111"] };
          const c = m.copiaProfunda(original);
          if (!igual(c, original)) return `la copia no tiene lo mismo: ${muestra(c)}`;
          c.direccion.ciudad = "Jerez";
          c.prestamos.push("222");
          if (original.direccion.ciudad !== "Cádiz") return "al cambiar la ciudad de la copia cambia la del original: direccion sigue siendo el mismo objeto";
          if (original.prestamos.length !== 1) return "al añadir un préstamo a la copia se añade al original: prestamos sigue siendo el mismo array";
          return true;
        },
      },
      {
        id: "1.4",
        texto: "✍️ ficha (Object.entries, sin los métodos)",
        fn: ({ m }) => {
          const l = { titulo: "Momo", autor: "Ende", paginas: 300, prestado: false, resumen() {} };
          return casos(m.ficha, "ficha", [[[l], "titulo: Momo · autor: Ende · paginas: 300 · prestado: false"]]);
        },
      },
    ],
  },
  {
    id: "2",
    titulo: "Bloque 2 · Prototipos",
    modulos: { m: "src/bloque2/prototipos.js", pred: "src/bloque2/predicciones.js" },
    pruebas: [
      {
        id: "2.p",
        texto: "Predicciones",
        fn: predicciones({
          p1: ["function F() {}; Object.getPrototypeOf(new F()) === F.prototype", true, "new enlaza el objeto nuevo con F.prototype", "¿qué hace new con el prototype de la función?"],
          p2: ["const o = {}; o.toString === Object.prototype.toString", true, "o no tiene toString: lo encuentra subiendo por la cadena hasta Object.prototype", "¿o tiene un toString propio? ¿dónde lo busca entonces?"],
          p3: ["class A {}; typeof A", "function", "class es azúcar sintáctico: por debajo, una clase es una función constructora", "repasa el apartado 6.7 de la UD4: ¿qué hay debajo de class?"],
          p4: ["const base = { x: 1 }; const h = Object.create(base); Object.hasOwn(h, 'x')", false, "x está en el prototipo de h, no en h", "Object.create no copia: enlaza"],
          p5: ["const base = { x: 1 }; const h = Object.create(base); h.x", 1, "h no tiene x, pero la encuentra en su prototipo (base)", "¿qué hace JavaScript cuando no encuentra la propiedad en el objeto?"],
        }),
      },
      {
        id: "2.E",
        texto: "👀 Ejemplo: Lector con el método en el prototipo",
        fn: ({ m }) => {
          const a = new m.Lector("Ana");
          return a.saludar() === "Hola, soy Ana" || `saludar() da ${muestra(a.saludar())}`;
        },
      },
      { id: "2.e1", texto: "🪜 esPropia", fn: ({ m }) => casos(m.esPropia, "esPropia", [[[{ a: 1 }, "a"], true], [[Object.create({ a: 1 }), "a"], false]]) },
      { id: "2.e2", texto: "🪜 estaEnLaCadena", fn: ({ m }) => casos(m.estaEnLaCadena, "estaEnLaCadena", [[[{}, "toString"], true], [[Object.create({ a: 1 }), "a"], true], [[{}, "zzz"], false]]) },
      {
        id: "2.1",
        texto: "✍️ Socio: función constructora con el método en el prototipo",
        fn: ({ m }) => {
          const a = new m.Socio("Ana", "2º DAW");
          const b = new m.Socio("Luis", "1º DAW");
          if (a.presentarse?.() !== "Soy Ana, de 2º DAW") return `presentarse() da ${muestra(a.presentarse?.())}`;
          if (Object.hasOwn(a, "presentarse")) return "presentarse está DENTRO de cada socio: ponlo en Socio.prototype (una sola vez para todos)";
          return a.presentarse === b.presentarse || "cada socio tiene su propia copia de presentarse";
        },
      },
      {
        id: "2.2",
        texto: "✍️ crearDesde: Object.create",
        fn: ({ m }) => {
          const base = { tipo: "socio", saludo() { return `soy ${this.nombre}`; } };
          const s = m.crearDesde(base, "Ana");
          if (Object.getPrototypeOf(s) !== base) return "el prototipo del objeto nuevo no es base: usa Object.create(base)";
          if (!Object.hasOwn(s, "nombre") || s.nombre !== "Ana") return "falta la propiedad propia nombre";
          if (Object.hasOwn(s, "tipo")) return "has copiado tipo dentro: no hace falta, se hereda";
          return s.saludo() === "soy Ana" || `s.saludo() da ${muestra(s.saludo())}`;
        },
      },
      {
        id: "2.3",
        texto: "✍️ niveles de la cadena de prototipos",
        fn: ({ m }) => casos(m.niveles, "niveles", [[[{}], 1], [[Object.create(null)], 0], [[new m.Lector("x")], 2], [[[]], 2]]),
      },
    ],
  },
  {
    id: "3",
    titulo: "Bloque 3 · Clases, getters/setters, privados, static y el this perdido",
    modulos: { m: "src/bloque3/clases.js", pred: "src/bloque3/predicciones.js" },
    pruebas: [
      {
        id: "3.p",
        texto: "Predicciones",
        fn: predicciones({
          p1: ["class C { #x = 1; get x() { return this.#x; } }; new C().x", 1, "el getter da acceso de lectura al campo privado", "un get se usa como una propiedad, sin paréntesis"],
          p2: ["class C { #x = 1; }; Object.keys(new C()).length", 0, "los campos # no son propiedades normales: no salen en keys", "¿Object.keys ve los campos #?"],
          p3: ["class D { static n = 3; }; 'n' in new D()", false, "static pertenece a la CLASE (D.n), no a cada objeto", "¿dónde vive una propiedad static?"],
          p4: ["class L { resumen() {} }; typeof L.prototype.resumen", "function", "los métodos de una clase viven en su prototype, una sola vez", "repasa el apartado 6.5 de la UD4"],
        }),
      },
      {
        id: "3.E",
        texto: "👀 Ejemplo: Contador con un campo privado",
        fn: ({ m }) => {
          const c = new m.Contador();
          c.incrementar().incrementar();
          return c.valor === 2 || `valor es ${c.valor}`;
        },
      },
      { id: "3.e1", texto: "🪜 Punto", fn: ({ m }) => new m.Punto(3, 4).distanciaAlOrigen() === 5 || "new Punto(3, 4).distanciaAlOrigen() debería dar 5" },
      {
        id: "3.1",
        texto: "✍️ Libro: el constructor valida y las páginas van por setter",
        fn: ({ m }) => {
          const l = new m.Libro("  Momo ", "Ende", 300);
          if (l.titulo !== "Momo") return `el título debería quedar sin espacios: ${muestra(l.titulo)}`;
          if (l.paginas !== 300) return `l.paginas da ${muestra(l.paginas)}`;
          let f = lanza(() => new m.Libro("   ", "Ende", 300));
          if (f) return `new Libro("   ", …) ${f}: un título vacío no vale`;
          for (const malo of [0, -3, 2.5, "300"]) {
            f = lanza(() => { l.paginas = malo; });
            if (f) return `l.paginas = ${muestra(malo)} ${f}`;
          }
          if (l.paginas !== 300) return "tras un valor no válido, las páginas han cambiado: valida ANTES de guardar";
          f = lanza(() => new m.Libro("Momo", "Ende", 0));
          if (f) return `new Libro("Momo", "Ende", 0) ${f}: el constructor debe usar el setter`;
          if (Object.keys(l).includes("paginas")) return "paginas es una propiedad pública: guárdala en un campo privado #paginas";
          if (new m.Libro("Dune", "Herbert", 600).esLargo !== true || l.esLargo !== false) return "esLargo debería ser true a partir de 400 páginas";
          return l.resumen() === "Momo (Ende), 300 págs." || `resumen() da ${muestra(l.resumen())}`;
        },
      },
      {
        id: "3.2",
        texto: "✍️ static: Libro.desde y Libro.creados",
        fn: ({ m }) => {
          const antes = m.Libro.creados;
          if (typeof antes !== "number") return "Libro.creados debería ser un número (un getter static)";
          const l = m.Libro.desde({ titulo: "Dune", autor: "Herbert", paginas: 600 });
          if (!(l instanceof m.Libro)) return "Libro.desde no devuelve un Libro";
          if (m.Libro.creados !== antes + 1) return `al crear un libro, creados pasa de ${antes} a ${m.Libro.creados} (debería sumar 1)`;
          return !("creados" in l) || "creados es de la clase, no de cada libro: hazlo static";
        },
      },
      {
        id: "3.3",
        texto: "✍️ crearAvisador: que no se pierda this",
        fn: ({ m }) => {
          const l = new m.Libro("Momo", "Ende", 300);
          const avisar = m.crearAvisador(l);
          if (typeof avisar !== "function") return "crearAvisador debe devolver una función";
          let r;
          try {
            r = avisar();
          } catch (e) {
            return `💥 al llamarla suelta: ${e.message} → se ha perdido this (apartado 7.7 de la UD4)`;
          }
          return r === l.resumen() || `avisar() da ${muestra(r)}`;
        },
      },
    ],
  },
  {
    id: "4",
    titulo: "Bloque 4 · Herencia y polimorfismo",
    modulos: { m: "src/bloque4/herencia.js", pred: "src/bloque4/predicciones.js" },
    pruebas: [
      {
        id: "4.p",
        texto: "Predicciones",
        fn: predicciones({
          p1: ["class A { hola() { return 'A'; } } class B extends A { hola() { return 'B' + super.hola(); } }; new B().hola()", "BA", "B sobrescribe hola y con super llama a la de A", "¿qué hace super.hola() dentro de B?"],
          p2: ["(mismas clases) new B() instanceof A", true, "un B es también un A: instanceof mira toda la cadena", "¿B hereda de A?"],
          p3: ["(mismas clases) Object.getPrototypeOf(B) === A", true, "extends también enlaza las clases entre sí (para los static)", "repasa el apartado 8.4 de la UD4"],
          p4: ["class X { constructor() { this.n = 1; } } class Y extends X { constructor() { super(); this.n++; } }; new Y().n", 2, "super() ejecuta el constructor de X (n = 1) y luego Y suma 1", "¿qué se ejecuta primero?"],
        }),
      },
      { id: "4.E", texto: "👀 Ejemplo: Publicacion", fn: ({ m }) => new m.Publicacion("Momo", 1973).descripcion() === "Momo (1973)" || "descripcion() de Publicacion no da «Momo (1973)»" },
      {
        id: "4.1",
        texto: "✍️ Libro extends Publicacion (con super)",
        fn: ({ m }) => {
          const l = new m.Libro("Momo", 1973, "Ende");
          if (!(l instanceof m.Publicacion)) return "Libro no hereda de Publicacion";
          if (l.titulo !== "Momo" || l.anio !== 1973) return "el título y el año no se guardan: ¿llamas a super(titulo, anio)?";
          return l.descripcion() === "Momo (1973) · Ende" || `descripcion() da ${muestra(l.descripcion())}`;
        },
      },
      {
        id: "4.2",
        texto: "✍️ Revista: otra descripción y otros días de préstamo",
        fn: ({ m }) => {
          const r = new m.Revista("Muy Interesante", 2026, 512);
          if (!(r instanceof m.Publicacion)) return "Revista no hereda de Publicacion";
          if (r.descripcion() !== "Muy Interesante (2026) · nº 512") return `descripcion() da ${muestra(r.descripcion())}`;
          if (r.diasPrestamo() !== 7) return `una revista se presta 7 días y da ${r.diasPrestamo()}`;
          return new m.Libro("Momo", 1973, "Ende").diasPrestamo() === 14 || "un libro se presta 14 días (lo hereda de Publicacion)";
        },
      },
      {
        id: "4.3",
        texto: "✍️ catalogo: polimorfismo, sin preguntar el tipo",
        fn: ({ m }, ctx) => {
          const lista = [new m.Libro("Momo", 1973, "Ende"), new m.Revista("Muy Interesante", 2026, 512)];
          const r = casos(m.catalogo, "catalogo", [[[lista], ["Momo (1973) · Ende", "Muy Interesante (2026) · nº 512"]]]);
          if (r !== true) return r;
          const fuente = ctx.leer("src/bloque4/herencia.js") ?? "";
          const cuerpo = fuente.slice(fuente.indexOf("function catalogo"), fuente.indexOf("function diasTotales"));
          return /instanceof|\.constructor|typeof/.test(cuerpo) ? { aviso: "funciona, pero preguntas el tipo: cada objeto ya sabe describirse (polimorfismo)" } : true;
        },
      },
      {
        id: "4.4",
        texto: "✍️ diasTotales",
        fn: ({ m }) => casos(m.diasTotales, "diasTotales", [[[[new m.Libro("A", 1, "x"), new m.Revista("B", 2, 1), new m.Revista("C", 3, 2)]], 28], [[[]], 0]]),
      },
    ],
  },
  {
    id: "5",
    titulo: "Bloque 5 · Composición, Map, Date, Intl y errores propios",
    modulos: { m: "src/bloque5/composicion.js", pred: "src/bloque5/predicciones.js" },
    pruebas: [
      {
        id: "5.p",
        texto: "Predicciones",
        fn: predicciones({
          p1: ["new Map([['a', 1]]).size", 1, "size cuenta los pares clave → valor", "un Map se mide con size, no con length"],
          p2: ["new Set([1, 1, 2]).size", 2, "un Set no guarda repetidos", "¿qué pasa con el 1 repetido?"],
          p3: ["const f = new Date(2026, 0, 31); f.setDate(f.getDate() + 1); f.getMonth()", 1, "31 de enero + 1 día = 1 de febrero, y los meses empiezan en 0", "¿en qué mes cae el día siguiente al 31/01? ¿y desde qué número cuentan los meses?"],
          p4: ["class E extends Error {}; new E('x') instanceof Error", true, "un error propio sigue siendo un Error", "¿de quién hereda E?"],
        }),
      },
      {
        id: "5.E",
        texto: "👀 Ejemplo: PrestamoError",
        fn: ({ m }) => {
          const e = new m.PrestamoError("No quedan", "111");
          return (e instanceof Error && e.name === "PrestamoError" && e.isbn === "111") || "PrestamoError no tiene name o isbn";
        },
      },
      { id: "5.e1", texto: "🪜 formatoFecha con Intl", fn: ({ m }) => casos(m.formatoFecha, "formatoFecha", [[[d(2026, 11, 3)], "03/11/2026"], [[d(2026, 1, 9)], "09/01/2026"]]) },
      {
        id: "5.1",
        texto: "✍️ fechaDevolucion (sin tocar la fecha de partida)",
        fn: ({ m }) => {
          const desde = d(2026, 10, 20, 10);
          const r = m.fechaDevolucion(desde, 14);
          if (desde.getDate() !== 20) return "has cambiado la fecha que te pasan: trabaja sobre una copia (new Date(desde))";
          if (!(r instanceof Date)) return "debería devolver un Date";
          if (r.getDate() !== 3 || r.getMonth() !== 10) return `20/10 + 14 días debería ser el 03/11 y da ${r.toLocaleDateString("es-ES")}`;
          return r.getHours() === 10 || `da el 03/11 a las ${r.getHours()}:00: el 25/10 cambia la hora y ese día tiene 25 h. Suma días con setDate, no milisegundos`;
        },
      },
      {
        id: "5.2",
        texto: "✍️ Socio: préstamos en un Map privado, con PrestamoError",
        fn: ({ m }) => {
          const s = new m.Socio("Ana", 2);
          const hoy = d(2026, 10, 20);
          s.prestar("111", hoy);
          if (s.numPrestamos !== 1) return `tras prestar, numPrestamos es ${s.numPrestamos}`;
          let f = lanza(() => s.prestar("111", hoy), m.PrestamoError);
          if (f) return `prestar dos veces el mismo ${f}`;
          s.prestar("222", hoy);
          f = lanza(() => s.prestar("333", hoy), m.PrestamoError);
          if (f) return `pasar del máximo (2) ${f}`;
          s.devolver("111");
          if (s.numPrestamos !== 1) return "devolver no quita el préstamo";
          f = lanza(() => s.devolver("999"), m.PrestamoError);
          if (f) return `devolver lo que no tiene ${f}`;
          if (new m.Socio("Luis").maximo !== 3) return "el máximo por defecto es 3";
          return igual(Object.keys(s).sort(), ["maximo", "nombre"]) || `el socio enseña ${muestra(Object.keys(s))}: los préstamos van en un campo privado`;
        },
      },
      {
        id: "5.3",
        texto: "✍️ vencidos (por días, sin contar la hora)",
        fn: ({ m }) => {
          const s = new m.Socio("Ana");
          s.prestar("111", d(2026, 10, 1), 14); // vence el 15/10
          if (!igual(s.vencidos(d(2026, 10, 15, 20)), [])) return "el mismo día que vence (15/10 a las 20:00) todavía NO está vencido";
          return igual(s.vencidos(d(2026, 10, 16, 8)), ["111"]) || `el 16/10 debería estar vencido: da ${muestra(s.vencidos(d(2026, 10, 16, 8)))}`;
        },
      },
    ],
  },
  {
    id: "6",
    titulo: "Bloque 6 · Integrador: la biblioteca",
    modulos: { m: "src/bloque6/biblioteca.js", h: "src/bloque4/herencia.js", c: "src/bloque5/composicion.js" },
    pruebas: [
      {
        id: "6.1",
        texto: "✍️ alta y disponibles",
        fn: ({ m, h, c }) => {
          const b = new m.Biblioteca();
          b.alta("111", new h.Libro("Momo", 1973, "Ende"));
          b.alta("222", new h.Revista("Muy Interesante", 2026, 512));
          if (!igual(b.disponibles(), ["Momo (1973) · Ende", "Muy Interesante (2026) · nº 512"])) return `disponibles() da ${muestra(b.disponibles())}`;
          const f = lanza(() => b.alta("111", new h.Libro("Otro", 2000, "X")), c.PrestamoError);
          return f ? `dar de alta un isbn repetido ${f}` : true;
        },
      },
      {
        id: "6.2",
        texto: "✍️ prestar: comprueba que todo existe y que no está prestado",
        fn: ({ m, h, c }) => {
          const b = new m.Biblioteca();
          b.alta("111", new h.Libro("Momo", 1973, "Ende"));
          b.registrar("Ana");
          const hoy = d(2026, 10, 20);
          let f = lanza(() => b.prestar("999", "Ana", hoy), c.PrestamoError);
          if (f) return `prestar un isbn que no existe ${f}`;
          f = lanza(() => b.prestar("111", "Nadie", hoy), c.PrestamoError);
          if (f) return `prestar a un socio que no existe ${f}`;
          b.prestar("111", "Ana", hoy);
          if (b.disponibles().length !== 0) return "un libro prestado sigue saliendo en disponibles()";
          b.registrar("Luis");
          f = lanza(() => b.prestar("111", "Luis", hoy), c.PrestamoError);
          return f ? `prestar algo ya prestado ${f}` : true;
        },
      },
      {
        id: "6.3",
        texto: "✍️ informeVencidos: cada publicación con sus días (polimorfismo)",
        fn: ({ m, h }) => {
          const b = new m.Biblioteca();
          b.alta("111", new h.Libro("Momo", 1973, "Ende"));
          b.alta("222", new h.Revista("Muy Interesante", 2026, 512));
          b.registrar("Ana");
          b.prestar("111", "Ana", d(2026, 10, 1));
          b.prestar("222", "Ana", d(2026, 10, 1));
          const r = b.informeVencidos(d(2026, 10, 10));
          return igual(r, [{ socio: "Ana", isbn: "222" }]) || `el 10/10 solo la revista (7 días) está vencida; da ${muestra(r)}. ¿Usas diasPrestamo() de la publicación?`;
        },
      },
      {
        id: "6.4",
        texto: "✍️ devolver",
        fn: ({ m, h, c }) => {
          const b = new m.Biblioteca();
          b.alta("111", new h.Libro("Momo", 1973, "Ende"));
          b.registrar("Ana");
          b.prestar("111", "Ana", d(2026, 10, 20));
          b.devolver("111");
          if (b.disponibles().length !== 1) return "tras devolverlo, el libro no vuelve a disponibles()";
          const f = lanza(() => b.devolver("111"), c.PrestamoError);
          return f ? `devolver algo que no está prestado ${f}` : true;
        },
      },
    ],
  },
];
