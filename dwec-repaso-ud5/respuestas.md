# Explícalo con tus palabras

Cuando tengas el comprobador en verde, contesta aquí sin mirar los apuntes (2–4 líneas cada una).

1. En `conectarAcciones`, ¿qué es `e.target` y qué es `e.currentTarget` cuando se pulsa el `<span>` de dentro de un
   botón? ¿Por qué hace falta `closest` y por qué el id se pasa por `Number()`?

2. En `MarcadorHoras`, ¿qué pasaría si el listener fuera `function () { this.sumar(…) }` o si pasaras `this.sumar` sin
   más? ¿Y por qué `desconectar()` no funciona si a `removeEventListener` le das `() => this.sumar(…)`?

3. Explica la diferencia entre `preventDefault()` y `stopPropagation()` con un ejemplo de este repaso. ¿Por qué
   `stopPropagation` puede romper una delegación?

4. En el simulacro, ¿por qué los listeners de `submit` y de `keydown` van en la lista y no en el formulario?

5. ➕ (si has hecho los opcionales) ¿Qué pasa si llamas a `addEventListener` dentro de `pintar()`? ¿Cómo lo
   detectarías en el navegador (F12)? ¿Qué pasa con el formulario abierto si se repinta por otra acción, y por qué?
