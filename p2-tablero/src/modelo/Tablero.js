// Tablero.js — Bloque A · ✍️ A3 (el tablero) y A5 (reglas).
// En el bloque C volverás aquí para ✍️ C4 (toJSON y desdeJSON).
// El tablero TIENE tres columnas: es composición, no hereda de nadie.
import { Columna } from "./Columna.js";
import { ColumnaLlenaError, MovimientoNoPermitidoError } from "./errores.js";
import { Tarea } from "./Tarea.js";
import { TareaRecurrente } from "./TareaRecurrente.js";
import { aDatos, desdeDatos } from "./serializar.js";

export class Tablero {
  static COLUMNAS = Object.freeze(["Por hacer", "En curso", "Hecho"]);
  static VERSION_DATOS = 1; // (bloque C) si algún día cambia el formato guardado, se sube
  // Privado: #columnas, un Map nombre → Columna
  #columnas;

  // ✍️ A3 ──────────────────────────────────────────────────────────────────────
  constructor(limiteEnCurso = 3) {
    // Crea las tres columnas; solo «En curso» lleva límite WIP (limiteEnCurso)
    this.#columnas = new Map(
      Tablero.COLUMNAS.map(nombre => [
        nombre,
        new Columna(nombre, nombre === "En curso" ? limiteEnCurso : null)
      ])
    )
  }

  // static desde(datos, limiteEnCurso): un Tablero con una tarea por cada objeto de datos
  //   (usa crearTarea)
    static desde(datos, limiteEnCurso = 3) {
    const tablero = new Tablero(limiteEnCurso)
    for (const d of datos){
      const tarea = tablero.crearTarea(d);

      tablero.columna("Por hacer").añadir(tarea)
    }
    return tablero;
  }
  // columna(nombre): la Columna, o un Error si no existe (que el mensaje lleve el nombre)
  columna(nombre) {
    if (!this.#columnas.has(nombre)) throw new Error(`No existe la columna: ${nombre}`);
    
    return this.#columnas.get(nombre);
  }
  // get columnas: array con las tres columnas, en orden
   get columnas(){
      return [...this.#columnas.values()]
    }
  // crearTarea(datos): TareaRecurrente si datos trae cadaDias, Tarea si no → a «Por hacer»
  //   y la devuelve. datos es un objeto { titulo, prioridad, limite, cadaDias }: saca cada campo
  //   y pásaselo al constructor, en su orden (new Tarea(datos) NO vale: espera el título)
    crearTarea(datos){
      const{titulo, prioridad, limite, cadaDias} = datos
      if ('cadaDias' in datos){
        return new TareaRecurrente(titulo,prioridad,limite,cadaDias);
      } else{
        return new Tarea(titulo,prioridad,limite);
      }
    }

  // buscar(id): la tarea, esté en la columna que esté, o null
  buscar(id){
    let existe = false;
    for(const columna of this.#columnas.values()){
      existe = columna.tiene(id);
      if (existe) {
          const tarea = columna.find(t => t.id === id);
          return tarea;
        }
      }
      return null;
    }
    
  
  // dondeEsta(id): la Columna donde está, o null
    dondeEsta(id){
      let existe = false;
      for(const columna of this.#columnas.values()){
      existe = columna.tiene(id);

      if (existe) return columna;

      }
      return null;
    }
  
  // mover(id, destino): Error si no existe la tarea · Error si la columna destino está llena
  //   (¡comprueba ANTES de quitarla de su columna, o se perdería!) · la mueve y la devuelve

  mover(id, destino) {
    // 1. Obtenemos la columna destino (si no existe, lanzará el error automáticamente)
    const columnaDestino = this.columna(destino);

    // 2. Validar si la tarea existe
    if (!this.buscar(id)) return new Error("No existe la tarea");

    // 3. Validar si la columna destino está llena
    if (columnaDestino.llena) return new Error("La columna esta llena");

    // 4. Acción
    const tarea = this.buscar(id);
    const columnaOrigen = this.dondeEsta(id);
    
    columnaOrigen.quitar(id);
    columnaDestino.añadir(tarea);
    
    return tarea;
  }

  // completar(id): la mueve a «Hecho» y añade a «Por hacer» lo que devuelva tarea.alCompletar()
  //   ⚠️ Sin preguntar si es recurrente: eso es el polimorfismo
  completar(id){
    const tareaCompletada = this.mover(id,"Hecho");
    
    if(tareaCompletada instanceof Error )return tareaCompletada;

    const nuevasTareas = tareaCompletada.alCompletar();
    
    const porHacer = this.columna("Por hacer")
    for (const nuevaTarea of nuevasTareas ){
        porHacer.añadir(nuevaTarea);
    }
  }

  // resumen(hoy = new Date()): { porHacer, enCurso, hecho, vencidas }
  //   vencidas = las que estaVencida(hoy) y NO están en «Hecho»

  // ✍️ A5 · Reglas (vuelves a mover y completar) ─────────────────────────────────
  //   - Columna llena → ColumnaLlenaError (en vez de un Error cualquiera)
  //   - Sacar una tarea de «Hecho», o «moverla» a la columna en la que ya está →
  //     MovimientoNoPermitidoError. Todo se comprueba ANTES de tocar nada.
  //   Pista: mover y completar hacen casi lo mismo. Un método privado #trasladar(id, destino)
  //   con las comprobaciones evita escribirlas dos veces.

  // ✍️ C4 (bloque C) ────────────────────────────────────────────────────────────
  // toJSON(): { version, limiteEnCurso, columnas: { "Por hacer": [datos…], … } }
  //   JSON.stringify(tablero) lo llama solo. Sin él sale "{}": los # no se ven. Usa aDatos.

  /** Lo contrario de toJSON: el MISMO tablero (columnas, ids y límite WIP). Lanza si no encaja. */
  static desdeJSON(datos) {
    throw new Error("Sin hacer");
  }
  
}

// Comprueba con:  docker compose run --rm web npm test bloque-a
(void Columna,
  ColumnaLlenaError,
  MovimientoNoPermitidoError,
  Tarea,
  TareaRecurrente,
  aDatos,
  desdeDatos); // (borra esta línea cuando los uses)
