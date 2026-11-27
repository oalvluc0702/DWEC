// taller.js · El taller: las reparaciones y los mecánicos. Ya está hecho: no hace falta tocarlo.
//
//   taller.nuevaReparacion({ cliente, bici, horas, urgente })  → la reparación nueva («pendiente»)
//   taller.contratar(nombre, max)                               → el mecánico
//   taller.asignar(id, nombreMecanico)   «pendiente» → «en-taller»   (ErrorMecanicoLleno, ErrorEstado, ErrorTaller)
//   taller.terminar(id)                  «en-taller» → «lista»       (ErrorEstado, ErrorTaller)
//   taller.buscar(id)  taller.reparaciones()  taller.pendientes()  taller.facturacion
import { ErrorEstado, ErrorTaller } from "./errores.js";
import { Mecanico } from "./mecanico.js";
import { Reparacion, ReparacionUrgente } from "./reparacion.js";

export { ErrorTaller, ErrorEstado } from "./errores.js";
export { ErrorMecanicoLleno } from "./errores.js";
export { Reparacion, ReparacionUrgente, PRECIO_HORA } from "./reparacion.js";
export { Mecanico } from "./mecanico.js";

export class Taller {
  #reparaciones = [];
  #mecanicos = new Map();

  nuevaReparacion({ cliente, bici, horas, urgente = false }) {
    const r = urgente ? new ReparacionUrgente(cliente, bici, horas) : new Reparacion(cliente, bici, horas);
    this.#reparaciones.push(r);
    return r;
  }

  contratar(nombre, max) {
    const m = new Mecanico(nombre, max);
    this.#mecanicos.set(m.nombre, m);
    return m;
  }

  buscar(id) {
    return this.#reparaciones.find((r) => r.id === id) ?? null;
  }

  #buscarOFallar(id) {
    const r = this.buscar(id);
    if (!r) throw new ErrorTaller(`No existe la reparación ${id}`, { id });
    return r;
  }

  asignar(id, nombreMecanico) {
    const r = this.#buscarOFallar(id);
    const m = this.#mecanicos.get(nombreMecanico);
    if (!m) throw new ErrorTaller(`No trabaja aquí ningún mecánico llamado ${nombreMecanico}`, { mecanico: nombreMecanico });
    if (r.estado !== "pendiente") throw new ErrorEstado(id, r.estado);
    m.asignar(r); // si está lleno, lanza ErrorMecanicoLleno y no cambia nada
    r.empezar();
  }

  terminar(id) {
    const r = this.#buscarOFallar(id);
    r.terminar();
    for (const m of this.#mecanicos.values()) m.liberar(id);
  }

  reparaciones() {
    return [...this.#reparaciones];
  }

  pendientes() {
    return this.#reparaciones.filter((r) => r.estado === "pendiente");
  }

  get facturacion() {
    const listas = this.#reparaciones.filter((r) => r.estado === "lista");
    return Math.round(listas.reduce((suma, r) => suma + r.total, 0) * 100) / 100;
  }
}
