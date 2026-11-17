#!/usr/bin/env bash
# Deixa o node_modules (o "motor" do Remotion) pronto num universo.
#
# Uso: bash preparar_motor.sh <universo>
#
# Ordem:
#   1. <universo>/node_modules já existe: nada a fazer.
#   2. VIDEO_ANIMADO_MOTOR aponta para um motor (a pasta dele ou o próprio node_modules):
#      cp -al (mesmo disco) ou link simbólico (outro disco).
#   3. Motor conhecido achado na lista de detecção abaixo, com o Remotion na versão do kit: idem.
#   4. Nada achado: npm install no universo (caminho normal no Mac do aluno).
#
# Regra: nunca rodar npm install dentro de um node_modules feito por cp -al ou link,
# porque os arquivos são os mesmos do motor de origem.
# Compatível com o bash 3.2 do Mac.

set -eu

VERSAO_REMOTION="4.0.539"
MARCA=".motor-por-link"

erro() {
  echo "$1" >&2
  exit 1
}

universo="${1:-}"
[ -n "$universo" ] || erro "Uso: bash preparar_motor.sh <universo>"
[ -d "$universo" ] || erro "universo não encontrado: $universo"
universo="$(cd "$universo" && pwd)"
destino="$universo/node_modules"

command -v node >/dev/null 2>&1 || erro "Node não encontrado. Instale o Node 20 ou mais novo (https://nodejs.org) e rode de novo."

# 1. já existe
if [ -e "$destino" ] || [ -L "$destino" ]; then
  if [ -L "$destino" ]; then
    echo "ok: node_modules já existe (link simbólico para $(readlink "$destino")). Nunca rode npm install aqui."
  elif [ -f "$destino/$MARCA" ]; then
    echo "ok: node_modules já existe ($(head -1 "$destino/$MARCA")). Nunca rode npm install aqui."
  else
    echo "ok: node_modules já existe em $universo"
  fi
  exit 0
fi

versao_de() {
  sed -n 's/^[[:space:]]*"version":[[:space:]]*"\([^"]*\)".*/\1/p' "$1/remotion/package.json" 2>/dev/null | head -1
}

motor_valido() {
  [ -d "$1" ] && [ -f "$1/remotion/package.json" ] && [ "$(versao_de "$1")" = "$VERSAO_REMOTION" ]
}

disco_de() {
  df -P "$1" 2>/dev/null | awk 'NR==2 {print $1}'
}

ligar() {
  origem="$1"
  if [ "$(disco_de "$origem")" = "$(disco_de "$universo")" ] && cp -al "$origem" "$destino" 2>/dev/null; then
    # o cache do webpack é regravado no lugar; apagar a cópia só desfaz o link e o Remotion cria arquivos novos
    rm -rf "$destino/.cache"
    printf 'cp -al de %s\n' "$origem" > "$destino/$MARCA"
    echo "ok: node_modules por cp -al de $origem (sem npm). Nunca rode npm install aqui."
  else
    rm -rf "$destino"
    ln -s "$origem" "$destino"
    echo "ok: node_modules por link simbólico para $origem (sem npm). Nunca rode npm install aqui."
  fi
  exit 0
}

# 2. motor indicado
if [ -n "${VIDEO_ANIMADO_MOTOR:-}" ]; then
  m="$VIDEO_ANIMADO_MOTOR"
  [ -d "$m/node_modules" ] && m="$m/node_modules"
  [ -d "$m" ] || erro "VIDEO_ANIMADO_MOTOR aponta para uma pasta que não existe: $VIDEO_ANIMADO_MOTOR"
  m="$(cd "$m" && pwd)"
  if ! motor_valido "$m"; then
    echo "aviso: o motor indicado não tem o Remotion $VERSAO_REMOTION (achado: $(versao_de "$m"))" >&2
  fi
  ligar "$m"
fi

# 3. motor conhecido (só leitura)
# deteccao:inicio (caminhos conhecidos de motor; lista checada pelo conferir_portabilidade.mjs)
for c in "$HOME"/meu-estudio/animacao/*/node_modules /var/lib/openbot/OpenBot/Shared/*-motor/node_modules; do
# deteccao:fim
  [ -d "$c" ] || continue
  [ -L "$c" ] && continue
  case "$c" in "$universo"/*) continue ;; esac
  if motor_valido "$c"; then
    ligar "$(cd "$c" && pwd)"
  fi
done

# 4. nada achado: instala
command -v npm >/dev/null 2>&1 || erro "npm não encontrado. Instale o Node (que traz o npm) e rode de novo."
echo "nenhum motor achado: instalando as bibliotecas com npm install (alguns minutos na primeira vez)..."
(cd "$universo" && npm install --no-audit --no-fund)
echo "ok: node_modules instalado em $universo"
