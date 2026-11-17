# Roteiro do vídeo pixel: leitura, conferência e os arquivos de dados do episódio.
# Usado pelo tempos_sem_voz.py (prévia sem voz) e pelo dados.py (voz de verdade). Formato do roteiro-falas.json:
#   { "secoes": [ { "texto": "o que a voz fala nesta seção", "titulo": ["linha 1", "linha 2"], "destaque": ["palavra"],
#                   "legenda": ["palavra"], "gesto": "nada|uma|duas|ombros",
#                   "card": { "molde": "lista|conversa|selo|blocos", "rotulo": "// ...", ... com "em": "palavra" } } ],
#     "final": { "duracao": 3, "titulo": ["..."], "gesto": "uma" } }
# Cada "em" é uma palavra (ou palavras seguidas) do texto da própria seção: o elemento entra quando ela é falada.
import json
import os
import re
import shutil
import unicodedata

GESTOS = ['nada', 'uma', 'duas', 'ombros']
MOLDES = ['lista', 'conversa', 'selo', 'blocos']


class ErroRoteiro(Exception):
    pass


def norm(w):
    w = unicodedata.normalize('NFD', str(w)).lower()
    return re.sub(r'[^a-z0-9]', '', ''.join(c for c in w if unicodedata.category(c) != 'Mn'))


def palavras_de(texto):
    return [w for w in str(texto).split() if w]


def _tem(texto, em):
    ws = [norm(w) for w in palavras_de(texto)]
    alvo = [norm(w) for w in palavras_de(em) if norm(w)]
    if not alvo:
        return False
    return any(ws[i:i + len(alvo)] == alvo for i in range(len(ws) - len(alvo) + 1))


def conferir(r):
    erros = []
    if not isinstance(r, dict) or not isinstance(r.get('secoes'), list) or not r['secoes']:
        raise ErroRoteiro('roteiro-falas.json: precisa de "secoes" com ao menos uma seção')
    for k, s in enumerate(r['secoes'], 1):
        onde = f'seção {k}'
        if not isinstance(s, dict):
            erros.append(f'{onde}: objeto')
            continue
        if not isinstance(s.get('texto'), str) or not s['texto'].strip():
            erros.append(f'{onde}: falta "texto" (o que a voz fala)')
            continue
        t = s.get('titulo')
        if not isinstance(t, list) or not 1 <= len(t) <= 3 or any(not isinstance(x, str) or not x.strip() for x in t):
            erros.append(f'{onde}: "titulo" é uma lista de 1 a 3 linhas (o normal são 2)')
        if s.get('gesto', 'uma') not in GESTOS:
            erros.append(f'{onde}: gesto "{s.get("gesto")}" não existe (aceitos: {", ".join(GESTOS)})')
        c = s.get('card')
        if not isinstance(c, dict) or c.get('molde') not in MOLDES:
            erros.append(f'{onde}: "card" com "molde" ({", ".join(MOLDES)})')
            continue
        m = c['molde']
        listas = {'lista': ('itens', 'texto'), 'conversa': ('mensagens', 'texto'), 'blocos': ('blocos', 'valor')}
        ems = []
        if m in listas:
            campo, txt = listas[m]
            itens = c.get(campo)
            if not isinstance(itens, list) or not itens:
                erros.append(f'{onde} (card {m}): falta "{campo}" com ao menos um elemento')
                itens = []
            maximo = {'lista': 5, 'conversa': 3, 'blocos': 4}[m]
            if len(itens) > maximo:
                erros.append(f'{onde} (card {m}): no máximo {maximo} em "{campo}" (vieram {len(itens)})')
            for i, it in enumerate(itens, 1):
                if not isinstance(it, dict) or not isinstance(it.get(txt), str) or not it[txt].strip():
                    erros.append(f'{onde} (card {m}, {campo} {i}): falta "{txt}"')
                    continue
                if m == 'conversa' and not str(it.get('quem', '')).strip():
                    erros.append(f'{onde} (card conversa, mensagem {i}): falta "quem"')
                if m == 'blocos' and not str(it.get('rotulo', '')).strip():
                    erros.append(f'{onde} (card blocos, bloco {i}): falta "rotulo"')
                ems.append((f'{campo} {i}', it.get('em')))
        if m == 'selo':
            for campo in ('titulo', 'selo'):
                if not isinstance(c.get(campo), str) or not c[campo].strip():
                    erros.append(f'{onde} (card selo): falta "{campo}"')
            ems.append(('selo', c.get('em')))
            for i, e in enumerate(c.get('etiquetas') or [], 1):
                ems.append((f'etiqueta {i}', e.get('em') if isinstance(e, dict) else None))
        for qual, em in ems:
            if em is not None and not _tem(s['texto'], em):
                erros.append(f'{onde} (card {m}, {qual}): a palavra "{em}" não está no texto da seção')
    fin = r.get('final') or {}
    if 'duracao' in fin and (not isinstance(fin['duracao'], (int, float)) or not 1 <= fin['duracao'] <= 6):
        erros.append('final.duracao: segundos do card final, de 1 a 6')
    if fin.get('gesto', 'uma') not in GESTOS:
        erros.append(f'final.gesto: "{fin.get("gesto")}" não existe (aceitos: {", ".join(GESTOS)})')
    if erros:
        raise ErroRoteiro('roteiro-falas.json com problema:\n  ' + '\n  '.join(erros))
    return r


def ler(ep):
    arq = os.path.join(ep, 'roteiro-falas.json')
    if not os.path.isfile(arq):
        raise ErroRoteiro(f'falta {arq} (as seções do vídeo)')
    try:
        r = json.load(open(arq, encoding='utf-8'))
    except ValueError as e:
        raise ErroRoteiro(f'{arq}: JSON inválido ({e})')
    return conferir(r)


def todas_palavras(r):
    return [w for s in r['secoes'] for w in palavras_de(s['texto'])]


def gravar(ep, r, palavras, bocas, fim, caminho):
    """palavras: [(palavra, início, fim)] na ordem do roteiro; bocas: [[ini, fim, forma]]."""
    src = os.path.join(ep, 'src')
    os.makedirs(src, exist_ok=True)
    pal = [{'i': i, 'w': w, 's': round(s, 2)} for i, (w, s, _) in enumerate(palavras)]
    with open(os.path.join(src, 'dados.ts'), 'w', encoding='utf-8') as f:
        f.write(f'// Gerado por _ferramentas/{caminho_script(caminho)}. Não edite à mão: rode de novo.\n')
        f.write(f'// Bocas pelo caminho: {caminho}.\n')
        f.write(f'export const CAMINHO: string = {json.dumps(caminho)};\n')
        f.write('export const PALAVRAS: { i: number; w: string; s: number }[] = ' + json.dumps(pal, ensure_ascii=False) + ';\n')
        f.write('export const BOCAS: [number, number, string][] = ' + json.dumps([[round(a, 3), round(b, 3), c] for a, b, c in bocas]) + ';\n')
        f.write(f'export const FIM: number = {round(fim, 2)};\n')
    json.dump(r, open(os.path.join(src, 'roteiro.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    falas = []
    i = 0
    for s in r['secoes']:
        n = len(palavras_de(s['texto']))
        ws = palavras[i:i + n]
        i += n
        if ws:
            falas.append({'quem': 'narracao', 'ini': round(ws[0][1], 3), 'fim': round(ws[-1][2], 3), 'texto': s['texto']})
    json.dump(falas, open(os.path.join(src, 'falas.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    return falas


def caminho_script(caminho):
    return 'tempos_sem_voz.py' if caminho == 'sintetico' else 'dados.py'


def preparar_public(ep):
    """Sprites do boneco (public/px do universo) e sons (public/sons) na pasta public/ do vídeo."""
    import sys
    raiz = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    px = os.path.join(raiz, 'public', 'px')
    if not os.path.isdir(px) or len(os.listdir(px)) < 72:
        raise ErroRoteiro('faltam os 72 sprites em public/px/ do universo: rode novo_universo.mjs --aplicar ou python3 gerador/sprites.py aparencia.json public/px')
    destino = os.path.join(ep, 'public', 'px')
    os.makedirs(destino, exist_ok=True)
    for n in os.listdir(px):
        shutil.copyfile(os.path.join(px, n), os.path.join(destino, n))
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    from gerar_sfx import garantir_sfx
    garantir_sfx(os.path.join(ep, 'public', 'sons'))
