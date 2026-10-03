# 🎮 RetroStock — Gestor de Inventario y Ventas

Aplicación de consola interactiva desarrollada en **JavaScript** para la gestión de inventario de videojuegos retros y ventas de los mismos

---

## 📑 Índice

- [Arquitectura del Proyecto](#-arquitectura-del-proyecto)
- [Documentación del Modelo de Datos](#-documentación-del-modelo-de-datos-catalogo)
- [Justificación Técnica e Inmutabilidad](#-justificación-técnica-e-inmutabilidad)
- [Depuración del Proyecto](#-depuración-del-proyecto-uso-de-breakpoints)
- [Instrucciones de Ejecución](#-instrucciones-de-ejecución)

---

## 🏗 Arquitectura del Proyecto

El proyecto sigue una estructura modular orientada a la separación de responsabilidades:

```text
src/
├── config/
│   └── tablas.js         # Reglas de negocio (Tablas A, B y C: ajustes y umbrales)
├── datos/
│   └── catálogo.js       # Estado inicial de los productos
├── servicios/
│   ├── calculadora.js    # Lógica de cálculo de precios y descuentos
│   └── inventario.js     # Operaciones de búsqueda, filtrado, ventas y caja (Closure)
├── utilidades/
│   └── formato.js        # Formateo de texto para la salida por consola
└── main.js                # Bucle principal de la aplicación y submenús interactivos
```

---

## 📦 Documentación del Modelo de Datos (`catalogo`)

Para la gestión del catálogo de videojuegos retro, se ha diseñado una estructura de datos basada en un **Array de Objetos** en JavaScript (`catalogoInicial`).

Con este diseño podemos usar un array auxiliar que clone los datos de (`catalogoInicial`) y poder usar las funciones en el para no mutar el array original

### 🔍 Estructura del Objeto Producto

Cada videojuego dentro del catálogo sigue el siguiente esquema:

```javascript
{
  "id": number,                        // Identificador único numérico
  "titulo": string,                    // Nombre completo del videojuego
  "plataforma": string[],              // Lista de plataformas soportadas (Array)
  "categoria": string[],               // Lista de géneros/categorías asociadas (Array)
  "precio base": number,               // Precio en euros sin aplicar multiplicadores
  "estado de conservación": string,    // Clave exacta correspondiente a la Tabla A
  "stock": number                      // Cantidad de unidades disponibles
}
```

> **💡 Justificación de diseño:** las propiedades `plataforma` y `categoria` se han definido como arrays de cadenas (`string[]`) debido a que un mismo videojuego puede haber sido lanzado en múltiples plataformas (ej. *Dr. Mario* en Game Boy y SNES) o pertenecer a varios géneros simultáneamente (ej. *Castlevania* como RPG, Plataformas y Acción).

---

## ⚙ Justificación Técnica

### Programación Funcional

- La actualización del inventario (ventas y reposiciones) se realiza de forma **inmutable**, devolviendo nuevos arrays con `.map()` y copias de objetos mediante el operador spread (`...producto`).
- Se evita el uso de métodos mutantes como `.push()` o `.splice()`.
- La variable `catalogoActual` en `main.js` reasigna su referencia tras cada operación exitosa para mantener el estado acumulado durante la sesión.

### Cierre o Closure (`gestorVentas`)

El historial de ventas de la sesión se gestiona mediante una función generadora (`crearGestorVentas`) que encapsula la variable `historialVentas` dentro de un ámbito privado, permitiendo registrar y consultar operaciones sin exponer el estado global.

### Separación de Lógica de Búsqueda

Se implementan funciones diferenciadas para evitar colisiones:

| Función | Método usado | Propósito |
|---|---|---|
| `buscarProductoPorId` | `.find()` | Obtener un único registro mediante coincidencia exacta |
| `buscarProductosPorTitulo` | `.filter()` + `.includes()` | Búsqueda parcial por texto |

---

## 🛠 Depuración del Proyecto (Uso de Breakpoints)

Durante la fase de pruebas se detectó un problema de lógica en el filtrado de productos con stock bajo: al seleccionar la vista *"Solo productos con stock bajo"*, los productos que tenían un stock exactamente igual a `3` (como *Pokémon Rojo*) no aparecían en el listado, a pesar de que la constante `umbral_stock_bajo` estaba fijada en `3`.

### Proceso de depuración paso a paso

1. **Punto de interrupción (Breakpoint)**
   Se colocó un breakpoint en el archivo `src/servicios/inventario.js`, en la línea del `filter` dentro de la función `obtenerProductosStockBajo`:

   ```javascript
   return catalogo.filter((producto) => producto.stock <= umbral_stock_bajo);
   ```

2. **Inspección de variables**
   Al ejecutar la opción de filtro por stock bajo, se pausó la ejecución y se inspeccionó en el panel *Watch/Variables* el valor del objeto `producto` al evaluar *Pokémon Rojo* (`stock: 3`).

3. **Causa raíz identificada**
   Se observó que la condición utilizada comparaba con el operador estrictamente menor (`producto.stock < umbral_stock_bajo`). Como `3 < 3` evalúa a `false`, el método `.filter()` descartaba el producto.

4. **Solución**
   Se corrigió el operador condicional cambiando `<` por `<=` (`producto.stock <= umbral_stock_bajo`) tanto en `inventario.js` como en `formato.js`, garantizando que los productos en el umbral queden marcados y filtrados correctamente.

---

## 🚀 Instrucciones de Ejecución

1. Con el repositorio clonado ejecutar ```
docker compose up -d```
2. Abrir el navegador y buscar http://localhost:5173.
3. Introducir las opciones en los prompts
---

<p align="center">Hecho con 🕹 y JavaScript ES6+</p>