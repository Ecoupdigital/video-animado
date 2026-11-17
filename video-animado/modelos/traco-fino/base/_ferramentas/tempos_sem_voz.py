# Prévia sem voz: tempos sintéticos a partir do roteiro, sem gastar crédito de voz.
# Lê <pasta-do-episodio>/roteiro-falas.json  ([{"quem": "rita", "texto": "...", "tempo": "antes"}, ...]) e grava
#   src/falas.json    quem fala de quando a quando (cerca de 2,6 palavras por segundo, pausa de 0,35 s), com o
#                     "tempo" de cada fala (antes ou agora; sem ele, agora)
#   src/textos.json   o texto de cada fala, que a legenda reparte por frase pelo número de palavras
#   src/palavras.json cada palavra com início e fim (em segundos), como o transcrever.py
#   src/volume.json   volume por frame (30 fps): a boca oscila só dentro das falas, zero no silêncio
#   public/sfx/       os 4 efeitos
# Uso (na raiz do universo): python3 _ferramentas/tempos_sem_voz.py <pasta-do-episodio> [palavras-por-segundo]
import json, math, os, sys
from gerar_sfx import garantir_sfx

FPS = 30
PAUSA = 0.35
if len(sys.argv) < 2:
    sys.exit('Uso: python3 tempos_sem_voz.py <pasta-do-episodio> [palavras-por-segundo]')
ep = sys.argv[1]
ritmo = float(sys.argv[2]) if len(sys.argv) > 2 else 2.6
arq = os.path.join(ep, 'roteiro-falas.json')
if not os.path.isfile(arq):
    sys.exit(f'falta {arq}: grave o roteiro como [{{"quem": "<id>", "texto": "..."}}]')
roteiro = json.load(open(arq, encoding='utf-8'))
if not isinstance(roteiro, list) or not roteiro or any(not isinstance(x, dict) or not x.get('quem') or not str(x.get('texto', '')).strip() for x in roteiro):
    sys.exit('roteiro-falas.json: lista de falas, cada uma com "quem" e "texto" (e "tempo": "antes" ou "agora")')
quem = {x['quem'] for x in roteiro}
if len(quem) > 1:
    print(f'aviso: neste modelo só a narradora fala, e o roteiro tem {len(quem)} vozes ({", ".join(sorted(quem))})')

falas, palavras, trechos = [], [], []
t = 0.0
for item in roteiro:
    ps = str(item['texto']).split()
    d = max(0.9, len(ps) / ritmo)
    fala = {'quem': item['quem'], 'ini': round(t, 3), 'fim': round(t + d, 3)}
    if item.get('tempo') in ('antes', 'agora'):
        fala['tempo'] = item['tempo']
    falas.append(fala)
    # cada palavra ocupa um pedaço da fala proporcional ao tamanho dela
    pesos = [len(p) + 1 for p in ps]
    total = sum(pesos)
    ini = t
    for p, peso in zip(ps, pesos):
        fatia = d * peso / total
        palavras.append({'texto': p, 'inicio': round(ini, 3), 'fim': round(ini + fatia * 0.9, 3)})
        trechos.append((ini, ini + fatia * 0.9))
        ini += fatia
    t += d + PAUSA

n = int(math.ceil((t + 0.5) * FPS))
volume = []
for f in range(n):
    s = f / FPS
    v = 0.0
    for a, b in trechos:
        if a <= s <= b:
            # oscila como sílabas (~5 por segundo), sem fechar no meio da palavra
            v = 0.3 + 0.6 * abs(math.sin(math.pi * 5 * (s - a)))
            break
    volume.append(round(v, 3))

os.makedirs(os.path.join(ep, 'src'), exist_ok=True)
json.dump(falas, open(os.path.join(ep, 'src', 'falas.json'), 'w'), ensure_ascii=False, indent=1)
json.dump(palavras, open(os.path.join(ep, 'src', 'palavras.json'), 'w'), ensure_ascii=False, indent=1)
json.dump(volume, open(os.path.join(ep, 'src', 'volume.json'), 'w'))
json.dump([str(x['texto']).strip() for x in roteiro], open(os.path.join(ep, 'src', 'textos.json'), 'w'), ensure_ascii=False, indent=1)
garantir_sfx(os.path.join(ep, 'public', 'sfx'))
if os.path.isfile(os.path.join(ep, 'public', 'narracao.mp3')):
    print('aviso: public/narracao.mp3 existe e vai tocar na prévia fora de sincronia; apague para a prévia sem voz')
print(f'{len(falas)} falas, {len(palavras)} palavras, {round(t - PAUSA, 2)} s de fala (prévia sem voz, nenhum crédito gasto)')
print(json.dumps(falas, ensure_ascii=False))
