#!/usr/bin/env bash
#
# bateria.sh — Batería de ejercicios de la UD4 de DWEC (opcional, no cuenta para nota).
#   ./bateria.sh ayuda
#
set -uo pipefail
cd "$(dirname "$0")"
IMAGEN=node:22-alpine

if [ -t 1 ]; then R=$'\e[1;31m'; V=$'\e[1;32m'; N=$'\e[1m'; X=$'\e[0m'; else R=""; V=""; N=""; X=""; fi

# Node (y npm) van en Docker: en tu ordenador no se instala nada más
nodo() {
    if command -v docker >/dev/null 2>&1 && docker info >/dev/null 2>&1; then
        docker run --rm -i -e TZ=Europe/Madrid -e FORCE_COLOR="${FORCE_COLOR:-$([ -t 1 ] && echo 1 || echo 0)}" \
            -u "$(id -u):$(id -g)" -v "$PWD":/app -w /app "$IMAGEN" node "$@"
    else
        echo "${R}✘ No encuentro Docker (o no está arrancado).${X} Instálalo como en la práctica 1: todo va dentro de Docker." >&2
        exit 1
    fi
}

ayuda() {
    cat <<AYUDA
${N}Batería de ejercicios · DWEC UD4 (Objetos y POO)${X} — opcional, para practicar antes del bloque de la práctica

  ./bateria.sh comprobar          todos los bloques: qué llevas bien y qué te falta
  ./bateria.sh comprobar 3        solo el bloque 3 (y el porqué de cada predicción)
  ./bateria.sh probar "EXPR"      ejecuta una expresión y te enseña lo que da, p. ej.:
                                  ./bateria.sh probar "const a = { n: 1 }; const b = a; b.n = 2; a.n"

  Los ejercicios están en src/bloque1 … src/bloque6. La explicación de cada bloque, en la web de DWEC:
  Practicar → UD4 · Objetos y clases. Al acabar, contesta respuestas.md.
AYUDA
}

case "${1:-ayuda}" in
    comprobar) shift; nodo comprobador/comprobar.mjs "$@" ;;
    probar)
        [ -n "${2:-}" ] || { echo "Uso: ./bateria.sh probar \"expresión\""; exit 1; }
        # La última sentencia es la que se enseña: «a; b; c» → muestra c
        # vm devuelve el valor de la última sentencia, como la consola del navegador
        nodo -e "console.log('→', require('util').inspect(require('vm').runInNewContext(process.argv[1])))" "$2" ;;
    ayuda|-h|--help) ayuda ;;
    *) echo "${R}No conozco «$1».${X}"; ayuda; exit 1 ;;
esac
