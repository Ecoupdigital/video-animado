# Grava o timing.json do vídeo: o segundo de cada batida, a partir do words.json e das palavras marcadas no roteiro
# (receita narração inteira). Nenhum tempo é digitado à mão: cada cena do roteiro tem a narração dela ("texto") e as
# batidas ("batidas": papel -> palavra do texto; "palavra#2" para a segunda vez que ela aparece na cena). O roteiro
# inteiro é casado com o words.json palavra por palavra (sem acento, sem pontuação). No modelo Neon retrô, o letreiro i
# da cena acende na palavra da batida "letreiro<i>"; as peças em "o_que", "preco", "selo", "prazo", "contagem",
# "botao" e "card". A receita só letreiros (sem voz, na batida da música) é do tempos_sem_voz.py, que usa a mesma
# conferência do roteiro (ler_roteiro) e a mesma regra do letreiro (conferir_letreiros).
#
# Uso (na raiz do universo): python3 _ferramentas/timing.py <pasta-do-video> [--fim SEGUNDOS]
#   lê  <video>/roteiro-falas.json   lista de cenas, ou { "cenas": [...], "piscada": false, "duracao_total": 15 }
#       <video>/src/words.json       [["palavra", início, fim], ...] (transcrever.py ou tempos_sem_voz.py)
#   grava <video>/src/timing.json    { cenas: [... dados + ini, fim, b], voiceEnd, total, receita, piscada }
#         <video>/src/falas.json     um trecho de narração por cena ({quem, ini, fim}), para a vitrine e a conferência
# Sai 1 dizendo a cena e o campo quando o tipo de cena não existe, quando falta o que o tipo pede, quando o preço não
# está no formato brasileiro, quando uma batida não está no texto da cena ou no words.json, e quando dois letreiros
# acendem a menos de 1 s um do outro (a piscada passaria de 3 quedas de brilho por segundo).
import difflib, json, os, re, sys, unicodedata

TAIL = 3.2  # card final depois da voz, quando o roteiro não dá a duração total
# tipos de cena do modelo Neon retrô: os campos aceitos de cada um (os obrigatórios em OBRIGATORIOS)
TIPOS = {
    'abertura': {'letreiros', 'letreiro'},
    'oferta': {'letreiros', 'letreiro', 'o_que', 'preco', 'preco_antigo', 'selo', 'prazo'},
    'contagem': {'letreiros', 'letreiro', 'forma', 'relogio', 'de', 'rotulo', 'prazo', 'texto_final'},
    'chamada': {'letreiros', 'letreiro', 'botao', 'prazo'},
    'final': {'chamada', 'fontes'},
}
OBRIGATORIOS = {'abertura': ['letreiros']}
PAPEIS = {
    'abertura': set(),
    'oferta': {'o_que', 'preco', 'selo', 'prazo'},
    'contagem': {'contagem'},
    'chamada': {'botao'},
    'final': {'card'},
}
EXTRAS = {'cenas', 'receita', 'piscada', 'duracao_total', 'bpm', 'primeira_batida', 'rotulo'}
RECEITAS = ('narracao-inteira', 'texto-e-musica')
# dois letreiros nunca acendem a menos disto um do outro (cada troca tem até 2 quedas de brilho; a regra é 3 por segundo)
LETREIRO_MIN = 1.0
MAX_SELO = 22
MAX_INTEIRO = 999999


class ErroRoteiro(Exception):
    pass


def norm(w):
    s = unicodedata.normalize('NFD', str(w)).encode('ascii', 'ignore').decode().lower()
    return ''.join(c for c in s if c.isalnum())


def tokens(texto):
    return [(p, norm(p)) for p in str(texto).split() if norm(p)]


def ler_preco(v):
    """"R$ 1.299,90", "1299,90", "R$ 89" -> {texto, centavos, comCentavos}; None se não for preço."""
    if not isinstance(v, str):
        return None
    m = re.fullmatch(r'(?:R\$\s?)?(\d{1,3}(?:\.\d{3})+|\d+)(?:,(\d{1,2}))?', v.strip())
    if not m:
        return None
    inteiro = int(m.group(1).replace('.', ''))
    if inteiro > MAX_INTEIRO:
        return None
    cent = None if m.group(2) is None else m.group(2).ljust(2, '0')
    milhar = f'{inteiro:,}'.replace(',', '.')
    return {'texto': f'R$ {milhar}' + ('' if cent is None else f',{cent}'), 'centavos': inteiro * 100 + (0 if cent is None else int(cent)), 'comCentavos': cent is not None}


def conferir_cena(i, c):
    """Confere os campos da cena e devolve os dados que vão para o timing.json (preços já lidos)."""
    tipo = c['tipo']
    onde = f'cena {i + 1} ({tipo})'
    extra = set(c) - TIPOS[tipo] - {'tipo', 'texto', 'batidas', 'compassos'}
    if extra:
        raise ErroRoteiro(f'{onde}: campo "{sorted(extra)[0]}" não existe nesta cena (aceitos: {", ".join(sorted(TIPOS[tipo]))})')
    dados = {k: v for k, v in c.items() if k not in ('texto', 'batidas', 'compassos')}
    # "letreiro" (um só) vira "letreiros" (lista)
    if 'letreiro' in dados:
        if 'letreiros' in dados:
            raise ErroRoteiro(f'{onde}: use "letreiro" (um) ou "letreiros" (lista), não os dois')
        dados['letreiros'] = [dados.pop('letreiro')]
    if 'letreiros' in dados:
        ls = dados['letreiros']
        if not isinstance(ls, list) or not ls:
            raise ErroRoteiro(f'{onde}: "letreiros" é uma lista de letreiros, cada um com 1 ou 2 linhas (ex.: [["QUEIMA DE", "ESTOQUE"]])')
        norm_ls = []
        for k, l in enumerate(ls):
            if isinstance(l, str):
                l = [l]
            if not isinstance(l, list) or not 1 <= len(l) <= 2 or not all(isinstance(x, str) and x.strip() for x in l):
                raise ErroRoteiro(f'{onde}, letreiro {k}: 1 ou 2 linhas de texto (veio {l!r})')
            norm_ls.append([x.strip() for x in l])
        dados['letreiros'] = norm_ls
    for campo in OBRIGATORIOS.get(tipo, []):
        if not dados.get(campo):
            raise ErroRoteiro(f'{onde}: falta "{campo}" (o letreiro que acende na abertura)')
    for k in ('preco', 'preco_antigo'):
        if dados.get(k) is not None:
            p = ler_preco(dados[k])
            if not p:
                raise ErroRoteiro(f'{onde}: "{k}" {dados[k]!r} não é um preço (formato brasileiro, como "R$ 1.299,90" ou "R$ 89", até R$ 999.999,99)')
            dados[k] = p
    if dados.get('preco_antigo') and dados.get('preco') and dados['preco_antigo']['centavos'] <= dados['preco']['centavos']:
        raise ErroRoteiro(f'{onde}: o preço antigo {dados["preco_antigo"]["texto"]} não é maior que o preço {dados["preco"]["texto"]}')
    if dados.get('preco_antigo') and 'preco' in c and c.get('preco') is None:
        raise ErroRoteiro(f'{onde}: "preco_antigo" sem "preco"')
    if isinstance(dados.get('selo'), str) and len(dados['selo'].strip()) > MAX_SELO:
        raise ErroRoteiro(f'{onde}: o selo "{dados["selo"]}" passa de {MAX_SELO} letras (o texto longo vai no prazo)')
    if tipo == 'contagem':
        if dados.get('forma', 'relogio') not in ('relogio', 'numeros'):
            raise ErroRoteiro(f'{onde}: "forma" é "relogio" (desce a partir do "relogio", HH:MM:SS) ou "numeros" (3, 2, 1)')
        if 'relogio' in dados and not re.fullmatch(r'(\d{1,2}:)?\d{1,2}:\d{2}', str(dados['relogio'])):
            raise ErroRoteiro(f'{onde}: "relogio" é HH:MM:SS ou MM:SS (veio {dados["relogio"]!r})')
        de = dados.get('de')
        if de is not None and (not isinstance(de, int) or isinstance(de, bool) or not 1 <= de <= 10):
            raise ErroRoteiro(f'{onde}: "de" é um número de 1 a 10 (o 3, 2, 1 começa nele)')
    if tipo == 'final' and 'fontes' in dados and (not isinstance(dados['fontes'], list) or not all(isinstance(x, str) for x in dados['fontes'])):
        raise ErroRoteiro(f'{onde}: "fontes" é uma lista de textos')
    return dados


def conferir_papeis(i, c, dados):
    """Os papéis de batida que a cena aceita: letreiro<i> (um por letreiro) e os das peças do tipo."""
    onde = f'cena {i + 1} ({c["tipo"]})'
    n = len(dados.get('letreiros') or [])
    for papel in (c.get('batidas') or {}):
        m = re.fullmatch(r'letreiro(\d+)', papel)
        if m:
            if int(m.group(1)) >= n:
                raise ErroRoteiro(f'{onde}: batida "{papel}" sem letreiro (a cena tem {n} letreiro(s){": letreiro0 a letreiro" + str(n - 1) if n else ""})')
            continue
        if papel not in PAPEIS[c['tipo']]:
            aceitos = ', '.join(sorted(PAPEIS[c['tipo']] | ({'letreiro0'} if n else set()))) or 'letreiro<i>'
            raise ErroRoteiro(f'{onde}: batida "{papel}" não existe nesta cena (aceitas: {aceitos})')


def ler_roteiro(ep, musica=False):
    """Lê e confere o roteiro. Na narração, cada cena precisa de "texto"; na música, de "compassos"."""
    arq = os.path.join(ep, 'roteiro-falas.json')
    if not os.path.isfile(arq):
        raise ErroRoteiro(f'falta {arq}: grave o roteiro com as cenas (tipo, texto ou compassos, batidas e os dados de cada tipo)')
    r = json.load(open(arq, encoding='utf-8'))
    extras = {}
    if isinstance(r, dict):
        extra = set(r) - EXTRAS
        if extra:
            raise ErroRoteiro(f'roteiro-falas.json: campo "{sorted(extra)[0]}" não existe (aceitos: {", ".join(sorted(EXTRAS))})')
        extras = {k: v for k, v in r.items() if k != 'cenas'}
        r = r.get('cenas')
    if not isinstance(r, list) or not r:
        raise ErroRoteiro('roteiro-falas.json: lista de cenas (ou { "cenas": [...] })')
    if extras.get('receita') not in (None,) + RECEITAS:
        raise ErroRoteiro(f'roteiro-falas.json: "receita" é {" ou ".join(RECEITAS)} (veio {extras["receita"]!r})')
    if 'piscada' in extras and not isinstance(extras['piscada'], bool):
        raise ErroRoteiro('roteiro-falas.json: "piscada" é true ou false (false desliga a piscada do letreiro)')
    todos = []
    for i, c in enumerate(r):
        onde = f'cena {i + 1}'
        if not isinstance(c, dict) or c.get('tipo') not in TIPOS:
            raise ErroRoteiro(f'{onde}: "tipo" precisa ser um de {", ".join(TIPOS)} (veio {c.get("tipo") if isinstance(c, dict) else c!r})')
        if musica:
            q = c.get('compassos')
            if not isinstance(q, int) or isinstance(q, bool) or q < 1:
                raise ErroRoteiro(f'{onde} ({c["tipo"]}): "compassos" é um número inteiro de 1 ou mais (na receita só letreiros, cada cena dura compassos inteiros)')
        elif not str(c.get('texto', '')).strip():
            raise ErroRoteiro(f'{onde} ({c["tipo"]}): falta "texto" (a narração desta cena)')
        if 'batidas' in c and not isinstance(c['batidas'], dict):
            raise ErroRoteiro(f'{onde}: "batidas" é um objeto papel -> {"número do tempo" if musica else "palavra"}')
        dados = conferir_cena(i, c)
        conferir_papeis(i, c, dados)
        todos.append(dados)
    if r[-1]['tipo'] != 'final':
        print('aviso: a última cena não é "final" (o card final com a chamada, a assinatura e o aviso de IA)')
    if not todos[0].get('letreiros'):
        print('aviso: a primeira cena não acende letreiro: o vídeo começa sem letreiro até a primeira cena que tiver um')
    return r, todos, extras


def instantes_letreiro(saida):
    """Os instantes em que cada letreiro acende (com o padrão de quem não tem batida: o 0 no começo, os outros espalhados)."""
    lista = []
    for i, c in enumerate(saida):
        ls = c.get('letreiros') or []
        for k in range(len(ls)):
            at = c['b'].get(f'letreiro{k}', c['ini'] if k == 0 else c['ini'] + k * (c['fim'] - c['ini']) / len(ls))
            lista.append((at, i, k))
    return sorted(lista)


def conferir_letreiros(saida):
    ls = instantes_letreiro(saida)
    for (a, ia, ka), (b, ib, kb) in zip(ls, ls[1:]):
        if b - a < LETREIRO_MIN - 1e-6:
            raise ErroRoteiro(
                f'o letreiro {kb} da cena {ib + 1} acende {b - a:.2f} s depois do letreiro {ka} da cena {ia + 1}: '
                f'dois letreiros precisam de pelo menos {LETREIRO_MIN:.0f} s entre um e outro (a piscada passaria de 3 quedas de brilho por segundo); '
                'marque a troca numa palavra mais adiante ou junte os dois num letreiro só'
            )


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


def calcular(cenas, dados, extras, words, fim=None):
    roteiro = []  # (cena, texto original, normalizado)
    for ci, c in enumerate(cenas):
        for orig, n in tokens(c['texto']):
            roteiro.append((ci, orig, n))
    par = alinhar([n for _, _, n in roteiro], [norm(w[0]) for w in words])
    ini = [words[j][1] if j is not None else None for j in par]
    fim_t = [words[j][2] if j is not None else None for j in par]
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
        saida.append({**dados[ci], 'ini': round(comeco, 3), 'fim': None, 'b': b})
        falas.append({'quem': 'narracao', 'ini': round(ini[ks[0]], 3), 'fim': round(fim_t[ks[-1]], 3)})
    for i, c in enumerate(saida):
        c['fim'] = saida[i + 1]['ini'] if i + 1 < len(saida) else round(total, 3)
    conferir_letreiros(saida)
    timing = {'cenas': saida, 'voiceEnd': voice_end, 'total': round(total, 3), 'receita': 'narracao-inteira', 'piscada': extras.get('piscada', True)}
    sem_par = sum(1 for j in par if j is None)
    return timing, falas, sem_par


def gravar(ep, fim=None):
    cenas, dados, extras = ler_roteiro(ep)
    if extras.get('receita') == 'texto-e-musica':
        raise ErroRoteiro('este roteiro é da receita só letreiros ("receita": "texto-e-musica"): rode o tempos_sem_voz.py, que põe cada peça na batida da música')
    words = ler_words(os.path.join(ep, 'src', 'words.json'))
    timing, falas, sem_par = calcular(cenas, dados, extras, words, fim)
    json.dump(timing, open(os.path.join(ep, 'src', 'timing.json'), 'w'), ensure_ascii=False, indent=1)
    json.dump(falas, open(os.path.join(ep, 'src', 'falas.json'), 'w'), ensure_ascii=False, indent=1)
    return timing, sem_par


def imprimir(timing):
    for c in timing['cenas']:
        bts = ', '.join(f'{k} {v:.2f}' for k, v in c['b'].items())
        ls = ' | '.join(' / '.join(l) for l in c.get('letreiros') or [])
        print(f'{c["tipo"]:8} {c["ini"]:6.2f} a {c["fim"]:6.2f} s{"  letreiros: " + ls if ls else ""}{"  batidas: " + bts if bts else ""}')


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
    imprimir(timing)
    print(f'voz até {timing["voiceEnd"]} s, vídeo de {timing["total"]} s ({sem_par} palavra(s) do roteiro sem par na transcrição, com tempo interpolado)')
