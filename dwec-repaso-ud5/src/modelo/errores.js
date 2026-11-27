// errores.js · Los errores propios del taller. Ya está hecho: no hace falta tocarlo.
// Todos son ErrorTaller: en la página se cazan con  if (error instanceof ErrorTaller)  y su mensaje va a #aviso.

export class ErrorTaller extends Error {
  constructor(mensaje, datos = {}) {
    super(mensaje);
    this.name = "ErrorTaller";
    this.datos = datos;
  }
}

export class ErrorMecanicoLleno extends ErrorTaller {
  constructor(mecanico, max) {
    super(`${mecanico} ya tiene ${max} ${max === 1 ? "trabajo" : "trabajos"}: no le caben más`, { mecanico, max });
    this.name = "ErrorMecanicoLleno";
  }
}

export class ErrorEstado extends ErrorTaller {
  constructor(id, estado) {
    super(`La reparación ${id} está «${estado}»: ahora no se puede hacer eso`, { id, estado });
    this.name = "ErrorEstado";
  }
}
