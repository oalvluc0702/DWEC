import { catalogoInicial } from "./datos/catálogo.js";
import {
  calcularPrecioUnitarioFinal,
  calcularTotalVenta
} from "./servicios/calculadora.js";

// Caso 1: Chrono Trigger (45€, usado-como-nuevo, se venden 3 unidades)
const chrono = catalogoInicial.find((juego) => juego.id === 1);
const unitarioCaso1 = calcularPrecioUnitarioFinal(chrono, 3);
const totalCaso1 = calcularTotalVenta(unitarioCaso1, 3);

console.log(`Caso 1 - Unitario: ${unitarioCaso1}€ | Total: ${totalCaso1}€`);
// Output esperado: Caso 1 - Unitario: 42.75€ | Total: 128.25€

// Caso 2: Streets of Rage 2 (60€, nuevo-precintado, se venden 4 unidades)
const sor2 = catalogoInicial.find((juego) => juego.id === 2);
const unitarioCaso2 = calcularPrecioUnitarioFinal(sor2, 4);
const totalCaso2 = calcularTotalVenta(unitarioCaso2, 4);

console.log(`Caso 2 - Unitario: ${unitarioCaso2}€ | Total: ${totalCaso2}€`);
// Output esperado: Caso 2 - Unitario: 67.50€ | Total: 270€