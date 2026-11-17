# Grava o timing.json do vídeo: o segundo de cada batida, a partir do words.json e das palavras marcadas no roteiro.
# Nenhum tempo é digitado à mão: cada cena do roteiro tem a narração dela ("texto") e as batidas
# ("batidas": papel -> palavra do texto; "palavra#2" para a segunda vez que ela aparece na cena). O roteiro
# inteiro é casado com o words.json palavra por palavra (sem acento, sem pontuação). No modelo Mesa vista de cima,
# um item por batida: o item i do passo cai na palavra da batida "item<i>". Cada item precisa existir na biblioteca
# do kit (componentes/opcoes.json, "grupos"); "lugar": "centro" só para item que vira cobertura da peça central.
#
# Uso (na raiz do universo): python3 _ferramentas/timing.py <pasta-do-video> [--fim SEGUNDOS]
#   lê  <video>/roteiro-falas.json   lista de cenas, ou { "cenas": [...], "rotulo": "...", "duracao_total": 15 }
#       <video>/src/words.json       [["palavra", início, fim], ...] (transcrever.py ou tempos_sem_voz.py)
#   grava <video>/src/timing.json    { cenas: [... dados + ini, fim, b], voiceEnd, total, rotulo }
#         <video>/src/falas.json     um trecho de narração por cena ({quem, ini, fim}), para a vitrine e a conferência
# Sai 1 dizendo a cena e a palavra quando uma batida não está no texto da cena ou não está no words.json, e dizendo
# o item (com os aceitos) quando ele não existe na biblioteca.
import difflib, json, os, sys, unicodedata

TAIL = 3.2  # card final depois da voz, quando o roteiro não dá a duração total
# tipos de cena do modelo Mesa vista de cima e os campos obrigatórios de cada um
TIPOS = {
    'abertura': ['titulo'],
    'passo': ['titulo', 'frase', 'itens'],
    'final': [],
}
ENTRADAS = ('cai', 'aparece')
LUGARES = ('mesa', 'centro')
# a mesa tem lugar para até 4 itens com etiqueta e faixa longas (até 6 com textos curtos); passou, o kit não desenha
MAX_MESA = 4
OPCOES = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'componentes', 'opcoes.json')


def biblioteca():
    """código do item -> o que ele vira sobre a peça central (camada, pedacos ou None), dos 3 grupos do opcoes.json"""
    op = json.load(open(OPCOES, encoding='utf-8'))
    return {k: v.get('no_centro') for g in op['grupos'].values() for k, v in g['itens'].items()}


def conferir_itens(i, c, lib):
    onde = f'cena {i + 1} (passo)'
    if not isinstance(c['itens'], list):
        raise ErroRoteiro(f'{onde}: "itens" é uma lista de {{"item": "...", "lugar": "mesa" ou "centro", "entrada": "cai" ou "aparece", "quantidade": n}}')
    na_mesa = 0
    for k, it in enumerate(c['itens']):
        if isinstance(it, str):
            it = c['itens'][k] = {'item': it}
        if not isinstance(it, dict) or not it.get('item'):
            raise ErroRoteiro(f'{onde}, item {k + 1}: falta "item" (o código da biblioteca)')
        cod = it['item']
        if cod not in lib:
            raise ErroRoteiro(f'{onde}, item {k + 1}: "{cod}" não está na biblioteca (aceitos: {", ".join(lib)})')
        extra = set(it) - {'item', 'lugar', 'entrada', 'quantidade'}
        if extra:
            raise ErroRoteiro(f'{onde}, item {k + 1} ({cod}): campo desconhecido "{sorted(extra)[0]}" (aceitos: item, lugar, entrada, quantidade)')
        if it.get('lugar') not in (None,) + LUGARES:
            raise ErroRoteiro(f'{onde}, item {k + 1} ({cod}): "lugar" é "mesa" ou "centro" (veio {it.get("lugar")!r})')
        if it.get('lugar') == 'centro' and not lib[cod]:
            aceitos = ', '.join(x for x, v in lib.items() if v)
            raise ErroRoteiro(f'{onde}, item {k + 1}: "{cod}" não vira cobertura da peça central, só cai na mesa (sobre a peça central: {aceitos})')
        if it.get('entrada') not in (None,) + ENTRADAS:
            raise ErroRoteiro(f'{onde}, item {k + 1} ({cod}): "entrada" é "cai" ou "aparece" (veio {it.get("entrada")!r})')
        q = it.get('quantidade')
        if q is not None and (not isinstance(q, int) or isinstance(q, bool) or q < 1 or q > 12):
            raise ErroRoteiro(f'{onde}, item {k + 1} ({cod}): "quantidade" é um número de 1 a 12 (na mesa, até 6)')
        lugar = it.get('lugar') or ('centro' if lib[cod] else 'mesa')
        if lugar == 'mesa':
            na_mesa += 1
    for papel in (c.get('batidas') or {}):
        if papel.startswith('item') and papel[4:].isdigit() and int(papel[4:]) >= len(c['itens']):
            raise ErroRoteiro(f'{onde}: batida "{papel}" sem item (o passo tem {len(c["itens"])} item(ns): item0 a item{len(c["itens"]) - 1})')
    if na_mesa > MAX_MESA:
        print(f'aviso: {onde}: {na_mesa} itens na mesa; com etiqueta e faixa longas cabem {MAX_MESA} (o que não couber não aparece): divida o passo em dois')


class ErroRoteiro(Exception):
    pass


def norm(w):
    s = unicodedata.normalize('NFD', str(w)).encode('ascii', 'ignore').decode().lower()
    return ''.join(c for c in s if c.isalnum())


def tokens(texto):
    return [(p, norm(p)) for p in str(texto).split() if norm(p)]


def ler_roteiro(ep):
    arq = os.path.join(ep, 'roteiro-falas.json')
    if not os.path.isfile(arq):
        raise ErroRoteiro(f'falta {arq}: grave o roteiro com as cenas (tipo, texto, batidas e os dados de cada tipo)')
    r = json.load(open(arq, encoding='utf-8'))
    extras = {}
    if isinstance(r, dict):
        extras = {k: v for k, v in r.items() if k != 'cenas'}
        r = r.get('cenas')
    if not isinstance(r, list) or not r:
        raise ErroRoteiro('roteiro-falas.json: lista de cenas (ou { "cenas": [...] })')
    for i, c in enumerate(r):
        onde = f'cena {i + 1}'
        if not isinstance(c, dict) or c.get('tipo') not in TIPOS:
            raise ErroRoteiro(f'{onde}: "tipo" precisa ser um de {", ".join(TIPOS)}')
        if not str(c.get('texto', '')).strip():
            raise ErroRoteiro(f'{onde} ({c["tipo"]}): falta "texto" (a narração desta cena)')
        for campo in TIPOS[c['tipo']]:
            if c.get(campo) in (None, '', []):
                raise ErroRoteiro(f'{onde} ({c["tipo"]}): falta "{campo}"')
        if 'batidas' in c and not isinstance(c['batidas'], dict):
            raise ErroRoteiro(f'{onde}: "batidas" é um objeto papel -> palavra')
    lib = biblioteca()
    for i, c in enumerate(r):
        if c['tipo'] == 'passo':
            conferir_itens(i, c, lib)
            for campo in ('numero', 'de'):
                v = c.get(campo)
                if v is not None and (not isinstance(v, int) or isinstance(v, bool) or v < 1 or v > 99):
                    raise ErroRoteiro(f'cena {i + 1} (passo): "{campo}" é um número de 1 a 99')
    if r[-1]['tipo'] != 'final':
        print('aviso: a última cena não é "final" (a pergunta e o card final com a assinatura, as fontes e o aviso de IA)')
    if r[0]['tipo'] == 'passo':
        print('aviso: o vídeo começa num passo: o primeiro quadro (a capa do reel) já mostra a etiqueta do passo 1')
    return r, extras


def ler_words(arq):
    if not os.path.isfile(arq):
        raise ErroRoteiro(f'falta {arq}: rode o transcrever.py (narração) ou o tempos_sem_voz.py (prévia)')
    bruto = json.load(open(arq, encoding='utf-8'))
    words = []
    for w in bruto:
        if isinstance(w, dict):
            words.append((str(w.get('texto', w.get('w', ''))), float(w['inicio']), float(w['fim'])))
        else:
            words.append((str(w[0]), float(w[1]), float(w[2])))
    if not words:
        raise ErroRoteiro(f'{arq} está vazio')
    # o Whisper às vezes separa a palavra com hífen ("recém" e "-nascido"): junta com a anterior, como no roteiro
    juntas = []
    for w in words:
        if juntas and w[0].startswith('-') and len(w[0]) > 1:
            p = juntas[-1]
            juntas[-1] = (p[0] + w[0], p[1], w[2])
        else:
            juntas.append(w)
    return juntas


def alinhar(a, b):
    """Índice em b de cada token de a (ou None), casando as sequências; troca de mesmo tamanho casa por semelhança."""
    sm = difflib.SequenceMatcher(None, a, b, autojunk=False)
    par = [None] * len(a)
    for op, i1, i2, j1, j2 in sm.get_opcodes():
        if op == 'equal':
            for k in range(i2 - i1):
                par[i1 + k] = j1 + k
        elif op == 'replace' and i2 - i1 == j2 - j1:
            for k in range(i2 - i1):
                if difflib.SequenceMatcher(None, a[i1 + k], b[j1 + k]).ratio() >= 0.6:
                    par[i1 + k] = j1 + k
    return par


def calcular(cenas, extras, words, fim=None):
    roteiro = []  # (cena, texto original, normalizado)
    for ci, c in enumerate(cenas):
        for orig, n in tokens(c['texto']):
            roteiro.append((ci, orig, n))
    par = alinhar([n for _, _, n in roteiro], [norm(w[0]) for w in words])
    ini = [words[j][1] if j is not None else None for j in par]
    fim_t = [words[j][2] if j is not None else None for j in par]
    # palavra do roteiro sem par na transcrição: tempo interpolado entre as vizinhas casadas
    casadas = [k for k, j in enumerate(par) if j is not None]
    if not casadas:
        raise ErroRoteiro('nenhuma palavra do roteiro casou com o words.json: o áudio é deste roteiro?')
    for k in range(len(roteiro)):
        if ini[k] is None:
            antes = max([x for x in casadas if x < k], default=None)
            depois = min([x for x in casadas if x > k], default=None)
            a = fim_t[antes] if antes is not None else 0.0
            b = ini[depois] if depois is not None else words[-1][2]
            na = antes if antes is not None else -1
            nb = depois if depois is not None else len(roteiro)
            frac = (k - na) / (nb - na)
            ini[k] = a + (b - a) * frac
            fim_t[k] = ini[k] + 0.05
    voice_end = round(words[-1][2], 3)
    total = float(fim if fim is not None else extras.get('duracao_total') or voice_end + TAIL)
    saida, falas = [], []
    pos = {}
    for k, (ci, _, _) in enumerate(roteiro):
        pos.setdefault(ci, []).append(k)
    for ci, c in enumerate(cenas):
        ks = pos.get(ci, [])
        if not ks:
            raise ErroRoteiro(f'cena {ci + 1} ({c["tipo"]}): o texto não tem palavras')
        nomes = [roteiro[k][2] for k in ks]
        b = {}
        for papel, palavra in (c.get('batidas') or {}).items():
            alvo, _, n = str(palavra).partition('#')
            alvo_n = norm(alvo.split()[0]) if alvo.split() else ''
            vez = int(n) if n.isdigit() else 1
            achadas = [k for k, x in zip(ks, nomes) if x == alvo_n]
            if len(achadas) < vez:
                raise ErroRoteiro(f'batida "{papel}" da cena {ci + 1} ({c["tipo"]}): a palavra "{palavra}" não está no texto da cena')
            k = achadas[vez - 1]
            if par[k] is None:
                raise ErroRoteiro(f'batida "{papel}" da cena {ci + 1} ({c["tipo"]}): a palavra "{palavra}" não está no words.json (a transcrição não tem essa palavra nesse ponto; confira o texto da cena ou corrija o words.json)')
            b[papel] = round(ini[k], 3)
        comeco = 0.0 if ci == 0 else max(saida[-1]['ini'] + 0.3, ini[ks[0]] - 0.12)
        dados = {k: v for k, v in c.items() if k not in ('texto', 'batidas')}
        saida.append({**dados, 'ini': round(comeco, 3), 'fim': None, 'b': b})
        falas.append({'quem': 'narracao', 'ini': round(ini[ks[0]], 3), 'fim': round(fim_t[ks[-1]], 3)})
    for i, c in enumerate(saida):
        c['fim'] = saida[i + 1]['ini'] if i + 1 < len(saida) else round(total, 3)
    timing = {'cenas': saida, 'voiceEnd': voice_end, 'total': round(total, 3)}
    if extras.get('rotulo'):
        timing['rotulo'] = extras['rotulo']
    sem_par = sum(1 for j in par if j is None)
    return timing, falas, sem_par


def gravar(ep, fim=None):
    cenas, extras = ler_roteiro(ep)
    words = ler_words(os.path.join(ep, 'src', 'words.json'))
    timing, falas, sem_par = calcular(cenas, extras, words, fim)
    json.dump(timing, open(os.path.join(ep, 'src', 'timing.json'), 'w'), ensure_ascii=False, indent=1)
    json.dump(falas, open(os.path.join(ep, 'src', 'falas.json'), 'w'), ensure_ascii=False, indent=1)
    return timing, sem_par


if __name__ == '__main__':
    args = sys.argv[1:]
    fim = None
    if '--fim' in args:
        i = args.index('--fim')
        fim = float(args[i + 1])
        args = args[:i] + args[i + 2:]
    if len(args) != 1:
        sys.exit('Uso: python3 _ferramentas/timing.py <pasta-do-video> [--fim SEGUNDOS]')
    try:
        timing, sem_par = gravar(args[0], fim)
    except ErroRoteiro as e:
        print(e)
        sys.exit(1)
    for c in timing['cenas']:
        bts = ', '.join(f'{k} {v:.2f}' for k, v in c['b'].items())
        itens = ', '.join(i['item'] for i in c.get('itens', []))
        print(f'{c["tipo"]:8} {c["ini"]:6.2f} a {c["fim"]:6.2f} s{"  itens: " + itens if itens else ""}{"  batidas: " + bts if bts else ""}')
    print(f'voz até {timing["voiceEnd"]} s, vídeo de {timing["total"]} s ({sem_par} palavra(s) do roteiro sem par na transcrição, com tempo interpolado)')
