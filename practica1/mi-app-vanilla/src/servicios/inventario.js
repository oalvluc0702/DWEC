import { umbral_stock_bajo } from "../config/tablas.js";

// Ahora para gestionar el historial de ventas de la sesión
const crearGestorVentas = () =>{
    let historialVentas = []; //aquí irán las ventas

    return{
        registrar: (venta) =>{
            historialVentas = [...historialVentas,venta];
        },
        obtenerHistorial: () => [...historialVentas]
    };
};
export const gestorVentas = crearGestorVentas();

// informe de caja

export const generarInformeCaja = (catalogo) => {
    const ventas = gestorVentas.obtenerHistorial();

    // total que se ha facturado
    const totalFacturado = ventas.reduce((acc, v) => acc + v.total, 0);
    // total de lo que vale el stock que queda
    const valorStockRestante = catalogo.reduce((acc, prod) => {
    return acc + prod["precio base"] * prod.stock;
  }, 0);
  // producto más vendido de la sesión
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

    