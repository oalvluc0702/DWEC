// Bloque 2 · Prototipos: lo que hay debajo de class
// Explicación: web → 4.1 Batería → Bloque 2 (y el apartado 6 de la UD4).
// Comprueba con:  ./bateria.sh comprobar 2

// 👀 EJEMPLO RESUELTO ─────────────────────────────────────────────────────────
// La forma clásica: una función constructora + el método en su prototype (UNA vez para todos).
export function Lector(nombre) {
  this.nombre = nombre;
}
Lector.prototype.saludar = function () {
  return `Hola, soy ${this.nombre}`;
};

// 🪜 ESCALERA ──────────────────────────────────────────────────────────────────
// 🪜 1 · ¿Es una propiedad PROPIA del objeto?   esPropia(Object.create({ a: 1 }), "a") → false
export function esPropia(objeto, clave) {
  throw new Error("Sin hacer");
}

// 🪜 2 · ¿Se encuentra la propiedad en el objeto O en su cadena de prototipos?
//        estaEnLaCadena({}, "toString") → true      (pista: el operador in)
export function estaEnLaCadena(objeto, clave) {
  throw new Error("Sin hacer");
}

// ✍️ TU TURNO ─────────────────────────────────────────────────────────────────
// ✍️ 1 · Escribe la función constructora Socio(nombre, curso), igual que Lector, con un método
//        presentarse() que devuelva "Soy Ana, de 2º DAW". El método NO puede estar dentro de cada socio.
export function Socio(nombre, curso) {
  throw new Error("Sin hacer");
}

// ✍️ 2 · Crea un objeto cuyo PROTOTIPO sea `base` (no una copia) y que tenga una propiedad propia nombre.
//        Lo de base (por ejemplo un método saludo) tiene que funcionar en el objeto nuevo sin copiarlo.
export function crearDesde(base, nombre) {
  throw new Error("Sin hacer");
}

// ✍️ 3 · ¿Cuántos prototipos hay por encima del objeto hasta llegar a null?
//        niveles({}) → 1 (Object.prototype) · niveles(Object.create(null)) → 0 · niveles(new Lector("x")) → 2
//        (pista: Object.getPrototypeOf en un bucle)
export function niveles(objeto) {
  throw new Error("Sin hacer");
}
