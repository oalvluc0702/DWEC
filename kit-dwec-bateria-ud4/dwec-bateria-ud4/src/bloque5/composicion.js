// Bloque 5 · Composición, Map, Date, Intl y errores propios
// Explicación: web → 4.1 Batería → Bloque 5 (y los apartados 9 y 10 de la UD4).
// Comprueba con:  ./bateria.sh comprobar 5

// 👀 EJEMPLO RESUELTO: un error propio ────────────────────────────────────────
// Heredar de Error permite distinguir «un préstamo no permitido» (se le explica al usuario) de un fallo del programa.
export class PrestamoError extends Error {
  constructor(mensaje, isbn) {
    super(mensaje);
    this.name = this.constructor.name; // "PrestamoError"
    this.isbn = isbn;
  }
}

// 🪜 ESCALERA ──────────────────────────────────────────────────────────────────
// 🪜 1 · La fecha con formato español: formatoFecha(new Date(2026, 10, 3)) → "03/11/2026"
//        (pista: Intl.DateTimeFormat("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" }))
export function formatoFecha(fecha) {
  throw new Error("Sin hacer");
}

// ✍️ TU TURNO ─────────────────────────────────────────────────────────────────
// ✍️ 1 · La fecha de devolución: `dias` días después de `desde`, a la MISMA hora.
//        - No cambies `desde` (trabaja sobre una copia).
//        - Suma días con setDate, no milisegundos: el 25/10 cambia la hora y ese día dura 25 h.
export function fechaDevolucion(desde, dias) {
  throw new Error("Sin hacer");
}

// ✍️ 2 · Un Socio TIENE préstamos (composición): guárdalos en un Map PRIVADO isbn → fecha de devolución.
//   - constructor(nombre, maximo = 3)
//   - get numPrestamos → cuántos tiene
//   - prestar(isbn, hoy, dias = 14): lanza PrestamoError si ya tiene ese isbn o si ya está en el máximo
//   - devolver(isbn): lanza PrestamoError si no lo tiene
// ✍️ 3 · Y en la misma clase:
//   - vencidos(hoy) → los isbn cuya fecha de devolución es ANTERIOR al día de hoy. Cuenta por días: lo que vence
//     hoy aún no está vencido, sea la hora que sea.
export class Socio {
  constructor(nombre, maximo = 3) {
    throw new Error("Sin hacer");
  }
}
