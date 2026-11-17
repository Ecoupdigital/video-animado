# Prévia sem voz: tempos sintéticos a partir do roteiro, sem gastar crédito de voz.
# Lê <pasta-do-episodio>/roteiro-falas.json  ([{"quem": "bia", "texto": "..."}, ...]) e grava
#   src/falas.json    quem fala de quando a quando (cerca de 2,6 palavras por segundo, pausa de 0,35 s)
#   src/palavras.json cada palavra com início e fim (em segundos), como o transcrever.py
#   src/volume.json   volume por frame (30 fps): a boca oscila só dentro das falas, zero no silêncio
#   public/sfx/       os efeitos
# Uso (na raiz do universo): python3 _ferramentas/tempos_sem_voz.py <pasta-do-episodio> [palavras-por-segundo]
# Cada "quem" é conferido contra o respostas.json do universo: o id (ou o nome) de um personagem, ou "narrador"
# se o narrador estiver ligado. Fala de quem não existe: sai 1 dizendo qual.
import json, math, os, sys
from gerar_sfx import garantir_sfx

FPS = 30
PAUSA = 0.35


def elenco_do_universo(pasta):
    """Ids e nomes dos personagens e se o narrador está ligado, lidos do respostas.json da raiz do universo."""
    d = os.path.abspath(pasta)
    while not os.path.isfile(os.path.join(d, 'respostas.json')):
        pai = os.path.dirname(d)
        if pai == d:
            return None
        d = pai
    r = json.load(open(os.path.join(d, 'respostas.json'), encoding='utf-8'))
    n = r.get('narrador')
    ligado = n is True or (isinstance(n, dict) and n.get('ligado') is True)
    return {'ids': [p.get('id') for p in r.get('personagens', [])], 'nomes': [p.get('nome') or '' for p in r.get('personagens', [])], 'narrador': ligado}


def conferir_quem(quem, onde, elenco):
    """Sai 1 dizendo qual fala tem um "quem" que não é personagem do universo nem o narrador ligado."""
    if elenco is None:
        return
    import unicodedata
    simples = lambda t: ''.join(c for c in unicodedata.normalize('NFD', str(t)) if unicodedata.category(c) != 'Mn').lower().replace(' ', '-')
    if quem == 'narrador':
        if not elenco['narrador']:
            sys.exit(f'{onde}: "narrador", mas o narrador está desligado neste universo (para ligar: "narrador": {{ "ligado": true }} no respostas.json e --aplicar)')
        return
    if quem in elenco['ids'] or simples(quem) in [simples(x) for x in elenco['nomes']]:
        return
    extra = ' ou "narrador"' if elenco['narrador'] else ' (o narrador está desligado)'
    sys.exit(f'{onde}: "{quem}" não é personagem deste universo (aceitos: {", ".join(elenco["ids"])}{extra})')

if len(sys.argv) < 2:
    sys.exit('Uso: python3 tempos_sem_voz.py <pasta-do-episodio> [palavras-por-segundo]')
ep = sys.argv[1]
ritmo = float(sys.argv[2]) if len(sys.argv) > 2 else 2.6
arq = os.path.join(ep, 'roteiro-falas.json')
if not os.path.isfile(arq):
    sys.exit(f'falta {arq}: grave o roteiro como [{{"quem": "<id>", "texto": "..."}}]')
roteiro = json.load(open(arq, encoding='utf-8'))
if not isinstance(roteiro, list) or not roteiro or any(not isinstance(x, dict) or not x.get('quem') or not str(x.get('texto', '')).strip() for x in roteiro):
    sys.exit('roteiro-falas.json: lista de falas, cada uma com "quem" e "texto"')
elenco = elenco_do_universo(ep)
for i, item in enumerate(roteiro):
    conferir_quem(item['quem'], f'roteiro-falas.json, fala {i + 1}', elenco)

falas, palavras, trechos = [], [], []
t = 0.0
for item in roteiro:
    ps = str(item['texto']).split()
    d = max(0.9, len(ps) / ritmo)
    falas.append({'quem': item['quem'], 'ini': round(t, 3), 'fim': round(t + d, 3)})
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
garantir_sfx(os.path.join(ep, 'public', 'sfx'))
if os.path.isfile(os.path.join(ep, 'public', 'narracao.mp3')):
    print('aviso: public/narracao.mp3 existe e vai tocar na prévia fora de sincronia; apague para a prévia sem voz')
print(f'{len(falas)} falas ({sum(1 for f in falas if f["quem"] == "narrador")} do narrador), {len(palavras)} palavras, {round(t - PAUSA, 2)} s de fala (prévia sem voz, nenhum crédito gasto)')
print(json.dumps(falas, ensure_ascii=False))
