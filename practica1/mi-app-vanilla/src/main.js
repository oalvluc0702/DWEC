import { catalogoInicial } from "./datos/catálogo.js";
import {
  calcularPrecioUnitarioFinal,
  calcularTotalVenta
} from "./servicios/calculadora.js";
import {
  buscarProductoPorId,
  buscarProductosPorTitulo,
  filtrarPorCategoria,
  obtenerProductosStockBajo,
  registrarVenta,
  reponerStock,
  gestorVentas,
  generarInformeCaja
} from "./servicios/inventario.js";
import {
  formatearCatalogo,
  formatearProducto
} from "./utilidades/formato.js";

let catalogoActual = [...catalogoInicial];

function iniciarAplicacion() {
  let seguir = true;

  do {
    const entrada = prompt(
      " RetroStock — Gestor de Inventario \n" +
        "1. Ver Catálogo\n" +
        "2. Buscar Producto\n" +
        "3. Registrar una Venta\n" +
        "4. Reponer Stock\n" +
        "5. Informe de Caja\n" +
        "6. Salir\n\n" +
        "Selecciona una opción (1-6):"
    );
    let opciones = Number(entrada ?? 0);

    switch (opciones) {
      case 1: {
        // Submenú de catálogo
        const subOpcion = prompt(
          "--- Ver Catálogo ---\n" +
            "1. Todo el catálogo\n" +
            "2. Filtrar por categoría\n" +
            "3. Solo productos con stock bajo\n\n" +
            "Selecciona una vista (1-3):"
        );

        const sub = Number(subOpcion ?? 0);

        switch (sub) {
          case 1:
            console.log("\n--- CATÁLOGO COMPLETO ---");
            console.log(formatearCatalogo(catalogoActual));
            break;

          case 2: {
            const cat = prompt("Introduce la categoría a buscar (ej: RPG, Lucha, Plataformas):");
            if (cat && cat.trim() !== "") {
              const filtrados = filtrarPorCategoria(catalogoActual, cat);
              console.log(`\n--- CATÁLOGO (Categoría: ${cat}) ---`);
              console.log(formatearCatalogo(filtrados));
            } else {
              console.log("Categoría no válida.");
            }
            break;
          }

          case 3: {
            const stockBajo = obtenerProductosStockBajo(catalogoActual);
            console.log("\n--- PRODUCTOS CON STOCK BAJO ---");
            console.log(formatearCatalogo(stockBajo));
            break;
          }

          default:
            console.log("Opción de submenú no válida.");
            break;
        }
        break;
      }

      case 2: {
        // Submenú de Búsqueda
        const subOpBuscador = prompt(
          "--- Búsqueda de Productos ---\n" +
            "1. Buscar por ID exacto\n" +
            "2. Buscar por título parcial\n\n" +
            "Selecciona una opción (1-2):"
        );

        const subBuscador = Number(subOpBuscador ?? 0);

        switch (subBuscador) {
          case 1: {
            const idInput = prompt("Introduce el ID exacto del producto:");
            const producto = buscarProductoPorId(catalogoActual, idInput);

            if (producto) {
              console.log("\n--- PRODUCTO ENCONTRADO ---");
              console.log(formatearProducto(producto));
            } else {
              console.log(`\nNo existe ningún producto con el ID: ${idInput}`);
            }
            break;
          }

          case 2: {
            const tituloInput = prompt("Introduce el título (o parte de él):");
            const resultados = buscarProductosPorTitulo(catalogoActual, tituloInput);

            if (resultados.length > 0) {
              console.log(`\n--- RESULTADOS DE BÚSQUEDA (${resultados.length}) ---`);
              console.log(formatearCatalogo(resultados));
            } else {
              console.log(`\nNo se encontraron productos que contengan: "${tituloInput?.trim() ?? ''}"`);
            }
            break;
          }

          default:
            console.log("Opción de submenú no válida.");
            break;
        }
        break;
      }

      case 3: {
        // Registrar venta
        const idVenta = prompt("Introduce el ID del producto a vender:");
        const producto = buscarProductoPorId(catalogoActual, idVenta);
        // aquí si el producto no existe se sale del case
        if (!producto) {
          console.log("Error: No existe ningún producto con ese ID.");
          break;
        }
        //pedimos la cantidad de la venta
        const cantidadPedida = Number(prompt(`¿Cuántas unidades de "${producto.titulo}" quieres vender?`));
        // si la cantidad que se pide es menor o igual a 0 o si no es un número, nos dirá que no es válida
        if (isNaN(cantidadPedida) || cantidadPedida <= 0) {
          console.log("Cantidad no válida.");
        } 
        //si no hay stock suficiente lo mismo
        else if (cantidadPedida > producto.stock) {
          console.log(`Stock insuficiente. Unidades disponibles: ${producto.stock}`);
        } else {
          const precioUnitario = calcularPrecioUnitarioFinal(producto, cantidadPedida);
          const totalVenta = calcularTotalVenta(precioUnitario, cantidadPedida);
          // aqui creamos la venta
          const nuevaVenta = {
            idProducto: producto.id,
            titulo: producto.titulo,
            cantidad: cantidadPedida,
            precioUnitario,
            total: totalVenta
          };
          // la registramos en nuestro gestor de ventas (esto es para poder luego generar los informes)
          gestorVentas.registrar(nuevaVenta);
          
          catalogoActual = registrarVenta(catalogoActual, producto.id, cantidadPedida);
          const productoActualizado = buscarProductoPorId(catalogoActual, producto.id);
          // aqui se va a generar el ticket de la venta, solo si el producto se ha vendido
          console.log("\n--- TICKET DE VENTA ---");
          console.log(`Producto: ${producto.titulo}`);
          console.log(`Unidades: ${cantidadPedida}`);
          console.log(`Precio unitario final: ${precioUnitario.toFixed(2)} €`);
          console.log(`Total operación: ${totalVenta.toFixed(2)} €`);
          console.log(`Stock restante: ${productoActualizado.stock}`);

          if (productoActualizado.stock < 3) {
            console.log("Aviso: El producto ha quedado en stock bajo.");
          }
        }
        break;
      }

      case 4: {
        // Reponer stock
        const idReposicion = prompt("Introduce el ID del producto a reponer:");
        const producto = buscarProductoPorId(catalogoActual, idReposicion);

        if (!producto) {
          console.log("Error: No existe ningún producto con ese ID.");
          break;
        }

        const cantidadReponer = Number(prompt(`¿Cuántas unidades deseas añadir a "${producto.titulo}"?`));

        if (isNaN(cantidadReponer) || cantidadReponer <= 0) {
          console.log("Cantidad no válida.");
        } else {
          catalogoActual = reponerStock(catalogoActual, producto.id, cantidadReponer);
          const productoActualizado = buscarProductoPorId(catalogoActual, producto.id);

          console.log(`\nStock actualizado. Nuevo stock de "${producto.titulo}": ${productoActualizado.stock} unds.`);
        }
        break;
      }

      case 5: {
        // Informe de caja
        const informe = generarInformeCaja(catalogoActual);
        const { totalFacturado, valorStockRestante, productoMasVendido, hayStockBajo } = informe;

        console.log("\n--- INFORME DE CAJA DE LA SESIÓN ---");
        console.log(`1. Total facturado: ${totalFacturado} €`);
        console.log(`2. Valor total del inventario restante: ${valorStockRestante} €`);
        console.log(`3. Producto más vendido: ${productoMasVendido}`);

        const estadoAlertas = hayStockBajo
          ? "Atención: Existen productos por debajo del umbral de stock bajo."
          : "Sin alertas: Todos los productos están por encima del umbral mínimo.";

        console.log(`4. Estado del stock: ${estadoAlertas}`);
        break;
      }

      case 6:
        console.log("\nSaliendo del programa.");
        seguir = false;
        break;

      default:
        console.log("Selecciona una opción correcta (1-6).");
        break;
    }
  } while (seguir);
}

// Ejecución
iniciarAplicacion();