import { umbral_stock_bajo } from "../config/tablas.js";

// OPERACIONES DE BÚSQUEDA Y FILTRADO 

// Buscar producto por ID o título parcial usando .find()
export const buscarProducto = (catalogo, criterio) => {
  if (!criterio) return null;

  const criterioLimpio = String(criterio).trim().toLowerCase();

  return (
    catalogo.find((producto) => {
      const coincideId = String(producto.id) === criterioLimpio;
      const coincideTitulo = producto.titulo
        .toLowerCase()
        .includes(criterioLimpio);
      return coincideId || coincideTitulo;
    }) ?? null
  );
};

// Filtrar por categoría
export const filtrarPorCategoria = (catalogo, categoria) => {
  return catalogo.filter((producto) =>
    producto.categoria.some(
      (cat) => cat.toLowerCase() === categoria.trim().toLowerCase()
    )
  );
};

// Filtrar productos umbral bajo
export const obtenerProductosStockBajo = (catalogo) => {
  return catalogo.filter((producto) => producto.stock < umbral_stock_bajo);
};

// VENTAS E INFORMES

// Registrar venta
export const registrarVenta = (catalogo, idProducto, cantidad) => {
  return catalogo.map((producto) => {
    if (producto.id === idProducto) {
      return {
        ...producto,
        stock: producto.stock - cantidad
      };
    }
    return producto;
  });
};

// Reponer stock
export const reponerStock = (catalogo, idProducto, cantidad) => {
  return catalogo.map((producto) => {
    if (producto.id === idProducto) {
      return {
        ...producto,
        stock: producto.stock + cantidad
      };
    }
    return producto;
  });
};


const crearGestorVentas = () => {
  let historialVentas = []; // aquí van las ventasss

  return {
    registrar: (venta) => {
      historialVentas = [...historialVentas, venta];
    },
    obtenerHistorial: () => [...historialVentas]
  };
};

export const gestorVentas = crearGestorVentas();

// Informe de caja
export const generarInformeCaja = (catalogo) => {
  const ventas = gestorVentas.obtenerHistorial();

  // Total facturado
  const totalFacturado = ventas.reduce((acc, v) => acc + v.total, 0);

  // Valor total del stock restante
  const valorStockRestante = catalogo.reduce((acc, prod) => {
    return acc + prod["precio base"] * prod.stock;
  }, 0);

  // Producto más vendido de la sesión
  const unidadesPorProducto = ventas.reduce((acc, v) => {
    acc[v.titulo] = (acc[v.titulo] ?? 0) + v.cantidad;
    return acc;
  }, {});

  let productoMasVendido = "Ninguno (sin ventas)";
  let maxCantidad = 0;

  for (const [titulo, cantidad] of Object.entries(unidadesPorProducto)) {
    if (cantidad > maxCantidad) {
      maxCantidad = cantidad;
      productoMasVendido = `${titulo} (${cantidad} unidades)`;
    }
  }

  // Aviso de productos en stock bajo
  const hayStockBajo = catalogo.some((prod) => prod.stock < umbral_stock_bajo);

  return {
    totalFacturado: totalFacturado.toFixed(2),
    valorStockRestante: valorStockRestante.toFixed(2),
    productoMasVendido,
    hayStockBajo
  };
};