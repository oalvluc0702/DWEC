// 🔮 PREDICCIONES · Escribe lo que crees que da cada expresión ANTES de probarla.
// Cambia cada undefined por tu respuesta (un número, true/false o un texto entre comillas).
// Luego: ./bateria.sh comprobar 1  → te dice el PORQUÉ de las que aciertas y una pista de las que fallas.
// Para probar una expresión de verdad: ./bateria.sh probar "const a = { n: 1 }; const b = a; b.n = 2; a.n"
export const predicciones = {
  p1: undefined, // const a = { n: 1 }; const b = a; b.n = 2; a.n
  p2: undefined, // const a = { n: 1 }; const b = { ...a }; b.n = 2; a.n
  p3: undefined, // const a = { x: { n: 1 } }; const b = { ...a }; b.x.n = 2; a.x.n
  p4: undefined, // Object.keys({ a: 1, b: 2 }).length
  p5: undefined, // typeof { saludo() { return "hola"; } }.saludo
};
