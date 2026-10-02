import { ajuste_estado, obtenerDescuentoVolumen } from "../config/tablas.js";

// una función desclarada con function para cumplir con el requisito
export function calcularPrecioUnitarioFinal(producto, cantidad) {
    const precioBase = producto["precio base"];
    const estado = producto["estado de conservación"];

    // aplicamos la tabla A
    // aqui usamos el ajuste de estado para que si es nuevo-precintado por ejemplo ponga el ejemplo numérico
    const porcentajeEstado = ajuste_estado[estado] ?? 0;
    const precioAjustadoEstado = precioBase * (1 + porcentajeEstado);

    // aplicamos la tabla B
    // aqui obtendremos el porcentaje por volumen y el precio por unidad

    const porcentajeVolumen = obtenerDescuentoVolumen(cantidad);
    //aqui restamos porque siempre es positivo el descuento por volumen, nunca añade
    const precioUnitarioFinal = precioAjustadoEstado * (1 - porcentajeVolumen);

    // Vamos a redondear a 2 decimales siempre (esta función la he sacado de la IA)

    return Number(precioUnitarioFinal.toFixed(2));
}
// función flecha para calcular el total acumulado de la venta
export const calcularTotalVenta = (precioUnitario, cantidad) => {
    return Number((precioUnitario*cantidad).toFixed(2));
};