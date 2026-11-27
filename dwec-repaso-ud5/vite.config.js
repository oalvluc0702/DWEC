// vite.config.js — Vite sirve la página de la batería en http://localhost:5173 (dentro de Docker).
// No hace falta tocarlo.
export default {
  server: {
    host: "0.0.0.0", // para poder abrirla desde tu navegador, fuera del contenedor
    port: 5173,
    strictPort: true,
    // En Windows y Mac, Docker no siempre avisa de que has guardado: así Vite lo mira él mismo
    watch: { usePolling: true, interval: 300 },
  },
};
