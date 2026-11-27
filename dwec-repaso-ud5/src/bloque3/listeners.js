// Bloque 3 · Listeners y el objeto evento
// Explicación: web de DWEC → Practicar → UD 5.2 · Repaso para el Parcial 2 → Bloque 3 (y los apartados 9, 10.4 y 11 de la UD5).
// Comprueba con:  docker compose run --rm web npm run comprobar 3

// 👀 EJEMPLO RESUELTO ─────────────────────────────────────────────────────────
// Al pulsar el botón, escribe en `salida` qué evento ha sido y la acción del botón que lo escucha:
//   <button data-accion="empezar"><span>🔧</span> Empezar</button>  →  «click en empezar»
// Devuelve una función que lo desconecta.
//   - e.currentTarget es el botón (el que escucha), aunque se pulse el <span> de dentro (eso es e.target).
//   - La función tiene NOMBRE: así removeEventListener recibe la MISMA y la puede quitar.
export function vigilar(boton, salida) {
  function alPulsar(e) {
    salida.textContent = `${e.type} en ${e.currentTarget.dataset.accion}`;
  }
  boton.addEventListener("click", alPulsar);
  return () => boton.removeEventListener("click", alPulsar);
}

// 🪜 ESCALERA ──────────────────────────────────────────────────────────────────
// 🪜 1 · La PRIMERA vez que se pulse el botón, llama a accion(id) con el data-id del botón como número.
//        Las siguientes veces, nada.   <button data-id="7">  →  accion(7), una sola vez
export function soloUnaVez(boton, accion) {
  throw new Error("Sin hacer");
}

// 🪜 2 · En el campo de las horas (<input type="number">), con el teclado:
//        - flecha arriba (ArrowUp): suma 0.5 a lo que haya escrito;
//        - flecha abajo (ArrowDown): resta 0.5, pero nunca baja de 0.5;
//        - con las flechas, que el navegador NO haga además lo suyo (preventDefault);
//        - con cualquier otra tecla, nada.
//        Si pone "2" → ArrowUp → "2.5".
export function flechasHoras(campo) {
  throw new Error("Sin hacer");
}

// ✍️ TU TURNO ─────────────────────────────────────────────────────────────────
// ✍️ 1 · Un marcador de horas unido a un botón:  <button data-paso="0.5">+½ h</button>  y un <output>.
//        new MarcadorHoras(boton, salida)
//          - cada clic en el botón llama a this.sumar(paso del botón, como número);
//        sumar(paso): suma a las horas (privadas, empiezan en 0) y escribe «2.5 h» en la salida.
//        get horas: las horas que lleva.
//        desconectar(): a partir de ahí, los clics ya no suman.
//        Cuidado con `this` dentro del listener, y con qué función le das a removeEventListener.
export class MarcadorHoras {
  constructor(boton, salida) {
    throw new Error("Sin hacer");
  }

  sumar(paso) {
    throw new Error("Sin hacer");
  }

  get horas() {
    throw new Error("Sin hacer");
  }

  desconectar() {
    throw new Error("Sin hacer");
  }
}

// ➕ OPCIONAL (para ir a por nota) · Atajos de teclado de la página. UN listener de keydown en raiz:
//        - «n» → acciones.nueva(), pero NO si se está escribiendo en un campo (input o textarea)
//          ni si va con Control (Ctrl+N es del navegador);
//        - «Escape» → acciones.cerrar(), esté donde esté el foco (también dentro de un campo).
//        Devuelve una función que quita los atajos.
export function atajos(raiz, acciones) {
  throw new Error("Sin hacer");
}
