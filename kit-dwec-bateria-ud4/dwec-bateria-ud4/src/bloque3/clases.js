// Bloque 3 · Clases: constructor que valida, getters/setters, campos #privados, static y el this perdido
// Explicación: web → 4.1 Batería → Bloque 3 (y el apartado 7 de la UD4).
// Comprueba con:  ./bateria.sh comprobar 3

// 👀 EJEMPLO RESUELTO ─────────────────────────────────────────────────────────
// Un campo privado (#valor) que solo se puede leer con un getter y cambiar con un método.
export class Contador {
  #valor = 0;
  incrementar() {
    this.#valor++;
    return this; // devolver this permite encadenar: c.incrementar().incrementar()
  }
  get valor() {
    return this.#valor;
  }
}

// 🪜 ESCALERA ──────────────────────────────────────────────────────────────────
// 🪜 1 · Una clase Punto con x e y, y un método distanciaAlOrigen().  new Punto(3, 4).distanciaAlOrigen() → 5
//        (pista: Math.hypot)
export class Punto {
  constructor(x, y) {
    throw new Error("Sin hacer");
  }
}

// ✍️ TU TURNO ─────────────────────────────────────────────────────────────────
// ✍️ 1 · La clase Libro:
//   - constructor(titulo, autor, paginas). El título se guarda SIN espacios al principio y al final, y si está
//     vacío (o no es un texto) se lanza un Error: un libro sin título no se crea.
//   - paginas en un campo PRIVADO #paginas, con un getter y un SETTER que lanza un Error si no es un entero > 0
//     (y en ese caso no cambia nada). El constructor también tiene que pasar por el setter.
//   - un getter esLargo: true a partir de 400 páginas.
//   - resumen() → "Momo (Ende), 300 págs."
// ✍️ 2 · Y en la misma clase, lo que es de la CLASE y no de cada libro (static):
//   - Libro.creados: cuántos libros se han creado (un contador privado y static, con un getter static).
//   - Libro.desde({ titulo, autor, paginas }) → un Libro nuevo a partir de un objeto.
export class Libro {
  constructor(titulo, autor, paginas) {
    throw new Error("Sin hacer");
  }
}

// ✍️ 3 · Devuelve una FUNCIÓN que, al llamarla suelta (avisar()), devuelva libro.resumen().
//        Si devuelves libro.resumen tal cual, se pierde this. ¿Cómo lo evitas? (apartado 7.7)
export function crearAvisador(libro) {
  throw new Error("Sin hacer");
}
