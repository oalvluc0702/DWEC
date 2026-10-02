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

let seguir = false;
do{

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
            console.log("\n=== CATÁLOGO COMPLETO ===");
            console.log(formatearCatalogo(catalogoActual));
            break;

          case 2: {
            const cat = prompt("Introduce la categoría a buscar (ej: RPG, Lucha, Plataformas):");
            // Operador && para validar que haya escrito texto
            if (cat && cat.trim() !== "") {
              const filtrados = filtrarPorCategoria(catalogoActual, cat);
              console.log(`\n=== CATÁLOGO (Categoría: ${cat}) ===`);
              console.log(formatearCatalogo(filtrados));
            } else {
              console.log("Categoría no válida.");
            }
            break;
          }

          case 3: {
            const stockBajo = obtenerProductosStockBajo(catalogoActual);
            console.log("\n=== PRODUCTOS CON STOCK BAJO ===");
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
              console.log("\n=== PRODUCTO ENCONTRADO ===");
              console.log(formatearProducto(producto));
            } else {
              console.log(`\n❌ No existe ningún producto con el ID: ${idInput}`);
            }
            break;
          }

          case 2: {
            const tituloInput = prompt("Introduce el título (o parte de él):");
            const resultados = buscarProductosPorTitulo(catalogoActual, tituloInput);

            if (resultados.length > 0) {
              console.log(`\n=== RESULTADOS DE BÚSQUEDA (${resultados.length}) ===`);
              console.log(formatearCatalogo(resultados));
            } else {
              console.log(`\n❌ No se encontraron productos que contengan: "${tituloInput ?.trim() ?? ''}"`);
            }
            break;
          }

          default:
            console.log("Opción de submenú no válida.");
            break;
        }
        break;
      }
    case 3:
      break;
    case 4:
      break;
    case 5:
      break;
    case 6:
      seguir = false;
      break;
    default:
      console.log("selecciona una opción correcta")
      break;
  }
} while (seguir);