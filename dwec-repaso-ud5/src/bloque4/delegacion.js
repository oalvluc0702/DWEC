// Bloque 4 · Propagación y delegación
// Explicación: web de DWEC → Practicar → UD 5.2 · Repaso para el Parcial 2 → Bloque 4 (y el apartado 10 de la UD5).
// Comprueba con:  docker compose run --rm web npm run comprobar 4
//
// La lista es la del bloque 2: <ul id="reparaciones"> con una tarjeta <li class="reparacion" data-id="…"> por
// reparación, y en cada tarjeta, como mucho, un botón:
//   <button type="button" data-accion="empezar"><span class="icono">🔧</span> Empezar</button>
import { ErrorTaller } from "../modelo/errores.js";
import { pintarLista } from "../bloque2/pintar.js";

// 👀 EJEMPLO RESUELTO ─────────────────────────────────────────────────────────
// Al pulsar en CUALQUIER sitio de una tarjeta (el h3, el total, el botón…), la tarjeta se marca o desmarca
// con la clase «elegida». Un solo listener, en la lista: el clic sube desde lo que se pulsa (e.target)
// hasta la lista, y closest busca hacia arriba la tarjeta. Si se pulsa fuera de las tarjetas, nada.
export function elegirAlPulsar(lista) {
  lista.addEventListener("click", (e) => {
    const tarjeta = e.target.closest(".reparacion");
    if (!tarjeta) return;
    tarjeta.classList.toggle("elegida");
  });
}

// 🪜 ESCALERA ──────────────────────────────────────────────────────────────────
// 🪜 1 · Los enlaces internos de la página (<a data-interno href="#…">) no tienen que navegar: con UN listener
//        en raiz, cancela lo que haría el navegador al pulsarlos (también si se pulsa algo de dentro del
//        enlace). El clic tiene que seguir subiendo: hay otros listeners más arriba que lo necesitan.
//        Los enlaces sin data-interno, como siempre.
export function enlacesInternos(raiz) {
  throw new Error("Sin hacer");
}

// ✍️ TU TURNO ─────────────────────────────────────────────────────────────────
// ✍️ 1 · Las acciones de los botones de las tarjetas, con UN SOLO listener de click en la lista:
//        conectarAcciones(lista, taller, { mecanico, alCambiar, alError })
//          - data-accion="empezar"  → taller.asignar(id, mecanico)
//          - data-accion="terminar" → taller.terminar(id)
//          (id = el data-id de su tarjeta, como número)
//          - si ha ido bien → alCambiar()  (una vez)
//          - si el taller lanza un ErrorTaller → alError(error), y NO alCambiar
//          - si se pulsa fuera de un botón con data-accion → nada
//        Tiene que funcionar aunque se pulse el <span> de dentro del botón y con las tarjetas que se
//        pinten DESPUÉS. Y otros listeners de más arriba (document) tienen que seguir enterándose del clic.
export function conectarAcciones(lista, taller, { mecanico, alCambiar, alError }) {
  throw new Error("Sin hacer");
}

// ➕ OPCIONAL (para ir a por nota) · Todo junto (usa pintarLista del bloque 2 y tu conectarAcciones):
//        const pintar = montarLista(raiz, taller, mecanico)
//          raiz tiene  <ul id="reparaciones"></ul>  y  <p id="aviso" hidden></p>
//          - pinta la lista con taller.reparaciones() y devuelve esa función pintar, que se puede volver
//            a llamar las veces que sea (desde fuera, o tras cada acción);
//          - tras una acción que ha ido bien: repinta y oculta el aviso;
//          - si hay un ErrorTaller: su mensaje en #aviso (visible) y la lista como estaba.
//        Por muchas veces que se llame a pintar(), un clic hace la acción UNA sola vez.
export function montarLista(raiz, taller, mecanico) {
  throw new Error("Sin hacer");
}
