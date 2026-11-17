# Tempos sem voz, sem gastar crédito, nas duas receitas do modelo Neon retrô:
#   narração inteira (prévia)  tempos sintéticos a partir do texto de cada cena (cerca de 2,8 palavras por segundo,
#                              pausa de 0,35 s entre cenas), como no vídeo de verdade: as batidas caem nas palavras
#   só letreiros               ("receita": "texto-e-musica" no roteiro, ou a receita do universo) cada cena dura um
#                              número inteiro de compassos ("compassos") e cada peça acende numa batida da música:
#                              "batidas": papel -> número do tempo dentro da cena (1 é o primeiro tempo da cena). Sem
#                              batida marcada, o letreiro i acende no começo do compasso i+1 e as peças nos tempos do
#                              padrão (o que no 1, o preço no 2 contando por 2 tempos, o selo no 5, o prazo no 6, a
#                              contagem, o botão e o card no 1).
#                              A música é a cama do kit (120 batidas por minuto, a primeira em 0 s, sfx/ORIGEM.md) ou a
#                              da pessoa (public/musica.mp3 ou .wav): com ela, o roteiro precisa dizer "bpm" e
#                              "primeira_batida" (segundo da primeira batida na música), senão sai 1 dizendo o que falta.
# Lê <video>/roteiro-falas.json e grava
#   src/words.json    (só na prévia da narração) cada palavra com início e fim sintéticos, no formato do transcrever.py
#   src/timing.json   e src/falas.json (na narração, pelo timing.py; na música, aqui, com receita, bpm e primeiraBatida)
#   src/duck.json     ducking sintético na narração (a cama abaixa onde haveria voz); vazio na música (toca cheia)
#   public/sfx/       os efeitos e a cama (copiados do kit, ou gerados pelo synth_sfx.py)
# Uso (na raiz do universo): python3 _ferramentas/tempos_sem_voz.py <pasta-do-video> [palavras-por-segundo]
import json, os, re, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from duck import envelope  # noqa: E402
from synth_sfx import BPM, PRIMEIRA_BATIDA, TEMPOS_POR_COMPASSO, garantir_sfx  # noqa: E402
import timing as tm  # noqa: E402

FPS = 30
PAUSA = 0.35
RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
# tempo (1 = primeiro tempo da cena) de cada peça quando o roteiro não marca: o preço conta por 2 tempos
PADRAO = {'o_que': 1, 'preco': 2, 'selo': 5, 'prazo': 6, 'contagem': 1, 'botao': 1, 'card': 1}


def receita_do_universo():
    arq = os.path.join(RAIZ, 'componentes', 'universo.ts')
    if os.path.isfile(arq):
        m = re.search(r"export const RECEITA[^=]*=\s*\"([a-z-]+)\"", open(arq, encoding='utf-8').read())
        if m:
            return m.group(1)
    return 'narracao-inteira'


def musica_da_pessoa(ep):
    return next((n for n in ('musica.mp3', 'musica.wav') if os.path.isfile(os.path.join(ep, 'public', n))), None)


def previa_narracao(ep, ritmo):
    cenas, _, extras = tm.ler_roteiro(ep)
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
    timing, _ = tm.gravar(ep)
    n = int(round(timing['total'] * FPS))
    ativo = [1 if any(a <= f / FPS <= b for _, a, b in words) else 0 for f in range(n)]
    json.dump(envelope(ativo), open(os.path.join(ep, 'src', 'duck.json'), 'w'))
    for nome in ('narracao.wav', 'narracao.mp3'):
        if os.path.isfile(os.path.join(ep, 'public', nome)):
            print(f'aviso: public/{nome} existe e vai tocar na prévia fora de sincronia; apague para a prévia sem voz')
    print(f'narração inteira (prévia): {len(cenas)} cenas, {len(words)} palavras, {timing["voiceEnd"]} s de narração sintética, vídeo de {timing["total"]} s (nenhum crédito gasto)')
    return timing


def so_letreiros(ep):
    cenas, dados, extras = tm.ler_roteiro(ep, musica=True)
    propria = musica_da_pessoa(ep)
    if propria:
        falta = [k for k in ('bpm', 'primeira_batida') if extras.get(k) is None]
        if falta:
            raise tm.ErroRoteiro(
                f'public/{propria} é a música da pessoa: o roteiro precisa dizer o andamento dela para cada peça cair na batida; '
                f'falta {" e ".join(chr(34) + k + chr(34) for k in falta)} no roteiro-falas.json '
                '(ex.: "bpm": 118 e "primeira_batida": 0.42, o segundo da primeira batida na música); sem isso, apague a música e use a cama do kit'
            )
        bpm, primeira = float(extras['bpm']), float(extras['primeira_batida'])
        if not 40 <= bpm <= 220:
            raise tm.ErroRoteiro(f'"bpm" {bpm} fora de 40 a 220 batidas por minuto')
        if primeira < 0:
            raise tm.ErroRoteiro('"primeira_batida" é o segundo (0 ou mais) da primeira batida na música')
        fonte = f'public/{propria}, {bpm:g} batidas por minuto, primeira em {primeira:g} s'
    else:
        bpm, primeira = float(BPM), float(PRIMEIRA_BATIDA)
        if extras.get('bpm') not in (None, BPM) or extras.get('primeira_batida') not in (None, PRIMEIRA_BATIDA, 0):
            print(f'aviso: sem public/musica.mp3 toca a cama do kit, de {BPM} batidas por minuto com a primeira em {PRIMEIRA_BATIDA:g} s: o "bpm" e a "primeira_batida" do roteiro ficam de fora')
        fonte = f'cama do kit, {BPM} batidas por minuto, primeira em {PRIMEIRA_BATIDA:g} s'
    batida = 60.0 / bpm
    saida, falas = [], []
    tempo0 = 0  # tempos (batidas) antes da cena
    for i, (c, d) in enumerate(zip(cenas, dados)):
        n = c['compassos'] * TEMPOS_POR_COMPASSO
        base = primeira + tempo0 * batida
        b = {}
        marcadas = c.get('batidas') or {}
        papeis = [f'letreiro{k}' for k in range(len(d.get('letreiros') or []))] + sorted(tm.PAPEIS[c['tipo']])
        for papel in papeis:
            if papel in marcadas:
                v = marcadas[papel]
                if not isinstance(v, int) or isinstance(v, bool) or v < 1:
                    raise tm.ErroRoteiro(f'batida "{papel}" da cena {i + 1} ({c["tipo"]}): na receita só letreiros, a batida é o número do tempo dentro da cena (1, 2, 3...), veio {v!r}')
                if v > n:
                    raise tm.ErroRoteiro(f'batida "{papel}" da cena {i + 1} ({c["tipo"]}): o tempo {v} passa dos {n} tempos da cena ({c["compassos"]} compasso(s) de {TEMPOS_POR_COMPASSO})')
            else:
                m = re.fullmatch(r'letreiro(\d+)', papel)
                v = 1 + int(m.group(1)) * TEMPOS_POR_COMPASSO if m else PADRAO[papel]
                if v > n:
                    continue
            b[papel] = round(base + (v - 1) * batida, 3)
        ini = 0.0 if i == 0 else round(base, 3)
        saida.append({**d, 'ini': ini, 'fim': None, 'b': b})
        if c['tipo'] != 'final':
            falas.append({'quem': 'musica', 'ini': ini, 'fim': round(base + n * batida, 3)})
        tempo0 += n
    total = round(primeira + tempo0 * batida, 3)
    for i, c in enumerate(saida):
        c['fim'] = saida[i + 1]['ini'] if i + 1 < len(saida) else total
    tm.conferir_letreiros(saida)
    final = next((c for c in saida if c['tipo'] == 'final'), None)
    timing = {
        'cenas': saida,
        'voiceEnd': final['ini'] if final else total,
        'total': total,
        'receita': 'texto-e-musica',
        'piscada': extras.get('piscada', True),
        'bpm': bpm,
        'primeiraBatida': primeira,
    }
    os.makedirs(os.path.join(ep, 'src'), exist_ok=True)
    json.dump(timing, open(os.path.join(ep, 'src', 'timing.json'), 'w'), ensure_ascii=False, indent=1)
    json.dump(falas, open(os.path.join(ep, 'src', 'falas.json'), 'w'), ensure_ascii=False, indent=1)
    json.dump([], open(os.path.join(ep, 'src', 'duck.json'), 'w'))
    json.dump([], open(os.path.join(ep, 'src', 'words.json'), 'w'))
    for nome in ('narracao.wav', 'narracao.mp3'):
        if os.path.isfile(os.path.join(ep, 'public', nome)):
            print(f'aviso: public/{nome} existe, mas a receita só letreiros não toca voz')
    print(f'só letreiros: {len(cenas)} cenas, {tempo0} tempos ({fonte}), vídeo de {total} s (nenhum crédito gasto)')
    return timing


if __name__ == '__main__':
    if len(sys.argv) < 2:
        sys.exit('Uso: python3 _ferramentas/tempos_sem_voz.py <pasta-do-video> [palavras-por-segundo]')
    ep = sys.argv[1]
    ritmo = float(sys.argv[2]) if len(sys.argv) > 2 else 2.8
    try:
        arq = os.path.join(ep, 'roteiro-falas.json')
        bruto = json.load(open(arq, encoding='utf-8')) if os.path.isfile(arq) else None
        receita = (bruto.get('receita') if isinstance(bruto, dict) else None) or receita_do_universo()
        timing = so_letreiros(ep) if receita == 'texto-e-musica' else previa_narracao(ep, ritmo)
    except tm.ErroRoteiro as e:
        print(e)
        sys.exit(1)
    garantir_sfx(os.path.join(ep, 'public', 'sfx'))
    tm.imprimir(timing)
