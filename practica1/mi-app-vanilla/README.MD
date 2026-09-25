# RetroStock - Gestor de Inventario y Ventas

## 📦 Documentación del Modelo de Datos (`catalogo`)

Para la gestión del catálogo de videojuegos retro en la **Práctica 01**, se ha diseñado una estructura de datos basada en un **Array de Objetos** en JavaScript (`const catalogo = [...]`). 

Con este diseño busco tener facilidad a la hora de tratar los datos del catálogo y a buscar los objetos con los filtros pertinentes de roles.

Prefiero que la plataforma y la categoría sean un array porque un videojuego puede estar en varias plataformas y varias categorías
---

### 🔍 Estructura del Objeto `Producto`

Cada videojuego dentro del catálogo sigue de forma estricta el siguiente esquema:

```javascript
{
  "id": number,                        // Identificador único numérico
  "titulo": string,                    // Nombre completo del videojuego
  "plataforma": string[],              // Lista de plataformas soportadas
  "categoria": string[],               // Lista de géneros/categorías asociadas
  "precio base": number,               // Precio en euros sin aplicar multiplicadores
  "estado de conservación": string,   // Clave exacta correspondiente a la Tabla A
  "stock": number                      // Cantidad de unidades disponibles
}