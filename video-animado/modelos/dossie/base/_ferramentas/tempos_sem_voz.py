# Prévia sem voz: tempos sintéticos a partir do roteiro, sem gastar crédito de voz.
# Lê <video>/roteiro-falas.json (as cenas, com o texto de cada uma) e grava
#   src/words.json    cada palavra com início e fim sintéticos (cerca de 2,8 palavras por segundo, pausa de
#                     0,35 s entre cenas), no formato do transcrever.py
#   src/timing.json   e src/falas.json pelo timing.py (batidas e título nas palavras, como no vídeo de verdade)
#   src/duck.json     ducking sintético (a cama abaixa onde haveria voz)
#   public/sfx/       os efeitos (copiados do kit, ou gerados pelo synth_sfx.py)
# Uso (na raiz do universo): python3 _ferramentas/tempos_sem_voz.py <pasta-do-video> [palavras-por-segundo]
import json, os, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from duck import envelope  # noqa: E402
from synth_sfx import garantir_sfx  # noqa: E402
import timing as tm  # noqa: E402

FPS = 30
PAUSA = 0.35
if len(sys.argv) < 2:
    sys.exit('Uso: python3 _ferramentas/tempos_sem_voz.py <pasta-do-video> [palavras-por-segundo]')
ep = sys.argv[1]
ritmo = float(sys.argv[2]) if len(sys.argv) > 2 else 2.8
try:
    cenas, extras = tm.ler_roteiro(ep)
except tm.ErroRoteiro as e:
    print(e)
    sys.exit(1)

words = []
t = 0.0
for c in cenas:
    ps = str(c['texto']).split()
    d = max(0.9, len(ps) / ritmo)
    pesos = [len(p) + 1 for p in ps]
    total = sum(pesos)
    ini = t
    for p, peso in zip(ps, pesos):
        fatia = d * peso / total
        words.append([p, round(ini, 3), round(ini + fatia * 0.9, 3)])
        ini += fatia
    t += d + PAUSA
os.makedirs(os.path.join(ep, 'src'), exist_ok=True)
json.dump(words, open(os.path.join(ep, 'src', 'words.json'), 'w'), ensure_ascii=False)
try:
    timing, _ = tm.gravar(ep)
except tm.ErroRoteiro as e:
    print(e)
    sys.exit(1)
n = int(round(timing['total'] * FPS))
ativo = [1 if any(a <= f / FPS <= b for _, a, b in words) else 0 for f in range(n)]
json.dump(envelope(ativo), open(os.path.join(ep, 'src', 'duck.json'), 'w'))
garantir_sfx(os.path.join(ep, 'public', 'sfx'))
for nome in ('narracao.wav', 'narracao.mp3'):
    if os.path.isfile(os.path.join(ep, 'public', nome)):
        print(f'aviso: public/{nome} existe e vai tocar na prévia fora de sincronia; apague para a prévia sem voz')
print(f'{len(cenas)} cenas, {len(words)} palavras, {timing["voiceEnd"]} s de narração sintética, vídeo de {timing["total"]} s (nenhum crédito gasto)')
for c in timing['cenas']:
    print(f'  {c["tipo"]:8} {c["ini"]:6.2f} a {c["fim"]:6.2f} s')
