#!/usr/bin/env bash
# Prévia rápida: renderiza o episódio em meia resolução e monta uma folha com um frame por tempo pedido.
# Uso (de qualquer pasta): bash _ferramentas/previa.sh <pasta-do-video> t1 t2 t3 ...
# Saída: <pasta-do-video>/revisao/previa.mp4 e <pasta-do-video>/revisao/folha.png
# Roda da raiz do universo (onde estão node_modules e remotion.config.ts). Bash 3.2 ou mais novo.

if [ $# -lt 1 ]; then
  echo "Uso: bash _ferramentas/previa.sh <pasta-do-video> t1 t2 ..."
  exit 1
fi
ep="$1"
shift
if [ ! -d "$ep" ]; then
  echo "pasta do episódio não encontrada: $ep"
  exit 1
fi
ep="$(cd "$ep" && pwd)"
raiz="$(cd "$(dirname "$0")/.." && pwd)"
cd "$raiz" || exit 1
if [ ! -f "$ep/src/index.ts" ]; then
  echo "falta $ep/src/index.ts (copie _ferramentas/episodio-base/src para a pasta do episódio)"
  exit 1
fi

mkdir -p "$ep/revisao" "$ep/public"
npx remotion render "$ep/src/index.ts" ep "$ep/revisao/previa.mp4" --public-dir="$ep/public" --scale=0.5 --log=error || exit 1

rm -f "$ep"/revisao/f_*.png
i=0
for t in "$@"; do
  i=$((i + 1))
  saida="$ep/revisao/f_$(printf %02d "$i").png"
  # com o tempo escrito no canto; se o ffmpeg não tiver drawtext, sai sem o tempo
  ffmpeg -v error -y -ss "$t" -i "$ep/revisao/previa.mp4" -frames:v 1 -vf "scale=270:-2,drawtext=text='$t s':x=8:y=8:fontsize=22:fontcolor=red" "$saida" 2>/dev/null ||
    ffmpeg -v error -y -ss "$t" -i "$ep/revisao/previa.mp4" -frames:v 1 -vf "scale=270:-2" "$saida"
done
if [ "$i" -eq 0 ]; then
  echo "ok $ep/revisao/previa.mp4 (sem tempos, sem folha)"
  exit 0
fi
colunas=6
if [ "$i" -lt 6 ]; then colunas=$i; fi
linhas=$(((i + 5) / 6))
ffmpeg -v error -y -i "$ep/revisao/f_%02d.png" -vf "tile=${colunas}x${linhas}" -frames:v 1 "$ep/revisao/folha.png" && echo "ok $ep/revisao/folha.png"
