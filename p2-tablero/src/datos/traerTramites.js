import {obtenerJSON} from "./red.js";
import { guardarTablero} from "./persistencia.js";
const PRIORIDAD = {
    "toda" : "alta",
    "alguna": "media",
    "ninguna": "baja"
}
function aDatos(elemento){
    if (!elemento.gestion && elemento.gestion === ""){
        throw new Error("no hay elemento")
        
    }
    const prioridad = PRIORIDAD[elemento.prisa]
    if (elemento.prioridad === undefined){
        throw new Error("no tiene prioridad")
    }
    
    return {titulo, prioridad, limite}
}
export async function traerTramites(tablero, {url,fetchFn = fetch ,storage = localStorage}) {
// sin hacer todavía
}