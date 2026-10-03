import { umbral_stock_bajo } from "../config/tablas.js";

// Formatea un producto individual para mostrarlo en pantalla
export const formatearProducto = (producto) => {
  const avisoStock = producto.stock <= umbral_stock_bajo ? " ⚠ Stock bajo" : "";

  const plataformas = producto.plataforma.join(", ");
  const categorias = producto.categoria.join(", ");

  return `[ID: ${producto.id}] ${producto.titulo} (${plataformas}) | Cat: ${categorias} | Estado: ${producto["estado de conservación"]} | Precio Base: ${producto["precio base"].toFixed(2)}€ | Stock: ${producto.stock}${avisoStock}`;
};

// Formatea el catálogo para luego mostrarlo
export const formatearCatalogo = (catalogo) => {
  if (catalogo.length === 0) return "No se encontraron productos en el catálogo.";
  return catalogo.map(formatearProducto).join("\n");
};