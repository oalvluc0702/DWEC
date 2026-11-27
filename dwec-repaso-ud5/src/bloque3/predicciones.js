// 🔮 PREDICCIONES · Cambia cada undefined por lo que crees que da (un número, un texto entre comillas, true/false, [..]…).
// Cada línea se puede ejecutar tal cual en la consola del navegador (F12) o con «Probar» en la página del kit.
export const predicciones = {
  p1: undefined, // let n = 0; const b = document.createElement("button"); b.addEventListener("click", () => n++); b.addEventListener("click", () => n++); b.click(); n
  p2: undefined, // let n = 0; const b = document.createElement("button"); b.addEventListener("click", () => n++); b.removeEventListener("click", () => n++); b.click(); n
  p3: undefined, // let n = 0; const b = document.createElement("button"); b.addEventListener("click", () => n++, { once: true }); b.click(); b.click(); n
  p4: undefined, // let quien; const b = document.createElement("button"); b.id = "b"; b.addEventListener("click", function () { quien = this.id; }); b.click(); quien
  p5: undefined, // let quien; class Caja { nombre = "caja"; constructor(b) { b.addEventListener("click", function () { quien = this.nombre; }); } } const b = document.createElement("button"); b.nombre = "botón"; new Caja(b); b.click(); quien
  p6: undefined, // let t; const b = document.createElement("button"); b.innerHTML = "<span>ok</span>"; b.addEventListener("click", (e) => { t = [e.target.tagName, e.currentTarget.tagName]; }); b.querySelector("span").click(); t
};
