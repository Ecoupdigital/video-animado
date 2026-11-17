#!/usr/bin/env bash
# Tira um frame (1080 x 1920) por tempo pedido do vídeo final, para a revisão, e monta a folha.
# Uso (de qualquer pasta): bash _ferramentas/frames.sh <pasta-do-episodio> t1 t2 ...
# Lê <pasta-do-episodio>/out/ep.mp4. Saída: <pasta-do-episodio>/frames/NN_<t>s.png e frames/_folha.jpg
# Bash 3.2 ou mais novo.

if [ $# -lt 2 ]; then
  echo "Uso: bash _ferramentas/frames.sh <pasta-do-episodio> t1 t2 ..."
  exit 1
fi
ep="$1"
shift
video="$ep/out/ep.mp4"
if [ ! -f "$video" ]; then
  echo "falta $video (renderize antes)"
  exit 1
fi
mkdir -p "$ep/frames"
rm -f "$ep"/frames/*.png "$ep"/frames/_folha.jpg
i=0
for t in "$@"; do
  i=$((i + 1))
  n=$(printf %02d "$i")
  ffmpeg -v error -y -ss "$t" -i "$video" -frames:v 1 "$ep/frames/${n}_${t}s.png" || exit 1
  # cópia pequena com o tempo escrito, só para montar a folha
  ffmpeg -v error -y -i "$ep/frames/${n}_${t}s.png" -vf "scale=360:-2,drawtext=text='$t s':x=10:y=10:fontsize=26:fontcolor=red" "$ep/frames/_seq_${n}.png" 2>/dev/null ||
    ffmpeg -v error -y -i "$ep/frames/${n}_${t}s.png" -vf "scale=360:-2" "$ep/frames/_seq_${n}.png"
done
colunas=6
if [ "$i" -lt 6 ]; then colunas=$i; fi
linhas=$(((i + 5) / 6))
ffmpeg -v error -y -i "$ep/frames/_seq_%02d.png" -vf "tile=${colunas}x${linhas}" -frames:v 1 -q:v 3 "$ep/frames/_folha.jpg" && echo "ok $ep/frames/_folha.jpg"
rm -f "$ep"/frames/_seq_*.png
