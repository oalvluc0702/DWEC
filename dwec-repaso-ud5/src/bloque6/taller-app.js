// Bloque 6 · Simulacro: «Añadir pieza»
// Explicación y enunciado completo: web de DWEC → Practicar → UD 5.2 · Repaso para el Parcial 2 → Bloque 6.
// Comprueba con:  docker compose run --rm web npm run comprobar 6     (te dice cuántos puntos llevas de 5; el 6 es opcional)
//
// Esta es la página del taller YA FUNCIONANDO: pinta las reparaciones y los botones Empezar/Terminar van.
// Léela entera antes de tocar nada: tu trabajo es AÑADIRLE una función nueva sin romper lo que hay.
// Solo se toca este fichero (src/modelo no se toca).
//
// ─────────────────────────── EL ENUNCIADO ───────────────────────────
// En cada tarjeta «pendiente» o «en-taller» (en las «lista», no) sale un botón nuevo, detrás del que ya hay:
//     <button type="button" data-accion="pieza"><span class="icono">➕</span> Pieza</button>
// Al pulsarlo se abre, DENTRO de esa tarjeta (al final), este formulario:
//     <form data-form="pieza" novalidate>
//       <p class="para">Pieza para «BICI» de CLIENTE</p>
//       <label>Pieza <input name="nombre"></label>                                <p class="error" data-error-de="nombre"></p>
//       <label>Precio <input name="precio" type="number" step="0.01"></label>     <p class="error" data-error-de="precio"></p>
//       <button type="submit">Guardar</button>
//       <button type="button" data-accion="cancelar">Cancelar</button>
//     </form>
//
// 1 · El botón sale solo en las tarjetas «pendiente» y «en-taller», también después de repintar.
// 2 · Al pulsarlo se abre el formulario en ESA tarjeta, con los campos vacíos y el foco en «nombre».
//     Abrirlo no cambia el modelo ni llama a alCambiar.
// 3 · Al enviarlo (Enter o «Guardar»), sin recargar: reparacion.anadirPieza(nombre sin espacios a los lados,
//     precio como número). Se repinta (el total de la tarjeta cambia), el formulario desaparece y
//     alCambiar() se llama UNA vez.
// 4 · Escape (con el foco dentro del formulario) o «Cancelar»: se cierra sin cambiar nada y sin llamar a
//     alCambiar. Solo hay un formulario abierto a la vez: abrir otro cierra el anterior.
// 5 · Errores junto al campo, con aria-invalid="true" en el campo, sin cerrar el formulario ni perder lo escrito:
//       nombre vacío (o solo espacios) o de más de 40 caracteres → «Escribe el nombre de la pieza (1 a 40 caracteres)»
//       precio vacío, no numérico, 0 o menos, o más de 1000    → «El precio va de 0,01 a 1000 €»
//     Si el modelo lanza un ErrorTaller (ya tiene 5 piezas), su mensaje sale en #aviso, el formulario sigue
//     abierto con lo escrito y la reparación no cambia.
// 6 · ➕ OPCIONAL (para ir a por nota) · La trampa: el cliente y la bici se ven como texto (aunque traigan etiquetas); funciona en tarjetas que
//     aparecen después y pulsando el <span> del botón; por muchas veces que se repinte, un envío añade UNA
//     pieza; y si con el formulario abierto se repinta por otra acción (Empezar o Terminar en otra
//     tarjeta), el formulario se cierra sin guardar nada.
//
// No vale: innerHTML con datos (ni insertAdjacentHTML), un listener en cada tarjeta, botón o formulario,
// ni listeners dentro de pintar().
// ─────────────────────────────────────────────────────────────────────
import { ErrorTaller } from "../modelo/errores.js";

function crearBoton(accion, icono, texto) {
  const boton = document.createElement("button");
  boton.type = "button";
  boton.dataset.accion = accion;
  const span = document.createElement("span");
  span.className = "icono";
  span.textContent = icono;
  boton.append(span, ` ${texto}`);
  return boton;
}

function crearDato(clase, texto) {
  const p = document.createElement("p");
  p.className = clase;
  p.textContent = texto;
  return p;
}

function crearTarjeta(r) {
  const li = document.createElement("li");
  li.classList.add("reparacion", `estado-${r.estado}`);
  if (r.tipo === "urgente") li.classList.add("urgente");
  li.dataset.id = r.id;
  li.dataset.estado = r.estado;
  const cliente = document.createElement("h3");
  cliente.className = "cliente";
  cliente.textContent = r.cliente;
  const piezas = r.piezas.map((p) => p.nombre).join(", ");
  li.append(
    cliente,
    crearDato("bici", r.bici),
    crearDato("tipo", r.tipo),
    crearDato("total", `${r.total.toFixed(2)} €`),
    crearDato("estado", r.estado),
    crearDato("piezas", piezas ? `Piezas: ${piezas}` : "Sin piezas"),
  );
  if (r.estado === "pendiente") li.append(crearBoton("empezar", "🔧", "Empezar"));
  if (r.estado === "en-taller") li.append(crearBoton("terminar", "✅", "Terminar"));
  return li;
}

// raiz tiene <ul id="reparaciones"></ul> y <p id="aviso" hidden></p>
export function iniciarTaller(raiz, taller, { mecanico, alCambiar = () => {} }) {
  const lista = raiz.querySelector("#reparaciones");
  const aviso = raiz.querySelector("#aviso");

  function avisar(texto) {
    aviso.textContent = texto;
    aviso.hidden = texto === "";
  }

  function pintar() {
    lista.replaceChildren(...taller.reparaciones().map(crearTarjeta));
  }

  lista.addEventListener("click", (e) => {
    const boton = e.target.closest("[data-accion]");
    if (!boton) return;
    const id = Number(boton.closest("[data-id]").dataset.id);
    try {
      if (boton.dataset.accion === "empezar") taller.asignar(id, mecanico);
      if (boton.dataset.accion === "terminar") taller.terminar(id);
    } catch (error) {
      if (!(error instanceof ErrorTaller)) throw error;
      avisar(error.message);
      return;
    }
    avisar("");
    pintar();
    alCambiar();
  });

  pintar();
}
