// reparacion.js · Una reparación del taller. Ya está hecho: no hace falta tocarlo.
import { ErrorEstado, ErrorTaller } from "./errores.js";

export const PRECIO_HORA = 25;
const MAX_PIEZAS = 5;
const redondear = (n) => Math.round(n * 100) / 100;

export class Reparacion {
  static #siguienteId = 1;
  #piezas = [];
  #estado = "pendiente"; // "pendiente" → "en-taller" → "lista"

  constructor(cliente, bici, horas, { id, entrada } = {}) {
    if (typeof cliente !== "string" || cliente.trim() === "") throw new TypeError("Falta el cliente");
    if (typeof bici !== "string" || bici.trim() === "") throw new TypeError("Falta la bici");
    if (typeof horas !== "number" || Number.isNaN(horas)) throw new TypeError("Las horas tienen que ser un número");
    if (horas <= 0 || horas > 40) throw new RangeError("Las horas van de 0,5 a 40");
    this.id = id ?? Reparacion.#siguienteId;
    Reparacion.#siguienteId = Math.max(Reparacion.#siguienteId, this.id + 1);
    this.cliente = cliente.trim();
    this.bici = bici.trim();
    this.horas = horas;
    this.entrada = entrada ? new Date(entrada) : new Date();
  }

  // Una reparación desde una línea de texto: "Ana; Orbea; 1.5"
  static desdeLinea(linea) {
    const [cliente, bici, horas] = linea.split(";").map((t) => t.trim());
    return new Reparacion(cliente, bici, Number(horas));
  }

  get estado() {
    return this.#estado;
  }

  anadirPieza(nombre, precio) {
    if (typeof nombre !== "string" || nombre.trim() === "") throw new TypeError("Falta el nombre de la pieza");
    if (typeof precio !== "number" || !(precio > 0)) throw new RangeError("El precio tiene que ser mayor que 0");
    if (this.estado === "lista") throw new ErrorEstado(this.id, this.estado);
    if (this.#piezas.length >= MAX_PIEZAS) {
      throw new ErrorTaller(`Como mucho ${MAX_PIEZAS} piezas por reparación`, { id: this.id, max: MAX_PIEZAS });
    }
    this.#piezas.push({ nombre: nombre.trim(), precio });
  }

  get piezas() {
    return this.#piezas.map((p) => ({ ...p }));
  }

  get total() {
    const piezas = this.#piezas.reduce((suma, p) => suma + p.precio, 0);
    return redondear(this.horas * PRECIO_HORA + piezas);
  }

  get tipo() {
    return "normal";
  }

  empezar() {
    if (this.estado !== "pendiente") throw new ErrorEstado(this.id, this.estado);
    this.#estado = "en-taller";
  }

  terminar() {
    if (this.estado !== "en-taller") throw new ErrorEstado(this.id, this.estado);
    this.#estado = "lista";
  }
}

export class ReparacionUrgente extends Reparacion {
  get total() {
    return redondear(super.total * 1.3);
  }

  get tipo() {
    return "urgente";
  }
}
