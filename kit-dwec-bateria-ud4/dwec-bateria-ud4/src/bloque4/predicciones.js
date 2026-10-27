// 🔮 PREDICCIONES · Cambia cada undefined por lo que crees que da. Luego: ./bateria.sh comprobar 4
// Para las tres primeras:  class A { hola() { return "A"; } }
//                          class B extends A { hola() { return "B" + super.hola(); } }
export const predicciones = {
  p1: undefined, // new B().hola()
  p2: undefined, // new B() instanceof A
  p3: undefined, // Object.getPrototypeOf(B) === A
  p4: undefined, // class X { constructor() { this.n = 1; } } class Y extends X { constructor() { super(); this.n++; } }; new Y().n
};
