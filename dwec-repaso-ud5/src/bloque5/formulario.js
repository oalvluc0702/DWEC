// Bloque 5 · Formularios
// Explicación: web de DWEC → Practicar → UD 5.2 · Repaso para el Parcial 2 → Bloque 5 (y el apartado 12 de la UD5).
// Comprueba con:  docker compose run --rm web npm run comprobar 5
//
// El formulario de alta:
//   <form id="alta" novalidate>
//     <label>Cliente <input name="cliente"></label>              <p class="error" data-error-de="cliente"></p>
//     <label>Bici <input name="bici"></label>                    <p class="error" data-error-de="bici"></p>
//     <label>Horas <input name="horas" type="number" step="0.5"></label> <p class="error" data-error-de="horas"></p>
//     <label><input type="checkbox" name="urgente"> Urgente</label>
//     <button>Dar de alta</button>
//   </form>

// 👀 EJEMPLO RESUELTO ─────────────────────────────────────────────────────────
// Lee el formulario y devuelve los datos ya convertidos:
//   { cliente: "Ana", bici: "Orbea Alma", horas: 2, urgente: false }
//   - FormData usa el atributo name y lo da TODO como texto: las horas, con Number().
//   - Si las horas están vacías, null (Number("") daría 0, ¡y 0 no es «sin escribir»!).
//   - Una casilla sin marcar NO aparece en el FormData: has() dice si estaba marcada.
export function leerAlta(form) {
  const datos = new FormData(form);
  const horas = datos.get("horas");
  return {
    cliente: datos.get("cliente").trim(),
    bici: datos.get("bici").trim(),
    horas: horas === "" ? null : Number(horas),
    urgente: datos.has("urgente"),
  };
}

// 🪜 ESCALERA ──────────────────────────────────────────────────────────────────
// 🪜 1 · El mensaje de error de unas horas, o "" si están bien:
//        - null → "Indica las horas"
//        - NaN, menos de 0.5, más de 40 o que no vaya de media en media (2.3) → "Entre 0,5 y 40 horas, de media en media"
export function errorDeHoras(horas) {
  throw new Error("Sin hacer");
}

// ✍️ TU TURNO ─────────────────────────────────────────────────────────────────
// ✍️ 1 · El alta. conectarAlta(form, taller, alCambiar): al ENVIAR el formulario (botón o Enter), sin recargar:
//        1. Lee los datos (leerAlta) y valida:
//             cliente vacío → "Escribe el nombre del cliente"
//             bici vacía    → "Escribe qué bici es"
//             horas         → lo que diga errorDeHoras
//        2. Cada mensaje, en su <p data-error-de="…"> (o "" si ese campo está bien), y el campo con
//           aria-invalid="true" si tiene error (y SIN el atributo si está bien).
//        3. Si hay errores: el foco al PRIMER campo con error (en el orden del formulario), no se da de alta
//           nada y lo escrito se queda como está.
//        4. Si no hay errores: taller.nuevaReparacion(datos), el formulario se vacía, el foco vuelve al cliente
//           y se llama a alCambiar(reparacionNueva) una vez.
export function conectarAlta(form, taller, alCambiar) {
  throw new Error("Sin hacer");
}

// ➕ OPCIONAL (para ir a por nota) · Editar las horas en el sitio. celda es un <span class="horas">2 h</span>:
//        editarHoras(celda, horas, alGuardar)
//          - en la celda queda SOLO un <input name="horas" type="number" step="0.5"> con las horas y con el foco;
//          - Enter: si errorDeHoras da un error, el campo se queda (con lo escrito) y con aria-invalid="true";
//                   si está bien, la celda vuelve a ser texto con las horas nuevas («2.5 h») y alGuardar(2.5);
//          - Escape: la celda vuelve a ser el texto de antes («2 h») y NO se llama a alGuardar (nada cambia).
export function editarHoras(celda, horas, alGuardar) {
  throw new Error("Sin hacer");
}
