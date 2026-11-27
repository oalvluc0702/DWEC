# DWEC · Repaso para el Parcial 2: DOM y eventos (UD5)

**Opcional** y **no cuenta para la nota**: es para preparar el examen del martes 1 de diciembre. El escenario es el
taller de bicis «La Cadena»: el modelo ya viene hecho en `src/modelo/` (no se toca) y tú haces la página.

Se trabaja **igual que en la práctica**: todo con `docker compose` (Node y Vite van dentro del contenedor; en tu
ordenador no se instala nada más).

```bash
docker compose run --rm web npm install            # 1 vez, con internet (happy-dom y Vite)
docker compose run --rm web npm run comprobar      # todos los bloques (al principio, 5 de 34 en verde: los ejemplos)
docker compose run --rm web npm run comprobar 3    # solo el bloque 3 (con un 💡 en cada ejercicio y el porqué de cada predicción)
docker compose up                                  # la página del taller en http://localhost:5173 (Ctrl+C para pararla)
```

1. Lee la explicación de cada bloque en la web de DWEC: **Practicar → 🎯 Repaso Parcial 2 → UD5 · DOM y eventos**.
2. **Por bloques y en el orden que quieras**: cada bloque es su fichero (`src/bloque1` … `src/bloque6`) y no necesita
   los demás (solo el opcional `montarLista` usa tu `pintarLista` del bloque 2). Haz solo los que te cuesten y comprueba ese bloque con `docker compose run --rm web npm run comprobar N`.
3. Los ejercicios marcados **➕ OPCIONAL** son para ir a por nota: el comprobador los enseña aparte y no cuentan en el
   total.
4. El bloque 6 es un **simulacro**: la página del taller ya funciona (`src/bloque6/taller-app.js`) y le tienes que
   añadir «Añadir pieza». El enunciado está al principio del fichero. El comprobador te dice cuántos puntos llevas de 5
   (el punto 6 es opcional).
5. Para **ver y depurar** tu código: `docker compose up` y abre **http://localhost:5173**. Cada bloque tiene su página
   de prueba con tus funciones; se recarga sola cada vez que guardas y, con **F12**, puedes ver el HTML cambiar, usar
   la consola y poner puntos de parada en `src/`.
6. Al terminar, contesta `respuestas.md`.
