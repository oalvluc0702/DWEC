// Bloque 4 · Herencia (extends, super) y polimorfismo
// Explicación: web → 4.1 Batería → Bloque 4 (y el apartado 8 de la UD4).
// Comprueba con:  ./bateria.sh comprobar 4

// 👀 EJEMPLO RESUELTO: la clase base ──────────────────────────────────────────
export class Publicacion {
  constructor(titulo, anio) {
    this.titulo = titulo;
    this.anio = anio;
  }
  descripcion() {
    return `${this.titulo} (${this.anio})`;
  }
  diasPrestamo() {
    return 14;
  }
}

// ✍️ TU TURNO ─────────────────────────────────────────────────────────────────
// ✍️ 1 · Libro hereda de Publicacion y añade el autor.
//        new Libro("Momo", 1973, "Ende").descripcion() → "Momo (1973) · Ende"
//        Reutiliza la descripción de la base con super: no vuelvas a escribir el título y el año.
export class Libro extends Publicacion {
  constructor(titulo, anio, autor) {
    super(titulo, anio);
    throw new Error("Sin hacer");
  }
}

// ✍️ 2 · Revista hereda de Publicacion y añade el número. Se presta solo 7 días.
//        new Revista("Muy Interesante", 2026, 512).descripcion() → "Muy Interesante (2026) · nº 512"
export class Revista extends Publicacion {
  constructor(titulo, anio, numero) {
    super(titulo, anio);
    throw new Error("Sin hacer");
  }
}

// ✍️ 3 · La descripción de cada publicación de la lista. Sin preguntar de qué tipo es cada una:
//        cada objeto ya sabe describirse (eso es el polimorfismo).
export function catalogo(publicaciones) {
  throw new Error("Sin hacer");
}

// ✍️ 4 · La suma de los días de préstamo de todas.   [libro, revista, revista] → 14 + 7 + 7 = 28
export function diasTotales(publicaciones) {
  throw new Error("Sin hacer");
}
