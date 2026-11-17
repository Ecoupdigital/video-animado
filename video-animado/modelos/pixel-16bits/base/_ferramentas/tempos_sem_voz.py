# Prévia sem voz: tempos e bocas sintéticos a partir do roteiro, sem gastar crédito de voz.
# Lê <video>/roteiro-falas.json (as seções) e grava
#   src/dados.ts      cada palavra com início sintético (cerca de 2,8 palavras por segundo, pausa de 0,35 s entre
#                     seções) e a boca sintética nas palavras (C, B, D, B a cada 0,09 s; X no silêncio), CAMINHO "sintetico"
#   src/roteiro.json  a cópia do roteiro que o episódio lê
#   src/falas.json    começo e fim de cada seção (o gerar_vitrine.mjs usa)
#   public/px/ e public/sons/   os sprites do boneco e os sons
# Uso (na raiz do universo): python3 _ferramentas/tempos_sem_voz.py <pasta-do-video> [palavras-por-segundo]
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import roteiro as rt  # noqa: E402

PAUSA = 0.35
if len(sys.argv) < 2:
    sys.exit('Uso: python3 _ferramentas/tempos_sem_voz.py <pasta-do-video> [palavras-por-segundo]')
ep = sys.argv[1]
ritmo = float(sys.argv[2]) if len(sys.argv) > 2 else 2.8
try:
    r = rt.ler(ep)
    rt.preparar_public(ep)
except rt.ErroRoteiro as e:
    print(e)
    sys.exit(1)

palavras = []
bocas = []
ciclo = ['C', 'B', 'D', 'B']
t = 0.2
for s in r['secoes']:
    ps = rt.palavras_de(s['texto'])
    d = max(0.9, len(ps) / ritmo)
    pesos = [len(p) + 1 for p in ps]
    total = sum(pesos)
    for p, peso in zip(ps, pesos):
        fatia = d * peso / total
        palavras.append((p, t, t + fatia * 0.85))
        n = max(1, round(fatia * 0.85 / 0.09))
        for q in range(n):
            bocas.append([t + q * 0.09, t + (q + 1) * 0.09, ciclo[(len(palavras) + q) % len(ciclo)]])
        t += fatia
    t += PAUSA
fim = t - PAUSA + 0.2
falas = rt.gravar(ep, r, palavras, bocas, fim, 'sintetico')
for nome in ('narracao.wav', 'narracao.mp3'):
    if os.path.isfile(os.path.join(ep, 'public', nome)):
        print(f'aviso: public/{nome} existe e vai tocar na prévia fora de sincronia; apague para a prévia sem voz')
duracao_final = (r.get('final') or {}).get('duracao', 3)
print(f'{len(falas)} seções, {len(palavras)} palavras, {fim:.2f} s de fala sintética, vídeo de {fim + duracao_final:.2f} s (nenhum crédito gasto)')
for k, f in enumerate(falas, 1):
    print(f'  seção {k}: {f["ini"]:6.2f} a {f["fim"]:6.2f} s')
