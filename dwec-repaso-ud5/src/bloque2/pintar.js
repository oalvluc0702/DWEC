// Bloque 2 · Crear nodos sin XSS y pintar desde el modelo
// Explicación: web de DWEC → Practicar → UD 5.2 · Repaso para el Parcial 2 → Bloque 2 (y los apartados 6, 7 y 8 de la UD5).
// Comprueba con:  docker compose run --rm web npm run comprobar 2
//
// Aquí el HTML ya no está escrito: lo creas tú desde el modelo (las reparaciones de src/modelo).
// Una tarjeta tiene que quedar así (sin espacios ni saltos de línea entre etiquetas):
//   <li class="reparacion urgente estado-en-taller" data-id="2" data-estado="en-taller">
//     <h3 class="cliente">Luis</h3>
//     <p class="bici">BH Ultimate</p>
//     <p class="tipo">urgente</p>
//     <p class="total">48.75 €</p>
//     <p class="estado">en-taller</p>
//     <button type="button" data-accion="terminar"><span class="icono">✅</span> Terminar</button>
//   </li>

// 👀 EJEMPLO RESUELTO ─────────────────────────────────────────────────────────
// Un botón con su acción, un icono y un texto:
//   <button type="button" data-accion="empezar"><span class="icono">🔧</span> Empezar</button>
// Todo con createElement y textContent: aunque el texto trajera etiquetas, se vería como texto.
export function crearBoton(accion, icono, texto) {
  const boton = document.createElement("button");
  boton.type = "button";
  boton.dataset.accion = accion;
  const span = document.createElement("span");
  span.className = "icono";
  span.textContent = icono;
  boton.append(span, ` ${texto}`);
  return boton;
}

// 🪜 ESCALERA ──────────────────────────────────────────────────────────────────
// 🪜 1 · Un párrafo con esa clase y ese texto: crearDato("bici", "Orbea") → <p class="bici">Orbea</p>
export function crearDato(clase, texto) {
  throw new Error("Sin hacer");
}

// ✍️ TU TURNO ─────────────────────────────────────────────────────────────────
// ✍️ 1 · La tarjeta de una reparación, como la de arriba:
//        - clases: reparacion, urgente (solo si su tipo es "urgente") y estado-<su estado>;
//        - data-id y data-estado;
//        - h3.cliente, p.bici, p.tipo, p.total (el total con 2 decimales y « €») y p.estado;
//        - el botón según el estado (usa crearBoton):
//            «pendiente» → crearBoton("empezar", "🔧", "Empezar")
//            «en-taller» → crearBoton("terminar", "✅", "Terminar")
//            «lista»     → ninguno
//        ¡Ojo! El cliente y la bici los escribe la gente en un formulario: nada de innerHTML con ellos.
export function crearTarjeta(reparacion) {
  throw new Error("Sin hacer");
}

// ✍️ 2 · Pinta la lista desde el modelo. Cada vez que se llama, la lista queda SOLO con estas tarjetas
//        (llamarla dos veces no duplica nada) y en este orden:
//          primero las urgentes y después las normales; dentro de cada grupo, por fecha de entrada
//          (la más antigua primero).
//        No cambies el array que te pasan (puede ser el del taller). Si está vacío, la lista tiene un
//        único <li class="vacio">No hay reparaciones</li>.
export function pintarLista(lista, reparaciones) {
  throw new Error("Sin hacer");
}
