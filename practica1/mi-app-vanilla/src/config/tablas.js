// Tabla A: descuento o recargo
export const ajuste_estado = {
    "nuevo-precintado": 0.25,
    "usado-como-nuevo": 0.00,
    "usado-caja-danada": -0.15,
    "solo-cartucho": -0.30
};
// Tabla C: umbral de stock
export const umbral_stock_bajo = 3;

// Tabla B: descuentos, dependiendo de la cantidad de objetos comprados descuenta más o menos
export const obtenerDescuentoVolumen = (cantidad) =>{
    if (cantidad >= 4) return 0.10;
    if (cantidad >= 2) return 0.05;
    return 0.00;
};