// Bloque 6 · Integrador: la biblioteca del instituto
// Une lo de los bloques 4 (publicaciones) y 5 (socios y PrestamoError). Explicación: web → 4.1 Batería → Bloque 6.
// Comprueba con:  ./bateria.sh comprobar 6
import { PrestamoError, Socio } from "../bloque5/composicion.js";

// ✍️ La clase Biblioteca, con todo en campos PRIVADOS (pista: tres Map):
//   - el catálogo: isbn → publicación (un Libro o una Revista del bloque 4)
//   - qué está prestado: isbn → nombre del socio
//   - los socios: nombre → Socio
//
//   alta(isbn, publicacion)    → PrestamoError si el isbn ya existe
//   registrar(nombre, maximo)  → crea el Socio, lo guarda y lo devuelve
//   prestar(isbn, nombre, hoy) → PrestamoError si no existe el isbn, si ya está prestado o si no existe el socio.
//                                Los días de préstamo los decide la PUBLICACIÓN (diasPrestamo): ¡polimorfismo!
//   devolver(isbn)             → PrestamoError si no está prestado
//   disponibles()              → las descripciones de lo que NO está prestado
//   informeVencidos(hoy)       → [{ socio: "Ana", isbn: "222" }, …]
export class Biblioteca {
  alta(isbn, publicacion) {
    throw new Error("Sin hacer");
  }
}

// (Para que ESLint no avise mientras no las uses)
void PrestamoError;
void Socio;
