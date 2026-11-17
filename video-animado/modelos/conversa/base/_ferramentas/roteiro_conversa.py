# Roteiro da Conversa no celular: lê <pasta-do-video>/roteiro-falas.json, confere contra o universo e grava a versão
# normalizada em <pasta-do-video>/src/roteiro.json (o episódio lê dela). Usado pelo tempos_sem_voz.py e pelo
# montar_audio.py. Formato do roteiro-falas.json:
#   { "receita": "texto-e-musica" ou "vozes-por-fala" (opcional; sem ela, a do respostas.json),
#     "cenas": [ { "tipo": "abertura" | "conversa" | "rolagem" | "fecho",
#                  "titulo": "A encomenda de *última hora*" (opcional; a palavra entre asteriscos sai destacada),
#                  "legenda": "Sexta, 20h" (opcional),
#                  "mensagens": [ { "quem": "<id>", "texto": "...", "tipo": "texto" | "audio" | "imagem",
#                                   "imagem": "<desenho>", "duracao": "0:07", "reacao": "<reação>",
#                                   "horario": "20:15", "lido": true, "sem_voz": true } ] } ] }
# Conferido: cada "quem" é o id (ou o nome) de um dos 2 lados do universo (respostas.json), o tipo de cena, o tipo de
# mensagem, a imagem e a reação estão nas listas do componentes/opcoes.json, a receita está entre as do modelo.
# Erro: sai 1 dizendo o que e onde, com os aceitos.
import json, os, re, sys, unicodedata

TIPOS_CENA = ['abertura', 'conversa', 'rolagem', 'fecho']
RECEITAS = ['vozes-por-fala', 'texto-e-musica']
CAMPOS = ['quem', 'texto', 'tipo', 'imagem', 'duracao', 'reacao', 'horario', 'lido', 'sem_voz']


def raiz_do_universo(pasta):
    d = os.path.abspath(pasta)
    while not os.path.isfile(os.path.join(d, 'respostas.json')):
        pai = os.path.dirname(d)
        if pai == d:
            return None
        d = pai
    return d


def simples(t):
    return ''.join(c for c in unicodedata.normalize('NFD', str(t)) if unicodedata.category(c) != 'Mn').lower().replace(' ', '-')


def universo(pasta):
    """Os 2 lados (id, nome, lado), a receita padrão e as opções do kit, lidos do universo."""
    raiz = raiz_do_universo(pasta)
    if raiz is None:
        return None
    r = json.load(open(os.path.join(raiz, 'respostas.json'), encoding='utf-8'))
    op_arq = os.path.join(raiz, 'componentes', 'opcoes.json')
    op = json.load(open(op_arq, encoding='utf-8')) if os.path.isfile(op_arq) else {}
    pessoas = [{'id': p.get('id'), 'nome': p.get('nome') or '', 'lado': p.get('lado')} for p in r.get('personagens', [])]
    return {'pessoas': pessoas, 'receita': r.get('receita') or 'vozes-por-fala', 'opcoes': op}


def id_de(quem, u):
    """O id do lado pelo "quem" (o id ou o nome sem acento), ou None."""
    for p in u['pessoas']:
        if quem == p['id'] or simples(quem) == simples(p['nome']):
            return p['id']
    return None


def falhar(msg):
    sys.exit(msg)


def ler(pasta):
    """Lê, confere e normaliza o roteiro. Devolve (roteiro, receita, mensagens em ordem, universo)."""
    arq = os.path.join(pasta, 'roteiro-falas.json')
    if not os.path.isfile(arq):
        falhar(f'falta {arq}: grave o roteiro como {{"cenas": [{{"tipo": "abertura", "titulo": "...", "mensagens": [{{"quem": "<id>", "texto": "..."}}]}}]}}')
    try:
        rot = json.load(open(arq, encoding='utf-8'))
    except ValueError as e:
        falhar(f'roteiro-falas.json: JSON inválido ({e})')
    if not isinstance(rot, dict) or not isinstance(rot.get('cenas'), list) or not rot['cenas']:
        falhar('roteiro-falas.json: objeto com "cenas" (lista de cenas, cada uma com "tipo" e "mensagens")')
    u = universo(pasta)
    if u is None:
        falhar('não achei o respostas.json do universo acima da pasta do vídeo')
    op = u['opcoes']
    imagens = list((op.get('imagens') or {}).keys())
    reacoes = list((op.get('reacoes') or {}).keys())
    tipos_msg = op.get('tipos_mensagem') or ['texto', 'audio', 'imagem']
    receita = rot.get('receita') or u['receita']
    if receita not in RECEITAS:
        falhar(f'roteiro-falas.json: receita "{receita}" não existe neste modelo (aceitas: {", ".join(RECEITAS)})')
    aceitos = ', '.join(p['id'] for p in u['pessoas'])
    msgs = []
    cenas = []
    for ci, c in enumerate(rot['cenas']):
        onde_c = f'roteiro-falas.json, cena {ci + 1}'
        if not isinstance(c, dict):
            falhar(f'{onde_c}: objeto com "tipo" e "mensagens"')
        tipo = c.get('tipo', 'conversa')
        if tipo not in TIPOS_CENA:
            falhar(f'{onde_c}: tipo "{tipo}" não existe (aceitos: {", ".join(TIPOS_CENA)})')
        for k in ('titulo', 'legenda'):
            if c.get(k) is not None and not str(c.get(k)).strip():
                falhar(f'{onde_c}: "{k}" vazio (tire o campo ou escreva o texto)')
        nova = {'tipo': tipo, 'titulo': c.get('titulo'), 'legenda': c.get('legenda'), 'mensagens': []}
        lista = c.get('mensagens') or []
        if not isinstance(lista, list):
            falhar(f'{onde_c}: "mensagens" é lista')
        for mi, m in enumerate(lista):
            onde = f'{onde_c}, mensagem {mi + 1}'
            if not isinstance(m, dict):
                falhar(f'{onde}: objeto com "quem" e "texto"')
            for k in m:
                if k not in CAMPOS:
                    falhar(f'{onde}: campo desconhecido "{k}" (aceitos: {", ".join(CAMPOS)})')
            quem = m.get('quem')
            pid = id_de(quem, u) if quem else None
            if pid is None:
                falhar(f'{onde}: "{quem}" não é um dos 2 lados deste universo (aceitos: {aceitos})')
            tm = m.get('tipo', 'texto')
            if tm not in tipos_msg:
                falhar(f'{onde}: tipo "{tm}" não existe (aceitos: {", ".join(tipos_msg)})')
            texto = m.get('texto')
            if tm == 'texto' and not str(texto or '').strip():
                falhar(f'{onde}: mensagem de texto sem "texto"')
            if tm == 'imagem' and m.get('imagem') not in imagens:
                falhar(f'{onde}: imagem "{m.get("imagem")}" não existe (aceitas: {", ".join(imagens)})')
            if m.get('reacao') is not None and m.get('reacao') not in reacoes:
                falhar(f'{onde}: reação "{m.get("reacao")}" não existe (aceitas: {", ".join(reacoes)})')
            if m.get('duracao') is not None and not re.match(r'^\d{1,2}:[0-5]\d$', str(m.get('duracao'))):
                falhar(f'{onde}: duracao "{m.get("duracao")}" no formato M:SS (ex.: 0:07)')
            if m.get('horario') is not None and not re.match(r'^([01]\d|2[0-3]):[0-5]\d$', str(m.get('horario'))):
                falhar(f'{onde}: horario "{m.get("horario")}" no formato HH:MM')
            for k in ('lido', 'sem_voz'):
                if m.get(k) is not None and not isinstance(m.get(k), bool):
                    falhar(f'{onde}: "{k}" é true ou false')
            n = {k: v for k, v in m.items() if v is not None}
            n['quem'] = pid
            n['tipo'] = tm
            nova['mensagens'].append(n)
            msgs.append(n)
        cenas.append(nova)
    if not msgs:
        falhar('roteiro-falas.json: nenhuma mensagem nas cenas')
    return {'receita': receita, 'cenas': cenas}, receita, msgs, u


def gravar(pasta, roteiro):
    os.makedirs(os.path.join(pasta, 'src'), exist_ok=True)
    json.dump(roteiro, open(os.path.join(pasta, 'src', 'roteiro.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
