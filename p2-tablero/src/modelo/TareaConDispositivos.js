import { Tarea } from "./Tarea.js";

export class TareaConDispositivos extends Tarea{
    #dispositivos;
    constructor(titulo,prioridad,limite,dispositivos){
        super(titulo, prioridad, limite);
        this.#dispositivos = new Map(
            dispositivos.map((dispositivo) =>
            [

                dispositivo,
                null

            ])
        )
    }
    get dispositivos(){
        const devuelta_dispositivos = []
        for (const dispositivo of this.#dispositivos){
            devuelta_dispositivos.push({"nombre": dispositivo,
                                        "fallos": this.#dispositivos.get(dispositivo)                   
            })
        }
        return devuelta_dispositivos;
    }
    probar(nombre, fallos){
        if (!this.#dispositivos.has(nombre)){
            throw new RangeError("el dispositivo no se encuentra en la lista");
        }
        if (!Number.isInteger(fallos) || fallos < 0){
            throw new RangeError("los fallos no es un número o es menor que 0");
        }
        this.#dispositivos.set(nombre, fallos);
    }
    comprobarPaso(desde,hasta){
        if (hasta !== "Hecho") return;            
        const lista_fallidos = []
        for (const dispositivo of this.#dispositivos){
            const fallos = this.#dispositivos.get(dispositivo)
            if (fallos > 0){
                lista_fallidos
            }
        }
        const fallidos = 
        if (fallidos.length > 0) throw new PruebasFallidasError(fallidos);
    }
}