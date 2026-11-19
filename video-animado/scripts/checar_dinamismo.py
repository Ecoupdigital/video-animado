#!/usr/bin/env python3
# Mede o dinamismo de um vídeo pronto: quantos cortes tem, o maior trecho sem corte e o ritmo da fala.
# Uso: python3 checar_dinamismo.py <video.mp4> [palavras.json da transcrição]
# Corte = troca brusca de imagem (plano, cenário ou enquadramento), detectada pelo ffmpeg.
# Metas (SKILL.md, "Regra de dinamismo"): nenhum trecho com mais de 3 s sem corte, média de até 2,5 s
# por plano, primeiro corte até os 2 s e fala a partir de 2,6 palavras por segundo.
# Também reprova o excesso: mais de 2 planos com menos de 1 s ou média abaixo de 1,6 s por plano.
# Sai 1 se alguma meta falhar, 0 se todas passarem. Só precisa de ffmpeg e ffprobe.
import json, re, subprocess, sys

if len(sys.argv) < 2:
    sys.exit('Uso: python3 checar_dinamismo.py <video.mp4> [palavras.json]')
video = sys.argv[1]
dur = float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', video]))
saida = subprocess.run(['ffmpeg', '-hide_banner', '-i', video, '-vf', "select='gt(scene,0.25)',showinfo", '-an', '-f', 'null', '-'], capture_output=True, text=True).stderr
cortes = [float(x) for x in re.findall(r'pts_time:([0-9.]+)', saida)]
# cortes a menos de 0,4 s um do outro contam como um só (clarão, tremor)
limpos = []
for c in cortes:
    if not limpos or c - limpos[-1] >= 0.4: limpos.append(c)
marcos = [0.0] + limpos + [dur]
planos = [(marcos[i], marcos[i + 1]) for i in range(len(marcos) - 1)]
maior = max(planos, key=lambda p: p[1] - p[0])
media = dur / len(planos)
falhas = []
print(f'duração {dur:.1f} s · {len(limpos)} cortes · {len(planos)} planos · média {media:.1f} s por plano')
print(f'maior trecho sem corte: {maior[1] - maior[0]:.1f} s (de {maior[0]:.1f} a {maior[1]:.1f} s)')
longos = [p for p in planos if p[1] - p[0] > 3.0]
if longos: falhas.append('trechos com mais de 3 s sem corte: ' + ', '.join(f'{a:.1f}-{b:.1f} s' for a, b in longos))
curtos = [p for p in planos if p[1] - p[0] < 1.0]
if len(curtos) > 2: falhas.append('rápido demais: ' + str(len(curtos)) + ' planos com menos de 1 s (' + ', '.join(f'{a:.1f}-{b:.1f} s' for a, b in curtos) + '). Ninguém entende o que viu')
if media < 1.6: falhas.append(f'rápido demais: média de {media:.1f} s por plano (o mínimo é 1,6 s)')
if media > 2.5: falhas.append(f'média de {media:.1f} s por plano (meta: até 2,5 s)')
if not limpos or limpos[0] > 2.0: falhas.append('primeiro corte só depois dos 2 s (o começo precisa prender)')
if len(sys.argv) > 2:
    w = json.load(open(sys.argv[2]))
    fala = w[-1]['fim'] - w[0]['inicio']
    ritmo = len(w) / fala
    print(f'fala: {len(w)} palavras em {fala:.1f} s = {ritmo:.1f} palavras por segundo')
    if ritmo < 2.6: falhas.append(f'fala a {ritmo:.1f} palavras por segundo (meta: 2,6 ou mais)')
if falhas:
    print('REPROVADO no dinamismo:')
    for f in falhas: print(' -', f)
    sys.exit(1)
print('ok, dinamismo dentro das metas')
