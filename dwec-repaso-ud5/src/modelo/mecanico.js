// mecanico.js · Un mecánico y los trabajos que tiene. Ya está hecho: no hace falta tocarlo.
import { ErrorMecanicoLleno } from "./errores.js";

export class Mecanico {
  #trabajos = [];

  constructor(nombre, max = 2) {
    if (typeof nombre !== "string" || nombre.trim() === "") throw new TypeError("Falta el nombre del mecánico");
    if (!Number.isInteger(max) || max < 1) throw new RangeError("El máximo de trabajos es un entero desde 1");
    this.nombre = nombre.trim();
    this.max = max;
  }

  asignar(reparacion) {
    if (this.#trabajos.length >= this.max) throw new ErrorMecanicoLleno(this.nombre, this.max);
    this.#trabajos.push(reparacion);
  }

  liberar(id) {
    this.#trabajos = this.#trabajos.filter((r) => r.id !== id);
  }

  get trabajos() {
    return [...this.#trabajos];
  }

  get libres() {
    return this.max - this.#trabajos.length;
  }
}
